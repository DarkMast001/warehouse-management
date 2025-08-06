using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Resources;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.API.Services;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers;

[Route("shipment")]
[ApiController]
public class ShipmentController : ControllerBase
{
    private readonly WarehouseDbContext _dbContext;

    public ShipmentController(WarehouseDbContext dbContext)
    {
        _dbContext = dbContext;   
    }

    [HttpPost("resource")]
    public async Task<ActionResult> CreateResource([FromBody] CreateShipmentResourceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        //var resourceInBalance = await _dbContext.Balances.FindAsync(request.ResourceId);
        var resourceInBalance = await _dbContext.Balances.FirstOrDefaultAsync(b => b.ResourceId == request.ResourceId);

        if (resourceInBalance == null)
        {
            return NotFound($"Resource with ID {request.ResourceId} not found.");
        }

        if (request.Quantity > resourceInBalance.Quantity)
        {
            return BadRequest($"Quantity of {request.ResourceId} cant be greater than quantity in Balance. Max Quantity is {resourceInBalance.Quantity}");
        }

        var shipmentResource = new ShipmentResourceEntity()
        {
            Id = Guid.NewGuid(),
            ResourceId = resourceInBalance.ResourceId,
            Resource = resourceInBalance.Resource,
            MeasureUnitId = resourceInBalance.MeasureUnitId,
            MeasureUnit = resourceInBalance.MeasureUnit,
            Quantity = request.Quantity,
            ShipmentDocumentId = null
        };

        _dbContext.ShipmentResources.Add(shipmentResource);
        await _dbContext.SaveChangesAsync();

        return Ok(shipmentResource.Id);
    }

    [HttpPost("document")]
    public async Task<ActionResult> CreateDocument([FromBody] CreateShipmentDocumentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var client = await _dbContext.Clients.FindAsync(request.ClientId);

        if (client == null)
        {
            return NotFound($"Client with ID {request.ClientId} not found.");
        }

        var resourceIds = request.ShipmentResourceIds.ToList();
        var resources = await _dbContext.ShipmentResources
            .Where(rr => resourceIds.Contains(rr.Id) && rr.ShipmentDocumentId == null)
            .ToListAsync();

        if (resources.Count != resourceIds.Count)
        {
            return BadRequest("One or more resources are invalid or already assigned to a document.");
        }

        var document = new ShipmentDocumentEntity()
        {
            Id = Guid.NewGuid(),
            Number = request.Number,
            ClientId = request.ClientId,
            Client = client,
            Date = request.Date,
            ShipmentResources = new List<ShipmentResourceEntity>(),
            DocumentState = DataAccess.Postgres.Enums.DocumentState.NOT_SIGNED
        };

        foreach (var resource in resources)
        {
            resource.ShipmentDocumentId = document.Id;
            resource.ShipmentDocument = document;
            document.ShipmentResources.Add(resource);
        }

        _dbContext.ShipmentDocuments.Add(document);
        await _dbContext.SaveChangesAsync();

        return Ok(document.Id);
    }

    [HttpPost("document/{id:guid}/sign")]
    public async Task<ActionResult> SignDocument(Guid id)
    {
        var document = await _dbContext.ShipmentDocuments
            .Include(d => d.ShipmentResources)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found.");
        }

        if (document.DocumentState == DataAccess.Postgres.Enums.DocumentState.SIGNED)
        {
            return BadRequest($"Document {id} has already signed");
        }

        document.DocumentState = DataAccess.Postgres.Enums.DocumentState.SIGNED;

        await BalanceHelper.DecreaseShipmentBalanceAsync(document.ShipmentResources, _dbContext);

        await _dbContext.SaveChangesAsync();

        return Ok("Success");
    }

    [HttpPost("document/{id:guid}/unsign")]
    public async Task<ActionResult> UnsignDocument(Guid id)
    {
        var document = await _dbContext.ShipmentDocuments
            .Include(d => d.ShipmentResources)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found.");
        }

        if (document.DocumentState == DataAccess.Postgres.Enums.DocumentState.NOT_SIGNED)
        {
            return BadRequest($"Document {id} has already unsigned");
        }

        document.DocumentState = DataAccess.Postgres.Enums.DocumentState.NOT_SIGNED;

        await BalanceHelper.UpdateShipmentBalanceAsync(document.ShipmentResources, _dbContext);

        await _dbContext.SaveChangesAsync();

        return Ok("Success");
    }

    [HttpPut("document/{id:guid}")]
    public async Task<ActionResult> UpdateDocument(Guid id, [FromBody] UpdateShipmentDocumentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var document = await _dbContext.ShipmentDocuments.FindAsync(id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found");
        }

        var resourceIds = request.NewShipmentResourceIds.ToList();
        var resources = await _dbContext.ShipmentResources
            .Where(rr => resourceIds.Contains(rr.Id) && rr.ShipmentDocumentId == null)
            .ToListAsync();

        if (resources.Count != resourceIds.Count)
        {
            return BadRequest("One or more resources are invalid or already assigned to a document.");
        }

        foreach (var resource in resources)
        {
            resource.ShipmentDocumentId = document.Id;
            resource.ShipmentDocument = document;
            document.ShipmentResources.Add(resource);
        }

        await BalanceHelper.DecreaseShipmentBalanceAsync(resources, _dbContext);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("resource/{id:guid}")]
    public async Task<ActionResult> DeleteResource(Guid id)
    {
        var resource = await _dbContext.ShipmentResources.FindAsync(id);

        if (resource == null)
        {
            return NotFound($"Resource with ID {id} not found.");
        }

        _dbContext.ShipmentResources.Remove(resource);
        await BalanceHelper.DecreaseShipmentBalanceAsync(new List<ShipmentResourceEntity>() { resource }, _dbContext);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("document/{id:guid}")]
    public async Task<ActionResult> DeleteDocument(Guid id)
    {
        var document = await _dbContext.ShipmentDocuments
            .Include(d => d.ShipmentResources)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found.");
        }

        if (document.DocumentState == DataAccess.Postgres.Enums.DocumentState.SIGNED)
        {
            return BadRequest("Cant delete signed document.");
        }

        _dbContext.ShipmentDocuments.Remove(document);

        await _dbContext.SaveChangesAsync();

        return Ok();
    }
}
