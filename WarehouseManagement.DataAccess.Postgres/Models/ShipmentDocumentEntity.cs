using WarehouseManagement.DataAccess.Postgres.Enums;

namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Документ отгрузки (идентификатор, номер, идентификатор клиента, дата, состояние)
/// </summary>
public class ShipmentDocumentEntity
{
    public Guid Id { get; set; }

    public int Number { get; set; }

    public Guid ClientId { get; set; }

    public ClientEntity? Client { get; set; }

    public DateTime Date { get; set; }

    public DocumentState DocumentState { get; set; } = DocumentState.NOT_SIGNED;

    public List<ShipmentResourceEntity> ShipmentResources { get; set; } = [];
}
