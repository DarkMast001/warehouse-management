using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class ResourceConfiguration : IEntityTypeConfiguration<ResourceEntity>
{
    public void Configure(EntityTypeBuilder<ResourceEntity> builder)
    {
        builder.ToTable("Resources").HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("ResourceID");
        builder.Property(r => r.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(r => r.Name).IsUnique();
        builder.Property(r => r.ArchivingState).IsRequired().HasConversion<string>();
    }
}
