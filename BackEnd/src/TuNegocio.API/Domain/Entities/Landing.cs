namespace TuNegocio.API.Domain.Entities;

public class Landing
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Blocks { get; set; }  // JSONB stored as string
    public bool Published { get; set; } = false;
    public string? ThemeConfig { get; set; }  // JSONB
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User User { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();

    // New relations based on 100% dynamics analysis
    public ICollection<PaymentIntegration> PaymentIntegrations { get; set; } = new List<PaymentIntegration>();
    public ICollection<MediaAsset> MediaAssets { get; set; } = new List<MediaAsset>();
    public ICollection<Coupon> Coupons { get; set; } = new List<Coupon>();
    public ICollection<ShippingZone> ShippingZones { get; set; } = new List<ShippingZone>();
    public ICollection<CustomDomain> CustomDomains { get; set; } = new List<CustomDomain>();
    public SeoMetadata? SeoMetadata { get; set; }
}
