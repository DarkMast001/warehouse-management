using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class BalanceConfiguration : IEntityTypeConfiguration<BalanceEntity>
{
    public void Configure(EntityTypeBuilder<BalanceEntity> builder)
    {
        builder.ToTable("Balance").HasKey(b => b.Id);
        builder.HasAlternateKey(b => new { b.ResourceId, b.MeasureUnitId });
        builder.Property(b => b.Id).HasColumnName("BalanceID");

        builder.HasOne(b => b.Resource)
            .WithOne()
            .HasForeignKey<BalanceEntity>(b => b.ResourceId);

        builder.HasOne(b => b.MeasureUnit)
            .WithOne()
            .HasForeignKey<BalanceEntity>(b => b.MeasureUnitId);

        builder.Property(b => b.ResourceId).HasColumnName("ResourceID");
        builder.Property(b => b.MeasureUnitId).HasColumnName("MeasureUnitID");

        builder.Property(b => b.Quantity).IsRequired();
    }
}
