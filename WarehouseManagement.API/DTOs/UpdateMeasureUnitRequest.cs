using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs;

public record UpdateMeasureUnitRequest(
    [Required]
    [StringLength(100, ErrorMessage = "Length must be less then 100.")] string NewName);
