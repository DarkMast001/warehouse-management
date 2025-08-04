using WarehouseManagement.DataAccess.Postgres.Enums;

namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Клиент (идентификатор, наименование, адрес, состояние)
/// </summary>
public class ClientEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public ArchivingState ArchivingState { get; set;}
}
