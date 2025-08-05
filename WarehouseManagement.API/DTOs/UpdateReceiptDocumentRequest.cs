using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs;

public record UpdateReceiptDocumentRequest(
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Number must be greater than 0.")]
    int NewNumber,
    [Required]
    DateOnly NewDate,
    [Required]
    List<Guid> NewReceiptResourceIds);
