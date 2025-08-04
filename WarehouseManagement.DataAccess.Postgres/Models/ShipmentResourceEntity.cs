namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Ресурс отгрузки (идентификатор, идентификатор ресурса, идентификатор единицы измерения, количество)
/// </summary>
public class ShipmentResourceEntity
{
    public Guid Id { get; set; }

    public Guid ResourceId { get; set; }

    public ResourceEntity? Resource { get; set; }

    public Guid MeasureUnitId { get; set; }

    public MeasureUnitEntity? MeasureUnit { get; set; }

    public int Quantity { get; set; }

    public Guid ShipmentDocumentId { get; set; }

    public ShipmentDocumentEntity? ShipmentDocument { get; set; }
}