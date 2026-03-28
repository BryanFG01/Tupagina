using Microsoft.EntityFrameworkCore;
using TuNegocio.API.Domain.Entities;
using TuNegocio.API.Domain.Interfaces;
using TuNegocio.API.Infrastructure.Data;

namespace TuNegocio.API.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;
    public OrderRepository(AppDbContext db) => _db = db;

    public async Task<Order?> GetByIdAsync(string id) =>
        await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);

    public async Task<Order?> GetByClientReferenceAsync(string clientReference) =>
        await _db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.ClientReference == clientReference);

    public async Task<Order> CreateAsync(Order order)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<Order> UpdateAsync(Order order)
    {
        _db.Orders.Update(order);
        await _db.SaveChangesAsync();
        return order;
    }
}
