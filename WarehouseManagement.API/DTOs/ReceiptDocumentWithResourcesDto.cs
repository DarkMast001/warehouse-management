using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres.Enums;

namespace WarehouseManagement.API.DTO;

public class ReceiptDocumentWithResourcesDto
{
    public Guid Id { get; set; }

    public int Number { get; set; }

    public DateOnly Date { get; set; }

    public List<ReceiptResourceDto> Resources { get; set; } = [];
}
