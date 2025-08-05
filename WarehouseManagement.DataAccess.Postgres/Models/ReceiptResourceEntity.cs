namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Ресурс поступления (идентификатор, идентификатор ресурса, идентификатор единицы измерения, количество)
/// </summary>
public class ReceiptResourceEntity
{
    public Guid Id { get; set; }

    public Guid ResourceId { get; set; }

    public ResourceEntity? Resource { get; set; }

    public Guid MeasureUnitId { get; set; }

    public MeasureUnitEntity? MeasureUnit { get; set; }

    public int Quantity { get; set; }

    public Guid? ReceiptDocumentId { get; set; }

    public ReceiptDocumentEntity? ReceiptDocument { get; set; }
}
