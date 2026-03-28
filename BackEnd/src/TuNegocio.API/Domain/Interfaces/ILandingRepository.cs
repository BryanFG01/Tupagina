using TuNegocio.API.Domain.Entities;

namespace TuNegocio.API.Domain.Interfaces;

public interface ILandingRepository
{
    Task<IEnumerable<Landing>> GetByUserIdAsync(string userId);
    Task<Landing?> GetByIdAsync(string id);
    Task<Landing?> GetBySlugAsync(string slug);
    Task<bool> SlugExistsAsync(string slug);
    Task<Landing> CreateAsync(Landing landing);
    Task<Landing> UpdateAsync(Landing landing);
    Task DeleteAsync(string id);
}
