namespace TuNegocio.API.Domain.Entities;

public class Coupon
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string LandingId { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty; // 'percentage' or 'fixed'
    public decimal DiscountValue { get; set; }
    public int? MaxUses { get; set; }
    public int UsedCount { get; set; } = 0;
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Landing Landing { get; set; } = null!;
}
