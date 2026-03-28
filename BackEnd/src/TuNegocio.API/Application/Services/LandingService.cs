using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using TuNegocio.API.Application.DTOs;
using TuNegocio.API.Domain.Entities;
using TuNegocio.API.Domain.Interfaces;

namespace TuNegocio.API.Application.Services;

public class LandingService
{
    private readonly ILandingRepository _landingRepo;

    public LandingService(ILandingRepository landingRepo)
    {
        _landingRepo = landingRepo;
    }

    public async Task<IEnumerable<LandingResponse>> GetByUserAsync(string userId)
    {
        var landings = await _landingRepo.GetByUserIdAsync(userId);
        return landings.Select(MapToResponse);
    }

    public async Task<LandingResponse> CreateAsync(string userId, CreateLandingRequest request)
    {
        var slug = await GenerateUniqueSlugAsync(request.Title);

        var landing = new Landing
        {
            UserId = userId,
            Title = request.Title,
            Slug = slug,
            Description = request.Description,
        };

        var created = await _landingRepo.CreateAsync(landing);
        return MapToResponse(created);
    }

    public async Task<LandingResponse> UpdateAsync(string landingId, string userId, UpdateLandingRequest request)
    {
        var landing = await _landingRepo.GetByIdAsync(landingId)
            ?? throw new KeyNotFoundException("Landing no encontrada.");

        if (landing.UserId != userId)
            throw new UnauthorizedAccessException("No tienes permiso para editar esta landing.");

        // Validación crítica: si se intenta publicar, el JSON de Blocks debe tener elementos
        if (request.Published == true)
        {
            var blocksJson = request.Blocks ?? landing.Blocks;
            ValidateBlocksForPublishing(blocksJson);
        }

        // Aplicar cambios
        if (request.Title != null)
        {
            landing.Title = request.Title;
            // Si cambia el título, regenerar slug (opcional — aquí lo mantenemos)
        }
        if (request.Description != null) landing.Description = request.Description;
        if (request.Blocks != null) landing.Blocks = request.Blocks;
        if (request.Published.HasValue) landing.Published = request.Published.Value;
        if (request.ThemeConfig != null) landing.ThemeConfig = request.ThemeConfig;
        landing.UpdatedAt = DateTime.UtcNow;

        var updated = await _landingRepo.UpdateAsync(landing);
        return MapToResponse(updated);
    }

    public async Task<PublicLandingResponse> GetPublicBySlugAsync(string slug)
    {
        var landing = await _landingRepo.GetBySlugAsync(slug)
            ?? throw new KeyNotFoundException("Landing no encontrada.");

        if (!landing.Published)
            throw new InvalidOperationException("Esta landing no está publicada.");

        var products = landing.Products
            .Where(p => p.IsActive)
            .Select(p => new ProductResponse(p.Id, p.LandingId, p.Name, p.Description, p.Price, p.Stock, p.IsActive, p.ImageUrl))
            .ToList();

        return new PublicLandingResponse(
            landing.Id,
            landing.Title,
            landing.Slug,
            landing.Description,
            landing.Blocks,
            landing.ThemeConfig,
            products
        );
    }

    // ── Lógica Crítica: Generación de Slugs Únicos ──────────────────────────────
    /// <summary>
    /// Sanitiza el título a slug (ej: "Mi Tienda!" → "mi-tienda") y añade sufijo
    /// incremental si el slug ya existe en la BD (ej: "mi-tienda-2").
    /// </summary>
    private async Task<string> GenerateUniqueSlugAsync(string title)
    {
        var baseSlug = Slugify(title);
        var slug = baseSlug;
        int counter = 2;

        while (await _landingRepo.SlugExistsAsync(slug))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }

    private static string Slugify(string text)
    {
        // Normalizar a ASCII basic (quitar acentos)
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            var category = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        var withoutAccents = sb.ToString().Normalize(NormalizationForm.FormC);

        // Convertir a minúsculas, reemplazar espacios y caracteres especiales
        var slug = withoutAccents.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-").Trim('-');

        return slug;
    }

    // ── Lógica Crítica: Validación de Blocks JSON ────────────────────────────────
    /// <summary>
    /// Deserializa Blocks (JSONB) y valida que tenga al menos un elemento.
    /// Lanza excepción si está vacío o malformado.
    /// </summary>
    private static void ValidateBlocksForPublishing(string? blocksJson)
    {
        if (string.IsNullOrWhiteSpace(blocksJson))
            throw new InvalidOperationException("No se puede publicar una landing sin bloques de contenido.");

        try
        {
            var blocks = JsonSerializer.Deserialize<List<JsonElement>>(blocksJson);
            if (blocks == null || blocks.Count == 0)
                throw new InvalidOperationException("La landing debe tener al menos un bloque de contenido para publicarse.");
        }
        catch (JsonException)
        {
            throw new InvalidOperationException("El campo Blocks contiene JSON inválido.");
        }
    }

    private static LandingResponse MapToResponse(Landing l) =>
        new(l.Id, l.Title, l.Slug, l.Description, l.Blocks, l.Published, l.ThemeConfig, l.CreatedAt, l.UpdatedAt);
}
