using Microsoft.AspNetCore.Mvc;
using TuNegocio.API.Application.Services;

namespace TuNegocio.API.API.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhooksController : ControllerBase
{
    private readonly PaymentService _paymentService;
    private readonly ILogger<WebhooksController> _logger;

    public WebhooksController(PaymentService paymentService, ILogger<WebhooksController> logger)
    {
        _paymentService = paymentService;
        _logger = logger;
    }

    /// <summary>
    /// POST /api/webhooks/stripe — Stripe firma el payload. Acceso público.
    /// IMPORTANTE: Leer el body como string raw (no JSON) para validar la firma HMAC.
    /// </summary>
    [HttpPost("stripe")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> StripeWebhook()
    {
        // Leer el body raw — necesario para verificar la firma de Stripe
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync();

        var stripeSignature = Request.Headers["Stripe-Signature"].FirstOrDefault();
        if (string.IsNullOrEmpty(stripeSignature))
            return BadRequest(new { message = "Stripe-Signature header faltante." });

        try
        {
            await _paymentService.HandleStripeWebhookAsync(json, stripeSignature);
            return Ok(new { received = true });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Webhook Stripe inválido: {Error}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error procesando webhook de Stripe.");
            return StatusCode(500, new { message = "Error interno procesando el webhook." });
        }
    }
}
