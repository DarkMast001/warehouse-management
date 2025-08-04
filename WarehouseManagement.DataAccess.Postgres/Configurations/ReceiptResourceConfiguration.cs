using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class ReceiptResourceConfiguration : IEntityTypeConfiguration<ReceiptResourceEntity>
{
    public void Configure(EntityTypeBuilder<ReceiptResourceEntity> builder)
    {
        builder.ToTable("ReceiptResource").HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("ReceiptResourceID");

        builder.Property(r => r.Quantity).IsRequired();

        builder.HasOne(rr => rr.Resource)
            .WithMany()
            .HasForeignKey(rr => rr.ResourceId);

        builder.HasOne(rr => rr.MeasureUnit)
            .WithMany()
            .HasForeignKey(rr => rr.MeasureUnitId);

        builder.HasOne(rr => rr.ReceiptDocument)
            .WithMany(rd => rd.ReceiptResources)
            .HasForeignKey(rr => rr.ReceiptDocumentId);

        builder.Property(rr => rr.ResourceId).HasColumnName("ResourceID");
        builder.Property(rr => rr.MeasureUnitId).HasColumnName("MeasureUnitID");
        builder.Property(rr => rr.ReceiptDocumentId).HasColumnName("ReceiptDocumentID");
    }
}
