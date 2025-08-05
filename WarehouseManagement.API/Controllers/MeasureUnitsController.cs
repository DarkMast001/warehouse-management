using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Enums;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers
{
    [Route("measureunits")]
    [ApiController]
    public class MeasureUnitsController : ControllerBase
    {
        private readonly WarehouseDbContext _dbContext;

        public MeasureUnitsController(WarehouseDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("create")]
        public async Task<ActionResult> CreateMeasureUnit([FromBody] CreateMeasureUnitRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid input request");
            }

            bool exist = await _dbContext.MeasureUnits.AnyAsync(m => m.Name == request.Name);

            if (exist)
            {
                return BadRequest($"Measure unit with name '{request.Name}' already exists.");
            }

            var measureUnit = new MeasureUnitEntity()
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                ArchivingState = DataAccess.Postgres.Enums.ArchivingState.WORKING
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
                return BadRequest($"Measure unit with name '{request.NewName}' already exists.");
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
                return BadRequest("Measure unit is already archived.");
            }

            measureUnit.ArchivingState = ArchivingState.ARCHIVE;

            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = measureUnit.Id, State = measureUnit.ArchivingState });
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
                return BadRequest("Measure unit is already active.");
            }

            measureUnit.ArchivingState = ArchivingState.WORKING;

            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = measureUnit.Id, State = measureUnit.ArchivingState });
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
                return Conflict("Cannot delete resource because it is used in one or more documents.");
            }
        }
    }
}
