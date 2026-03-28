namespace TuNegocio.API.Domain.Entities;

public class OrderItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string OrderId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; }

    // Snapshot: price and name at the moment of purchase
    public decimal UnitPriceSnapshot { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty;

    // Navigation
    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
