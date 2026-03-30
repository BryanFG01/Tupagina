namespace TuNegocio.API.Domain.Entities;

public class CustomDomain
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string LandingId { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string Status { get; set; } = "unverified";
    public string SslStatus { get; set; } = "pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Landing Landing { get; set; } = null!;
}
