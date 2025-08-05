using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs;

public record CreateClientRequest(
    [Required]
    [StringLength(100, ErrorMessage = "Length must be less then 100.")] string Name,
    [Required] 
    [StringLength(200, ErrorMessage = "Length must be less then 200.")] string Address);
