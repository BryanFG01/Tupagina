namespace TuNegocio.API.Domain.Entities;

public class ShippingZone
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string LandingId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal BaseCost { get; set; }
    public decimal? FreeShippingThreshold { get; set; }
    public string? EstimatedDays { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Landing Landing { get; set; } = null!;
}
