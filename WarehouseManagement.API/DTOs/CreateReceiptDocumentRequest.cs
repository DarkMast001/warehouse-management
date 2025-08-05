using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs;

public record CreateReceiptDocumentRequest(
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Number must be greater than 0.")]
    int Number,
    [Required]
    DateOnly Date,
    [Required]
    List<Guid> ReceiptResourceIds);
