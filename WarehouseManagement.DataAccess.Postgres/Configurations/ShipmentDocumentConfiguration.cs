using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.DataAccess.Postgres.Configurations;

public class ShipmentDocumentConfiguration : IEntityTypeConfiguration<ShipmentDocumentEntity>
{
    public void Configure(EntityTypeBuilder<ShipmentDocumentEntity> builder)
    {
        builder.ToTable("ShipmentDocument").HasKey(sd => sd.Id);
        builder.Property(sd => sd.Id).HasColumnName("ShipmentDocumentID");

        builder.Property(sd => sd.Number).IsRequired();
        builder.HasIndex(sd => sd.Number).IsUnique();
        builder.Property(sd => sd.Date).IsRequired().HasColumnType("date");
        builder.Property(sd => sd.DocumentState).IsRequired().HasConversion<string>();

        builder.HasOne(sd => sd.Client)
            .WithMany()
            .HasForeignKey(sd => sd.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(sd => sd.ShipmentResources)
            .WithOne(sr => sr.ShipmentDocument)
            .HasForeignKey(sr => sr.ShipmentDocumentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(sd => sd.ClientId).HasColumnName("ClientID");
    }
}
