using Microsoft.EntityFrameworkCore;
using TuNegocio.API.Domain.Entities;
using TuNegocio.API.Domain.Interfaces;
using TuNegocio.API.Infrastructure.Data;

namespace TuNegocio.API.Infrastructure.Repositories;

public class LandingRepository : ILandingRepository
{
    private readonly AppDbContext _db;
    public LandingRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Landing>> GetByUserIdAsync(string userId) =>
        await _db.Landings.Where(l => l.UserId == userId).OrderByDescending(l => l.CreatedAt).ToListAsync();

    public async Task<Landing?> GetByIdAsync(string id) =>
        await _db.Landings.FindAsync(id);

    public async Task<Landing?> GetBySlugAsync(string slug) =>
        await _db.Landings
            .Include(l => l.Products)
            .FirstOrDefaultAsync(l => l.Slug == slug);

    public async Task<bool> SlugExistsAsync(string slug) =>
        await _db.Landings.AnyAsync(l => l.Slug == slug);

    public async Task<Landing> CreateAsync(Landing landing)
    {
        _db.Landings.Add(landing);
        await _db.SaveChangesAsync();
        return landing;
    }

    public async Task<Landing> UpdateAsync(Landing landing)
    {
        _db.Landings.Update(landing);
        await _db.SaveChangesAsync();
        return landing;
    }

    public async Task DeleteAsync(string id)
    {
        var landing = await _db.Landings.FindAsync(id);
        if (landing != null)
        {
            _db.Landings.Remove(landing);
            await _db.SaveChangesAsync();
        }
    }
}
