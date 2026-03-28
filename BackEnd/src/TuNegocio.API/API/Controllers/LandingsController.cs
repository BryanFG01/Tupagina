using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuNegocio.API.Application.DTOs;
using TuNegocio.API.Application.Services;

namespace TuNegocio.API.API.Controllers;

[ApiController]
[Route("api/landings")]
[Authorize]
public class LandingsController : ControllerBase
{
    private readonly LandingService _landingService;

    public LandingsController(LandingService landingService)
    {
        _landingService = landingService;
    }

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Token inválido.");

    /// <summary>GET /api/landings — Retorna las landings del usuario autenticado</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LandingResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var landings = await _landingService.GetByUserAsync(UserId);
        return Ok(landings);
    }

    /// <summary>POST /api/landings — Crea una nueva landing con slug único</summary>
    [HttpPost]
    [ProducesResponseType(typeof(LandingResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateLandingRequest request)
    {
        var landing = await _landingService.CreateAsync(UserId, request);
        return CreatedAtAction(nameof(GetAll), new { id = landing.Id }, landing);
    }

    /// <summary>PUT /api/landings/{id} — Editor: actualiza contenido y publica</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(LandingResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateLandingRequest request)
    {
        try
        {
            var updated = await _landingService.UpdateAsync(id, UserId, request);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>DELETE /api/landings/{id} — Elimina una landing del usuario</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id)
    {
        // Verificar ownership antes de eliminar
        var landings = await _landingService.GetByUserAsync(UserId);
        if (!landings.Any(l => l.Id == id))
            return NotFound(new { message = "Landing no encontrada." });

        // TODO: Delegar al servicio
        return NoContent();
    }
}
