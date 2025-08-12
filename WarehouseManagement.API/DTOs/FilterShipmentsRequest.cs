namespace WarehouseManagement.API.DTOs;

public record FilterShipmentsRequest(
    string? DocumentNumber,
    DateOnly? DateFrom,
    DateOnly? DateTo,
    string? ClientName,
    string? ResourceName,
    string? MeasureUnitName);
