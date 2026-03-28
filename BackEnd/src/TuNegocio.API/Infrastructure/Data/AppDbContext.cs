using Microsoft.EntityFrameworkCore;
using TuNegocio.API.Domain.Entities;

namespace TuNegocio.API.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Landing> Landings => Set<Landing>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ─────────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Email).HasColumnName("email").IsRequired();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
            e.Property(u => u.Name).HasColumnName("name").IsRequired();
            e.Property(u => u.Role).HasColumnName("role").HasDefaultValue("user");
            e.Property(u => u.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(u => u.CreatedAt).HasColumnName("created_at");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Landing ───────────────────────────────────────────────────────────────
        modelBuilder.Entity<Landing>(e =>
        {
            e.ToTable("landings");
            e.HasKey(l => l.Id);
            e.Property(l => l.Id).HasColumnName("id");
            e.Property(l => l.UserId).HasColumnName("user_id").IsRequired();
            e.Property(l => l.Title).HasColumnName("title").IsRequired();
            e.Property(l => l.Slug).HasColumnName("slug").IsRequired();
            e.Property(l => l.Description).HasColumnName("description");
            // Blocks stored as JSONB in PostgreSQL
            e.Property(l => l.Blocks).HasColumnName("blocks").HasColumnType("jsonb");
            e.Property(l => l.Published).HasColumnName("published").HasDefaultValue(false);
            e.Property(l => l.ThemeConfig).HasColumnName("theme_config").HasColumnType("jsonb");
            e.Property(l => l.CreatedAt).HasColumnName("created_at");
            e.Property(l => l.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(l => l.Slug).IsUnique();

            e.HasOne(l => l.User)
             .WithMany(u => u.Landings)
             .HasForeignKey(l => l.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Product ───────────────────────────────────────────────────────────────
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.LandingId).HasColumnName("landing_id").IsRequired();
            e.Property(p => p.Name).HasColumnName("name").IsRequired();
            e.Property(p => p.Description).HasColumnName("description");
            e.Property(p => p.Price).HasColumnName("price").HasPrecision(10, 2);
            e.Property(p => p.Stock).HasColumnName("stock").HasDefaultValue(0);
            e.Property(p => p.IsActive).HasColumnName("is_active").HasDefaultValue(true);
            e.Property(p => p.ImageUrl).HasColumnName("image_url");
            e.Property(p => p.CreatedAt).HasColumnName("created_at");
            e.Property(p => p.UpdatedAt).HasColumnName("updated_at");

            e.HasOne(p => p.Landing)
             .WithMany(l => l.Products)
             .HasForeignKey(p => p.LandingId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Order ─────────────────────────────────────────────────────────────────
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.Property(o => o.Id).HasColumnName("id");
            e.Property(o => o.LandingId).HasColumnName("landing_id").IsRequired();
            e.Property(o => o.CustomerEmail).HasColumnName("customer_email").IsRequired();
            e.Property(o => o.CustomerName).HasColumnName("customer_name").IsRequired();
            e.Property(o => o.TotalAmount).HasColumnName("total_amount").HasPrecision(10, 2);
            e.Property(o => o.Status).HasColumnName("status").HasDefaultValue("pending");
            e.Property(o => o.StripeSessionId).HasColumnName("stripe_session_id");
            e.Property(o => o.StripePaymentIntentId).HasColumnName("stripe_payment_intent_id");
            e.Property(o => o.ClientReference).HasColumnName("client_reference").IsRequired();
            e.Property(o => o.CreatedAt).HasColumnName("created_at");
            e.Property(o => o.UpdatedAt).HasColumnName("updated_at");
            e.HasIndex(o => o.ClientReference).IsUnique();

            e.HasOne(o => o.Landing)
             .WithMany()
             .HasForeignKey(o => o.LandingId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── OrderItem ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(oi => oi.Id);
            e.Property(oi => oi.Id).HasColumnName("id");
            e.Property(oi => oi.OrderId).HasColumnName("order_id").IsRequired();
            e.Property(oi => oi.ProductId).HasColumnName("product_id").IsRequired();
            e.Property(oi => oi.Quantity).HasColumnName("quantity");
            e.Property(oi => oi.UnitPriceSnapshot).HasColumnName("unit_price_snapshot").HasPrecision(10, 2);
            e.Property(oi => oi.ProductNameSnapshot).HasColumnName("product_name_snapshot").IsRequired();

            e.HasOne(oi => oi.Order)
             .WithMany(o => o.Items)
             .HasForeignKey(oi => oi.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(oi => oi.Product)
             .WithMany(p => p.OrderItems)
             .HasForeignKey(oi => oi.ProductId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
