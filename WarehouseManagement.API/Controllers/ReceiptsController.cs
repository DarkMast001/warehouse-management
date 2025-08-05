using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers
{
    [Route("receipts")]
    [ApiController]
    public class ReceiptsController : ControllerBase
    {
        private readonly WarehouseDbContext _dbContext;

        public ReceiptsController(WarehouseDbContext dbContext)
        {
            _dbContext = dbContext;
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
            await UpdateBalanceAsync(resources);
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

            await UpdateBalanceAsync(resources);
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
            await DecreaseBalanceAsync(new List<ReceiptResourceEntity>() { resource });
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

            await DecreaseBalanceAsync(document.ReceiptResources);

            _dbContext.ReceiptDocuments.Remove(document);
            await DecreaseBalanceAsync(document.ReceiptResources);
            await _dbContext.SaveChangesAsync();

            return Ok("Success");
        }

        private async Task UpdateBalanceAsync(List<ReceiptResourceEntity> resources)
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

        private async Task DecreaseBalanceAsync(List<ReceiptResourceEntity> resources)
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
}
