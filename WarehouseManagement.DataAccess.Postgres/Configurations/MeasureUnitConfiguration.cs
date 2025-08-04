using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class MeasureUnitConfiguration : IEntityTypeConfiguration<MeasureUnitEntity>
{
    public void Configure(EntityTypeBuilder<MeasureUnitEntity> builder)
    {
        builder.ToTable("MeasureUnits").HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("MeasureUnitID");
        builder.Property(m => m.Name).IsRequired().HasMaxLength(100);
        builder.HasIndex(m => m.Name).IsUnique();
        builder.Property(m => m.ArchivingState).IsRequired().HasConversion<string>();
    }
}
