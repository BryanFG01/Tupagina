using Microsoft.AspNetCore.Mvc;
using TuNegocio.API.Application.Services;

namespace TuNegocio.API.API.Controllers;

[ApiController]
[Route("api/public")]
public class PublicController : ControllerBase
{
    private readonly LandingService _landingService;

    public PublicController(LandingService landingService)
    {
        _landingService = landingService;
    }

    /// <summary>GET /api/public/landings/{slug} — Acceso público para el frontend</summary>
    [HttpGet("landings/{slug}")]
    [ProducesResponseType(typeof(Application.DTOs.PublicLandingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        try
        {
            var landing = await _landingService.GetPublicBySlugAsync(slug);
            return Ok(landing);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
