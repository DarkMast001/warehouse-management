using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class ShipmentResourceConfiguration : IEntityTypeConfiguration<ShipmentResourceEntity>
{
    public void Configure(EntityTypeBuilder<ShipmentResourceEntity> builder)
    {
        builder.ToTable("ShipmentResource").HasKey(sr => sr.Id);
        builder.Property(sr => sr.Id).HasColumnName("ShipmentResourceID");

        builder.Property(sr => sr.Quantity).IsRequired();

        builder.HasOne(sr => sr.Resource)
            .WithMany()
            .HasForeignKey(sr => sr.ResourceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sr => sr.MeasureUnit)
            .WithMany()
            .HasForeignKey(sr => sr.MeasureUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(sr => sr.ShipmentDocument)
            .WithMany(sd => sd.ShipmentResources)
            .HasForeignKey(sr => sr.ShipmentDocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(sr => sr.ResourceId).HasColumnName("ResourceID");
        builder.Property(sr => sr.MeasureUnitId).HasColumnName("MeasureUnitID");
        builder.Property(sr => sr.ShipmentDocumentId).HasColumnName("ShipmentDocumentID");
    }
}
