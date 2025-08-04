using WarehouseManagement.DataAccess.Postgres.Enums;

namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Ресурс (идентификатор, наимнование, состояние)
/// </summary>
public class ResourceEntity
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public ArchivingState ArchivingState { get; set; }
}
