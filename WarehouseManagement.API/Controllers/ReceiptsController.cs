using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.API.Services;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Models;

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

    [HttpGet("documents/{id:guid}")]
    public async Task<ActionResult> GetDocuments(Guid id)
    {
        var document = await _dbContext.ReceiptDocuments.FindAsync(id);

        if (document == null)
        {
            return NotFound($"Document with ID {id} not found.");
        }

        return Ok(document);
    }

    [HttpGet("resourcesindocument/{id:guid}")]
    public ActionResult GetResourcesinDocument(Guid id)
    {
        var resources = _dbContext.ReceiptResources.Where(rr => rr.ReceiptDocumentId == id);

        if (resources == null)
        {
            return NotFound($"Resource attached to document with ID {id} not found.");
        }

        return Ok(resources);
    }

    [HttpPost("documents/filter")]
    public async Task<ActionResult> GetFilterDocuments([FromBody] FilterReceiptsRequest request)
    {
        return Ok(); 
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
        await _dbContext.SaveChangesAsync();

        return Ok(document.Id);
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
