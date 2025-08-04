using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class ClientConfiguration : IEntityTypeConfiguration<ClientEntity>
{
    public void Configure(EntityTypeBuilder<ClientEntity> builder)
    {
        builder.ToTable("Clients").HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnName("ClientID");
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(c => c.Name).IsUnique();
        builder.Property(c => c.Address).IsRequired().HasMaxLength(200);
        builder.Property(c => c.ArchivingState).IsRequired().HasConversion<string>();
    }
}
