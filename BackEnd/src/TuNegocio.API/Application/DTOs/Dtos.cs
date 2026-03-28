namespace TuNegocio.API.Application.DTOs;

// ── Auth ──────────────────────────────────────────────
public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, string UserId, string Name, string Email, string Role);

// ── Landing ───────────────────────────────────────────
public record CreateLandingRequest(string Title, string? Description);

public record UpdateLandingRequest(
    string? Title,
    string? Description,
    string? Blocks,
    bool? Published,
    string? ThemeConfig
);

public record LandingResponse(
    string Id,
    string Title,
    string Slug,
    string? Description,
    string? Blocks,
    bool Published,
    string? ThemeConfig,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

// ── Product ───────────────────────────────────────────
public record CreateProductRequest(
    string LandingId,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    string? ImageUrl
);

public record UpdateProductRequest(
    string? Name,
    string? Description,
    decimal? Price,
    int? Stock,
    bool? IsActive,
    string? ImageUrl
);

public record ProductResponse(
    string Id,
    string LandingId,
    string Name,
    string? Description,
    decimal Price,
    int Stock,
    bool IsActive,
    string? ImageUrl
);

// ── Checkout ──────────────────────────────────────────
public record CheckoutItemRequest(string ProductId, int Quantity);

public record CheckoutRequest(
    string LandingSlug,
    string CustomerEmail,
    string CustomerName,
    List<CheckoutItemRequest> Items,
    string SuccessUrl,
    string CancelUrl
);

public record CheckoutResponse(string SessionId, string SessionUrl);

// ── Public Landing ────────────────────────────────────
public record PublicLandingResponse(
    string Id,
    string Title,
    string Slug,
    string? Description,
    string? Blocks,
    string? ThemeConfig,
    List<ProductResponse> Products
);
