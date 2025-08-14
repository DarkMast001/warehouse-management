using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Resources;
using WarehouseManagement.API.DTO;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.API.Services;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers;

[Route("shipments")]
[ApiController]
public class ShipmentsController : ControllerBase
{
    private readonly WarehouseDbContext _dbContext;

    public ShipmentsController(WarehouseDbContext dbContext)
    {
        _dbContext = dbContext;   
    }

    [HttpGet("documents")]
    public ActionResult GetAllDocuments()
    {
        return Ok(_dbContext.ShipmentDocuments);
    }

    [HttpGet("documents/{id:guid}")]
    public async Task<ActionResult> GetDocumentById(Guid id)
    {
        var query = _dbContext.ShipmentDocuments
            .Include(d => d.Client)
            .Include(d => d.ShipmentResources)
                .ThenInclude(rr => rr.Resource)
            .Include(d => d.ShipmentResources)
                .ThenInclude(rr => rr.MeasureUnit)
            .AsQueryable();

        query = query.Where(d => d.Id == id);

        var document = await query
            .Select(d => new ShipmentDocumentWithResources
            {
                Id = d.Id,
                Number = d.Number,
                Date = d.Date,
                ClientId = d.ClientId,
                ClientName = d.Client.Name,
                Status = d.DocumentState.ToString(),
                Resources = d.ShipmentResources.Select(rr => new ShipmentResourceDto
                {
                    Id = rr.Id,
                    ResourceId = rr.ResourceId,
                    Name = rr.Resource.Name,
                    MeasureUnitId = rr.MeasureUnitId,
                    MeasureUnitName = rr.MeasureUnit.Name,
                    Quantity = rr.Quantity
                }).ToList()
            })
            .ToListAsync();

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found.");
        }

        return Ok(document);
    }

    [HttpGet("documents-with-resources")]
    public async Task<ActionResult<IEnumerable<ReceiptDocumentWithResourcesDto>>> GetDocumentsWithResources([FromQuery] FilterShipmentsRequest filter)
    {
        var query = _dbContext.ShipmentDocuments
            .Include(d => d.Client)
            .Include(d => d.ShipmentResources)
                .ThenInclude(rr => rr.Resource)
            .Include(d => d.ShipmentResources)
                .ThenInclude(rr => rr.MeasureUnit)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.DocumentNumber))
        {
            query = query.Where(d => d.Number == Convert.ToInt32(filter.DocumentNumber));
        }

        if (!string.IsNullOrWhiteSpace(filter.ClientName))
        {
            query = query.Where(d => d.Client.Name.Equals(filter.ClientName));
        }

        if (filter.DateFrom.HasValue)
        {
            query = query.Where(d => d.Date >= filter.DateFrom.Value);
        }
        if (filter.DateTo.HasValue)
        {
            query = query.Where(d => d.Date <= filter.DateTo.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.ResourceName))
        {
            query = query.Where(d => d.ShipmentResources.Any(rr => rr.Resource.Name.Equals(filter.ResourceName)));
        }

        if (!string.IsNullOrWhiteSpace(filter.MeasureUnitName))
        {
            query = query.Where(d => d.ShipmentResources.Any(rr => rr.MeasureUnit.Name.Equals(filter.MeasureUnitName)));
        }

        var documents = await query
            .Select(d => new ShipmentDocumentWithResources
            {
                Id = d.Id,
                Number = d.Number,
                Date = d.Date,
                ClientId = d.ClientId,
                ClientName = d.Client.Name,
                Status = d.DocumentState.ToString(),
                Resources = d.ShipmentResources.Select(rr => new ShipmentResourceDto
                {
                    Id = rr.Id,
                    ResourceId = rr.ResourceId,
                    Name = rr.Resource.Name,
                    MeasureUnitId = rr.MeasureUnitId,
                    MeasureUnitName = rr.MeasureUnit.Name,
                    Quantity = rr.Quantity
                }).ToList()
            }).ToListAsync();

        return Ok(documents);
    }

    [HttpPost("resources")]
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

    [HttpPost("documents")]
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

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(document.Id);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx ? pgEx.SqlState == "23505" : false)
        {
            return Conflict("Cannot add because document with such number already exist.");
        }
    }

    [HttpPost("documents/{id:guid}/sign")]
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
            return Conflict($"Document {id} has already signed");
        }

        document.DocumentState = DataAccess.Postgres.Enums.DocumentState.SIGNED;

        await BalanceHelper.DecreaseShipmentBalanceAsync(document.ShipmentResources, _dbContext);

        await _dbContext.SaveChangesAsync();

        return Ok("Success");
    }

    [HttpPost("documents/{id:guid}/unsign")]
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
            return Conflict($"Document {id} has already unsigned");
        }

        document.DocumentState = DataAccess.Postgres.Enums.DocumentState.NOT_SIGNED;

        await BalanceHelper.UpdateShipmentBalanceAsync(document.ShipmentResources, _dbContext);

        await _dbContext.SaveChangesAsync();

        return Ok("Success");
    }

    [HttpPut("documents/{id:guid}")]
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

        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("resources/{id:guid}")]
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

    [HttpDelete("documents/{id:guid}")]
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
