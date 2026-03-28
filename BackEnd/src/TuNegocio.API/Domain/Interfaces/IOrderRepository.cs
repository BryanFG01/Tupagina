using TuNegocio.API.Domain.Entities;

namespace TuNegocio.API.Domain.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(string id);
    Task<Order?> GetByClientReferenceAsync(string clientReference);
    Task<Order> CreateAsync(Order order);
    Task<Order> UpdateAsync(Order order);
}
