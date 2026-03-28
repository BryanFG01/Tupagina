using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using TuNegocio.API.Application.DTOs;
using TuNegocio.API.Domain.Entities;
using TuNegocio.API.Domain.Interfaces;

namespace TuNegocio.API.Application.Services;

public class PaymentService
{
    private readonly ILandingRepository _landingRepo;
    private readonly IProductRepository _productRepo;
    private readonly IOrderRepository _orderRepo;
    private readonly IConfiguration _config;

    public PaymentService(
        ILandingRepository landingRepo,
        IProductRepository productRepo,
        IOrderRepository orderRepo,
        IConfiguration config)
    {
        _landingRepo = landingRepo;
        _productRepo = productRepo;
        _orderRepo = orderRepo;
        _config = config;

        StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];
    }

    /// <summary>
    /// Crea una sesión de Stripe Checkout.
    /// Flujo: Validar productos → Snapshot de precio/nombre → Crear Order → Crear sesión Stripe.
    /// </summary>
    public async Task<CheckoutResponse> CreateCheckoutSessionAsync(CheckoutRequest request)
    {
        // 1. Validar que la landing exista y esté publicada
        var landing = await _landingRepo.GetBySlugAsync(request.LandingSlug)
            ?? throw new KeyNotFoundException("Landing no encontrada.");

        if (!landing.Published)
            throw new InvalidOperationException("Esta tienda no está disponible.");

        // 2. Validar productos y stock
        var lineItems = new List<SessionLineItemOptions>();
        var orderItems = new List<OrderItem>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId)
                ?? throw new KeyNotFoundException($"Producto {item.ProductId} no encontrado.");

            if (!product.IsActive)
                throw new InvalidOperationException($"El producto '{product.Name}' no está disponible.");

            if (product.Stock < item.Quantity)
                throw new InvalidOperationException(
                    $"Stock insuficiente para '{product.Name}'. Disponible: {product.Stock}, solicitado: {item.Quantity}.");

            // 3. Snapshot: guardar nombre y precio al momento de la compra
            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPriceSnapshot = product.Price,
                ProductNameSnapshot = product.Name,
            });

            totalAmount += product.Price * item.Quantity;

            lineItems.Add(new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmountDecimal = product.Price * 100, // Stripe usa centavos
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = product.Name,
                        Description = product.Description,
                    }
                },
                Quantity = item.Quantity
            });
        }

        // 4. Crear la Order en BD con estado "pending"
        var orderId = Guid.NewGuid().ToString();
        var clientReference = $"order_{orderId}";

        var order = new Order
        {
            Id = orderId,
            LandingId = landing.Id,
            CustomerEmail = request.CustomerEmail,
            CustomerName = request.CustomerName,
            TotalAmount = totalAmount,
            Status = "pending",
            ClientReference = clientReference,
            Items = orderItems,
        };

        await _orderRepo.CreateAsync(order);

        // 5. Crear sesión Stripe con client_reference_id = "order_{guid}"
        var sessionOptions = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItems,
            Mode = "payment",
            CustomerEmail = request.CustomerEmail,
            ClientReferenceId = clientReference, // "order_{guid}" — identificado en el Webhook
            SuccessUrl = request.SuccessUrl,
            CancelUrl = request.CancelUrl,
        };

        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(sessionOptions);

        // Guardar el sessionId de Stripe en la Order
        order.StripeSessionId = session.Id;
        await _orderRepo.UpdateAsync(order);

        return new CheckoutResponse(session.Id, session.Url);
    }

    /// <summary>
    /// Procesa el evento checkout.session.completed de Stripe.
    /// Actualiza el estado de la Order a "paid".
    /// </summary>
    public async Task HandleStripeWebhookAsync(string json, string stripeSignature)
    {
        var webhookSecret = _config["Stripe:WebhookSecret"]
            ?? throw new InvalidOperationException("Stripe WebhookSecret no configurado.");

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);
        }
        catch (StripeException ex)
        {
            throw new UnauthorizedAccessException($"Firma de Stripe inválida: {ex.Message}");
        }

        if (stripeEvent.Type == Events.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Session;
            if (session == null) return;

            var clientRef = session.ClientReferenceId; // "order_{guid}"
            if (string.IsNullOrEmpty(clientRef)) return;

            var order = await _orderRepo.GetByClientReferenceAsync(clientRef);
            if (order == null) return;

            order.Status = "paid";
            order.StripePaymentIntentId = session.PaymentIntentId;
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepo.UpdateAsync(order);
        }
        else if (stripeEvent.Type == Events.CheckoutSessionExpired)
        {
            var session = stripeEvent.Data.Object as Session;
            if (session?.ClientReferenceId == null) return;

            var order = await _orderRepo.GetByClientReferenceAsync(session.ClientReferenceId);
            if (order == null) return;

            order.Status = "cancelled";
            order.UpdatedAt = DateTime.UtcNow;
            await _orderRepo.UpdateAsync(order);
        }
    }
}
