using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace WarehouseManagement.API.DTOs;

public record FilterReceiptsRequest(
    [BindRequired] DateOnly DateFrom,
    [BindRequired] DateOnly DateTo,
    [BindRequired] int NumberOfDocument,
    [BindRequired] string ResourceId,
    [BindRequired] string MeasureUnitId);
