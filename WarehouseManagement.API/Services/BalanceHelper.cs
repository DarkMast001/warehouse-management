using Microsoft.EntityFrameworkCore;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Services;

public static class BalanceHelper
{
    public static async Task UpdateReceiptsBalanceAsync(List<ReceiptResourceEntity> resources, WarehouseDbContext _dbContext)
    {
        foreach (var resource in resources)
        {
            var balance = await _dbContext.Balances
                .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.MeasureUnitId == resource.MeasureUnitId);

            if (balance != null)
            {
                balance.Quantity += resource.Quantity;
            }
            else
            {
                var newBalance = new BalanceEntity
                {
                    Id = Guid.NewGuid(),
                    Resource = resource.Resource,
                    ResourceId = resource.ResourceId,
                    MeasureUnit = resource.MeasureUnit,
                    MeasureUnitId = resource.MeasureUnitId,
                    Quantity = resource.Quantity
                };
                _dbContext.Balances.Add(newBalance);
            }
        }
    }

    public static async Task DecreaseReceiptsBalanceAsync(List<ReceiptResourceEntity> resources, WarehouseDbContext _dbContext)
    {
        foreach (var resource in resources)
        {
            var balance = await _dbContext.Balances
                .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.MeasureUnitId == resource.MeasureUnitId);

            if (balance != null)
            {
                balance.Quantity -= resource.Quantity;
                if (balance.Quantity <= 0)
                {
                    _dbContext.Balances.Remove(balance);
                }
            }
        }
    }

    public static async Task UpdateShipmentBalanceAsync(List<ShipmentResourceEntity> resources, WarehouseDbContext _dbContext)
    {
        foreach (var resource in resources)
        {
            var balance = await _dbContext.Balances
                .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.MeasureUnitId == resource.MeasureUnitId);

            if (balance != null)
            {
                balance.Quantity += resource.Quantity;
            }
            else
            {
                var newBalance = new BalanceEntity
                {
                    Id = Guid.NewGuid(),
                    Resource = resource.Resource,
                    ResourceId = resource.ResourceId,
                    MeasureUnit = resource.MeasureUnit,
                    MeasureUnitId = resource.MeasureUnitId,
                    Quantity = resource.Quantity
                };
                _dbContext.Balances.Add(newBalance);
            }
        }
    }

    public static async Task DecreaseShipmentBalanceAsync(List<ShipmentResourceEntity> resources, WarehouseDbContext _dbContext)
    {
        foreach (var resource in resources)
        {
            var balance = await _dbContext.Balances
                .FirstOrDefaultAsync(b => b.ResourceId == resource.ResourceId && b.MeasureUnitId == resource.MeasureUnitId);

            if (balance != null)
            {
                balance.Quantity -= resource.Quantity;
                if (balance.Quantity <= 0)
                {
                    _dbContext.Balances.Remove(balance);
                }
            }
        }
    }
}
