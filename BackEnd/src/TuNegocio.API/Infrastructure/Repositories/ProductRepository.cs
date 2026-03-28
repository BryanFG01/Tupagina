using Microsoft.EntityFrameworkCore;
using TuNegocio.API.Domain.Entities;
using TuNegocio.API.Domain.Interfaces;
using TuNegocio.API.Infrastructure.Data;

namespace TuNegocio.API.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;
    public ProductRepository(AppDbContext db) => _db = db;

    public async Task<IEnumerable<Product>> GetByLandingIdAsync(string landingId) =>
        await _db.Products.Where(p => p.LandingId == landingId).OrderByDescending(p => p.CreatedAt).ToListAsync();

    public async Task<Product?> GetByIdAsync(string id) =>
        await _db.Products.FindAsync(id);

    public async Task<Product> CreateAsync(Product product)
    {
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        _db.Products.Update(product);
        await _db.SaveChangesAsync();
        return product;
    }

    public async Task DeleteAsync(string id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product != null)
        {
            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
        }
    }
}
