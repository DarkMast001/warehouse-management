using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class ReceiptDocumentConfiguration : IEntityTypeConfiguration<ReceiptDocumentEntity>
{
    public void Configure(EntityTypeBuilder<ReceiptDocumentEntity> builder)
    {
        builder.ToTable("ReceiptDocument").HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("ReceiptDocumentID");

        builder.Property(r => r.Number).IsRequired();
        builder.HasIndex(r => r.Number).IsUnique();
        builder.Property(r => r.Date).IsRequired().HasColumnType("date");

        builder.HasMany(r => r.ReceiptResources)
            .WithOne(rr => rr.ReceiptDocument)
            .HasForeignKey(rr => rr.ReceiptDocumentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
