using TuNegocio.API.Domain.Entities;

namespace TuNegocio.API.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(string id);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
}
