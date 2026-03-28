using Microsoft.AspNetCore.Mvc;
using TuNegocio.API.Application.DTOs;
using TuNegocio.API.Application.Services;

namespace TuNegocio.API.API.Controllers;

[ApiController]
[Route("api/store")]
public class StoreController : ControllerBase
{
    private readonly PaymentService _paymentService;

    public StoreController(PaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>POST /api/store/checkout — Crea sesión Stripe. Acceso público.</summary>
    [HttpPost("checkout")]
    [ProducesResponseType(typeof(CheckoutResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        try
        {
            var result = await _paymentService.CreateCheckoutSessionAsync(request);
            return Ok(result);
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
