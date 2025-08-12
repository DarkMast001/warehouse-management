namespace WarehouseManagement.API.DTOs;

public class ShipmentDocumentWithResources
{
    public Guid Id { get; set; }

    public int Number { get; set; }

    public Guid ClientId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateOnly Date { get; set; }

    public List<ShipmentResourceDto> Resources { get; set; } = [];
}
