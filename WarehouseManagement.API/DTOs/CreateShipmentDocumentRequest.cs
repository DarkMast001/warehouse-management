using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs;

public record CreateShipmentDocumentRequest(
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Number must be greater than 0.")] int Number,
    [Required(ErrorMessage = "Clients not good")] Guid ClientId,
    [Required(ErrorMessage = "DateOnly not good")] DateOnly Date,
    [Required(ErrorMessage = "List not good")] List<Guid> ShipmentResourceIds);

