using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace WarehouseManagement.API.DTOs;

public record FilterReceiptsRequest(
    string? DocumentNumber,
    DateOnly? DateFrom,
    DateOnly? DateTo,
    int? NumberOfDocument,
    string? ResourceName,
    string? MeasureUnitName);
