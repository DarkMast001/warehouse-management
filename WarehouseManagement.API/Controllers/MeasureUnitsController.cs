using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Enums;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers;

[Route("measureunits")]
[ApiController]
public class MeasureUnitsController : ControllerBase
{
    private readonly WarehouseDbContext _dbContext;

    public MeasureUnitsController(WarehouseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public ActionResult GetALLMeasureUnits()
    {
        return Ok(_dbContext.MeasureUnits);
    }

    [HttpGet("active")]
    public async Task<ActionResult> GetActiveMeasureUnits()
    {
        var activeMeasureUnits = await _dbContext.MeasureUnits.Where(c => c.ArchivingState == ArchivingState.WORKING).ToListAsync();
        return Ok(activeMeasureUnits);
    }

    [HttpGet("archived")]
    public async Task<ActionResult> GetArchivedMeasureUnits()
    {
        var archivedMeasureUnits = await _dbContext.MeasureUnits.Where(c => c.ArchivingState == ArchivingState.ARCHIVE).ToListAsync();
        return Ok(archivedMeasureUnits);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetMeasureUnitById(Guid id)
    {
        var measureUnit = await _dbContext.MeasureUnits.FindAsync(id);

        if (measureUnit == null)
        {
            return NotFound($"Measure unit with ID {id} not found.");
        }

        return Ok(measureUnit);
    }

    [HttpPost()]
    public async Task<ActionResult> CreateMeasureUnit([FromBody] CreateMeasureUnitRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest("Invalid input request");
        }

        bool exist = await _dbContext.MeasureUnits.AnyAsync(m => m.Name == request.Name);

        if (exist)
        {
            return Conflict($"Measure unit with name '{request.Name}' already exists.");
        }

        var measureUnit = new MeasureUnitEntity()
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ArchivingState = ArchivingState.WORKING
        };

        _dbContext.MeasureUnits.Add(measureUnit);

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = measureUnit.Id, Name = measureUnit.Name });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateMeasureUnitName(Guid id, [FromBody] UpdateMeasureUnitRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var measureUnit = await _dbContext.MeasureUnits.FindAsync(id);

        if (measureUnit == null)
        {
            return NotFound($"Measure unit with ID {id} not found.");
        }

        bool nameExists = await _dbContext.MeasureUnits.AnyAsync(r => r.Name == request.NewName && r.Id != id);

        if (nameExists)
        {
            return Conflict($"Measure unit with name '{request.NewName}' already exists.");
        }

        measureUnit.Name = request.NewName;

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = measureUnit.Id, Name = measureUnit.Name });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveMeasureUnit(Guid id)
    {
        var measureUnit = await _dbContext.MeasureUnits.FindAsync(id);

        if (measureUnit == null)
        {
            return NotFound($"Measure unit with ID {id} not found.");
        }

        if (measureUnit.ArchivingState == ArchivingState.ARCHIVE)
        {
            return Conflict("Measure unit is already archived.");
        }

        measureUnit.ArchivingState = ArchivingState.ARCHIVE;

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = measureUnit.Id, ArchivingState = measureUnit.ArchivingState });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPost("{id:guid}/unarchive")]
    public async Task<ActionResult> UnarchiveMeasureUnit(Guid id)
    {
        var measureUnit = await _dbContext.MeasureUnits.FindAsync(id);

        if (measureUnit == null)
        {
            return NotFound($"Measure unit with ID {id} not found.");
        }

        if (measureUnit.ArchivingState == ArchivingState.WORKING)
        {
            return Conflict("Measure unit is already active.");
        }

        measureUnit.ArchivingState = ArchivingState.WORKING;

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = measureUnit.Id, ArchivingState = measureUnit.ArchivingState });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteMeasureUnit(Guid id)
    {
        var measureUnit = await _dbContext.MeasureUnits.FindAsync(id);

        if (measureUnit == null)
        {
            return NotFound($"Measure unit with ID {id} not found.");
        }

        _dbContext.MeasureUnits.Remove(measureUnit);

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok("Success");
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx ? pgEx.SqlState == "23503" : false)
        {
            return Conflict("Cannot delete measure unit because it is used in one or more documents.");
        }
    }
}
