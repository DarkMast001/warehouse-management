using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WarehouseManagement.DataAccess.Postgres.Configurations;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres;

public class WarehouseDbContext : DbContext
{
    public DbSet<ResourceEntity> Resources { get; set; }
    public DbSet<MeasureUnitEntity> MeasureUnits { get; set; }
    public DbSet<ClientEntity> Clients { get; set; }
    public DbSet<BalanceEntity> Balances { get; set; }
    public DbSet<ShipmentResourceEntity> ShipmentResources { get; set; }
    public DbSet<ShipmentDocumentEntity> ShipmentDocuments { get; set; }
    public DbSet<ReceiptResourceEntity> ReceiptResources { get; set; }
    public DbSet<ReceiptDocumentEntity> ReceiptDocuments { get; set; }

    private readonly IConfiguration _configuration;

    public WarehouseDbContext(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(_configuration.GetConnectionString("Database"))
            .LogTo(Console.WriteLine, LogLevel.Information);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WarehouseDbContext).Assembly);

        //modelBuilder.ApplyConfiguration(new BalanceConfiguration());
        //modelBuilder.ApplyConfiguration(new ReceiptDocumentConfiguration());
        //modelBuilder.ApplyConfiguration(new ReceiptResourceConfiguration());
        //modelBuilder.ApplyConfiguration(new ShipmentDocumentConfiguration());
        //modelBuilder.ApplyConfiguration(new ShipmentResourceConfiguration());
        //modelBuilder.ApplyConfiguration(new ClientConfiguration());
        //modelBuilder.ApplyConfiguration(new ResourceConfiguration());
        //modelBuilder.ApplyConfiguration(new MeasureUnitConfiguration());
    }
}
