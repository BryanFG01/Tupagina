namespace TuNegocio.API.Domain.Entities;

public class MediaAsset
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string LandingId { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty; // 'product', 'block', 'gallery'
    public string EntityId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int SortOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Landing Landing { get; set; } = null!;
}
