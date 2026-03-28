using TuNegocio.API.Domain.Entities;

namespace TuNegocio.API.Domain.Interfaces;

public interface IProductRepository
{
    Task<IEnumerable<Product>> GetByLandingIdAsync(string landingId);
    Task<Product?> GetByIdAsync(string id);
    Task<Product> CreateAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task DeleteAsync(string id);
}
