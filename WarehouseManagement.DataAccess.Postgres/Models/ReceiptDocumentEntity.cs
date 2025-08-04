namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Документ поступления (идентификатор, номер, дата)
/// </summary>
public class ReceiptDocumentEntity
{
    public Guid Id { get; set; }

    public int Number { get; set; }

    public DateTime Date { get; set; }

    public List<ReceiptResourceEntity> ReceiptResources { get; set; } = [];
}
