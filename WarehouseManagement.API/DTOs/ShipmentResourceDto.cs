namespace WarehouseManagement.API.DTOs;

public class ShipmentResourceDto
{
    public Guid Id { get; set; }

    public Guid ResourceId { get; set; }

    public string Name { get; set; } = string.Empty;

    public Guid MeasureUnitId { get; set; }

    public string MeasureUnitName { get; set; } = string.Empty;

    public int Quantity { get; set; }
}
