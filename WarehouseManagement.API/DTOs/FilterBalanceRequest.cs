using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace WarehouseManagement.API.DTOs;

public record FilterBalanceRequest(
    [BindRequired] string ResourceId,
    [BindRequired] string MeasureUnitId);
