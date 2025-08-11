namespace WarehouseManagement.API.DTOs;

public class ReceiptResourceDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string MeasureUnitName { get; set; } = string.Empty;

    public int Quantity { get; set; }
}
