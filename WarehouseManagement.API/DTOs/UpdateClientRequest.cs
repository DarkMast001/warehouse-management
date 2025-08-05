using System.ComponentModel.DataAnnotations;

namespace WarehouseManagement.API.DTOs
{
    public record UpdateClientRequest (
        [Required]
        [StringLength(100, ErrorMessage = "Length must be less then 100.")] string NewName,
        [Required]
        [StringLength(200, ErrorMessage = "Length must be less then 200.")] string NewAddress);
}
