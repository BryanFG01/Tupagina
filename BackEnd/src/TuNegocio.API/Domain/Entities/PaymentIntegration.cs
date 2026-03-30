namespace TuNegocio.API.Domain.Entities;

public class PaymentIntegration
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string LandingId { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty; // 'stripe' or 'mercadopago'
    public string AccessToken { get; set; } = string.Empty; // Token or Stripe Account ID (acct_xxx)
    public string? PublicKey { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Landing Landing { get; set; } = null!;
}
