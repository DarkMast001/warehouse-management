using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs;

public record CreateReceiptResourceRequest(
    [Required]
    Guid ResourceId,
    [Required]
    Guid MeasureUnitId,
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
    int Quantity);
