using WarehouseManagement.DataAccess.Postgres.Enums;

namespace WarehouseManagement.DataAccess.Postgres.Models;

/// <summary>
/// Единица измерения (идентификатор, наименование, состояние)
/// </summary>
public class MeasureUnitEntity
{
    public Guid Id {  get; set; }

    public string Name { get; set; } = string.Empty;

    public ArchivingState ArchivingState { get; set; }
}
