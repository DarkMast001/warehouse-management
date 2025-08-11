using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WarehouseManagement.API.DTO;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.API.Services;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Models;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace WarehouseManagement.API.Controllers;

[Route("receipts")]
[ApiController]
public class ReceiptsController : ControllerBase
{
    private readonly WarehouseDbContext _dbContext;

    public ReceiptsController(WarehouseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("documents")]
    public ActionResult GetAllDocuments()
    {
        return Ok(_dbContext.ReceiptDocuments);
    }

    [HttpGet("documents-with-resources")]
    public async Task<ActionResult<IEnumerable<DocumentWithResourcesDto>>> GetDocumentsWithResources([FromQuery] FilterReceiptsRequest filter)
    {
        var query = _dbContext.ReceiptDocuments
        .Include(d => d.ReceiptResources)
            .ThenInclude(rr => rr.Resource)
        .Include(d => d.ReceiptResources)
            .ThenInclude(rr => rr.MeasureUnit)
        .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.DocumentNumber))
        {
            query = query.Where(d => d.Number == Convert.ToInt32(filter.DocumentNumber));
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
            query = query.Where(d => d.ReceiptResources.Any(rr => rr.Resource.Name.Equals(filter.ResourceName)));
        }

        if (!string.IsNullOrWhiteSpace(filter.MeasureUnitName))
        {
            query = query.Where(d => d.ReceiptResources.Any(rr => rr.MeasureUnit.Name.Equals(filter.MeasureUnitName)));
        }

        var documents = await query
            .Select(d => new DocumentWithResourcesDto
            {
                Id = d.Id,
                Number = d.Number,
                Date = d.Date,
                Resources = d.ReceiptResources.Select(rr => new ReceiptResourceDto
                {
                    Id = rr.Id,
                    Name = rr.Resource.Name,
                    MeasureUnitName = rr.MeasureUnit.Name,
                    Quantity = rr.Quantity
                }).ToList()
            })
            .ToListAsync();

        return Ok(documents);
    }

    [HttpGet("documents/{id:guid}")]
    public async Task<ActionResult> GetDocuments(Guid id)
    {
        var query = _dbContext.ReceiptDocuments
        .Include(d => d.ReceiptResources)
            .ThenInclude(rr => rr.Resource)
        .Include(d => d.ReceiptResources)
            .ThenInclude(rr => rr.MeasureUnit)
        .AsQueryable();

        query = query.Where(d => d.Id == id);

        var document = await query
            .Select(d => new DocumentWithResourcesDto
            {
                Id = d.Id,
                Number = d.Number,
                Date = d.Date,
                Resources = d.ReceiptResources.Select(rr => new ReceiptResourceDto
                {
                    Id = rr.Id,
                    Name = rr.Resource.Name,
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

    [HttpPost("resources")]
    public async Task<ActionResult<Guid>> CraeteResource([FromBody] CreateReceiptResourceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var resource = await _dbContext.Resources.FindAsync(request.ResourceId);

        if (resource == null)
        {
            return NotFound($"Resource with ID {request.ResourceId} not found.");
        }

        var measureUnit = await _dbContext.MeasureUnits.FindAsync(request.MeasureUnitId);

        if (measureUnit == null)
        {
            return NotFound($"Measure unit with ID {request.MeasureUnitId} not found.");
        }

        var receiptResource = new ReceiptResourceEntity()
        {
            Id = Guid.NewGuid(),
            ResourceId = request.ResourceId,
            Resource = resource,
            MeasureUnitId = request.MeasureUnitId,
            MeasureUnit = measureUnit,
            Quantity = request.Quantity,
            ReceiptDocumentId = null
        };

        _dbContext.ReceiptResources.Add(receiptResource);
        await _dbContext.SaveChangesAsync();

        return Ok(receiptResource.Id);
    }

    [HttpPost("documents")]
    public async Task<ActionResult<Guid>> CraeteDocument([FromBody] CreateReceiptDocumentRequest request)
    {
        if (!ModelState.IsValid) 
        { 
            return BadRequest(ModelState); 
        }

        var resourceIds = request.ReceiptResourceIds.ToList();
        var resources = await _dbContext.ReceiptResources
            .Where(rr => resourceIds.Contains(rr.Id) && rr.ReceiptDocumentId == null)
            .ToListAsync();

        if (resources.Count != resourceIds.Count)
        {
            return BadRequest("One or more resources are invalid or already assigned to a document.");
        }

        var document = new ReceiptDocumentEntity()
        {
            Id = Guid.NewGuid(),
            Number = request.Number,
            Date = request.Date,
            ReceiptResources = new List<ReceiptResourceEntity>()
        };

        foreach (var resource in resources)
        {
            resource.ReceiptDocumentId = document.Id;
            resource.ReceiptDocument = document;
            document.ReceiptResources.Add(resource);
        }

        _dbContext.ReceiptDocuments.Add(document);
        await BalanceHelper.UpdateReceiptsBalanceAsync(resources, _dbContext);
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

    [HttpPut("documents/{id:guid}")]
    public async Task<ActionResult> UpdateDocument(Guid id,[FromBody] UpdateReceiptDocumentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var document = await _dbContext.ReceiptDocuments.FindAsync(id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found");
        }

        document.Number = request.NewNumber;
        document.Date = request.NewDate;

        var resourceIds = request.NewReceiptResourceIds.ToList();
        var resources = await _dbContext.ReceiptResources
            .Where(rr => resourceIds.Contains(rr.Id) && rr.ReceiptDocumentId == null)
            .ToListAsync();

        if (resources.Count != resourceIds.Count)
        {
            return BadRequest("One or more resources are invalid or already assigned to a document.");
        }

        foreach (var resource in resources)
        {
            resource.ReceiptDocumentId = document.Id;
            resource.ReceiptDocument = document;
            document.ReceiptResources.Add(resource);
        }

        await BalanceHelper.UpdateReceiptsBalanceAsync(resources, _dbContext);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("resources/{id:guid}")]
    public async Task<ActionResult> DeleteResource(Guid id)
    {
        var resource = await _dbContext.ReceiptResources.FindAsync(id);

        if (resource == null)
        {
            return NotFound($"Resource with ID {id} not found.");
        }

        _dbContext.ReceiptResources.Remove(resource);
        await BalanceHelper.DecreaseReceiptsBalanceAsync(new List<ReceiptResourceEntity>() { resource }, _dbContext);
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("documents/{id:guid}")]
    public async Task<ActionResult> DeleteDocument(Guid id)
    {
        var document = await _dbContext.ReceiptDocuments
            .Include(d => d.ReceiptResources)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found.");
        }

        await BalanceHelper.DecreaseReceiptsBalanceAsync(document.ReceiptResources, _dbContext);

        _dbContext.ReceiptDocuments.Remove(document);
        //await BalanceHelper.DecreaseReceiptsBalanceAsync(document.ReceiptResources, _dbContext);
        await _dbContext.SaveChangesAsync();

        return Ok("Success");
    }
}
