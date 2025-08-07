using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Enums;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers;

[Route("resources")]
[ApiController]
public class ResourcesController : ControllerBase
{
    private readonly WarehouseDbContext _dbContext;

    public ResourcesController(WarehouseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public ActionResult GetResources()
    {
        return Ok(_dbContext.Resources);
    }

    [HttpPost("create")]
    public async Task<ActionResult> Create([FromBody] CreateResourceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        bool exist = await _dbContext.Resources.AnyAsync(r => r.Name == request.Name);

        if (exist)
        {
            return BadRequest($"Resource with name '{request.Name}' already exists.");
        }

        var resource = new ResourceEntity()
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ArchivingState = DataAccess.Postgres.Enums.ArchivingState.WORKING
        };

        _dbContext.Resources.Add(resource);

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok( new { Id = resource.Id, Name = resource.Name });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateResourceName(Guid id, [FromBody] UpdateResourceNameRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var resource = await _dbContext.Resources.FindAsync(id);

        if (resource == null)
        {
            return NotFound($"Resource with ID {id} not found.");
        }

        bool nameExists = await _dbContext.Resources.AnyAsync(r => r.Name == request.NewName && r.Id != id);

        if (nameExists)
        {
            return BadRequest($"Resource with name '{request.NewName}' already exists.");
        }

        resource.Name = request.NewName;

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = resource.Id, Name = resource.Name });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveResource(Guid id)
    {
        var resource = await _dbContext.Resources.FindAsync(id);

        if (resource == null)
        {
            return NotFound($"Resource with ID {id} not found.");
        }

        if (resource.ArchivingState == ArchivingState.ARCHIVE)
        {
            return BadRequest("Resource is already archived.");
        }

        resource.ArchivingState = ArchivingState.ARCHIVE;

        await _dbContext.SaveChangesAsync();
        return Ok(new { Id = resource.Id, State = resource.ArchivingState });
    }

    [HttpPost("{id:guid}/unarchive")]
    public async Task<ActionResult> UnarchiveResource(Guid id)
    {
        var resource = await _dbContext.Resources.FindAsync(id);

        if (resource == null)
        {
            return NotFound($"Resource with ID {id} not found.");
        }

        if (resource.ArchivingState == ArchivingState.WORKING)
        {
            return BadRequest("Resource is already active.");
        }

        resource.ArchivingState = ArchivingState.WORKING;

        await _dbContext.SaveChangesAsync();
        return Ok(new { Id = resource.Id, State = resource.ArchivingState });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteResource(Guid id)
    {
        var resource = await _dbContext.Resources.FindAsync(id);

        if (resource == null)
        {
            return NotFound($"Resource with ID {id} not found.");
        }

        _dbContext.Resources.Remove(resource);
        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok("Success");
        }
        catch (DbUpdateException ex) when(ex.InnerException is PostgresException pgEx ? pgEx.SqlState == "23503" : false)
        {
            return Conflict("Cannot delete resource because it is used in one or more documents.");
        }
    }
}
