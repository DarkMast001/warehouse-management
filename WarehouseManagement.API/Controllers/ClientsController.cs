using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres;
using WarehouseManagement.DataAccess.Postgres.Enums;
using WarehouseManagement.DataAccess.Postgres.Models;

namespace WarehouseManagement.API.Controllers;

[Route("clients")]
[ApiController]
public class ClientsController : ControllerBase
{
    private readonly WarehouseDbContext _dbContext;

    public ClientsController(WarehouseDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("active")]
    public async Task<ActionResult> GetActiveClients()
    {
        var activeClients = await _dbContext.Clients.Where(c => c.ArchivingState == ArchivingState.WORKING).ToListAsync();
        return Ok(activeClients);
    }

    [HttpGet("archived")]
    public async Task<ActionResult> GetArchivedClients()
    {
        var archivedClients = await _dbContext.Clients.Where(c => c.ArchivingState == ArchivingState.ARCHIVE).ToListAsync();
        return Ok(archivedClients);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetClientById(Guid id)
    {
        var client = await _dbContext.Clients.FindAsync(id);

        if (client == null)
        {
            return BadRequest($"Client with ID {id} not found.");
        }

        return Ok(client);
    }

    [HttpPost()]
    public async Task<ActionResult> CreateClient([FromBody] CreateClientRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        bool exist = await _dbContext.Clients.AnyAsync(c => c.Name == request.Name);

        if (exist)
        {
            return BadRequest($"Client with name '{request.Name}' already exists.");
        }

        var client = new ClientEntity()
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Address = request.Address,
            ArchivingState = DataAccess.Postgres.Enums.ArchivingState.WORKING
        };

        _dbContext.Clients.Add(client);

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = client.Id, Name = client.Name, Address = client.Address });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateClientData(Guid id, [FromBody] UpdateClientRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var client = await _dbContext.Clients.FindAsync(id);

        if (client == null)
        {
            return NotFound($"Client with ID {id} not found.");
        }

        bool nameExists = await _dbContext.Clients.AnyAsync(r => r.Name == request.NewName && r.Id != id);

        if (nameExists)
        {
            return BadRequest($"Measure unit with name '{request.NewName}' already exists.");
        }

        client.Name = request.NewName;
        client.Address = request.NewAddress;

        try
        {
            await _dbContext.SaveChangesAsync();
            return Ok(new { Id = client.Id, Name = client.Name, Address = client.Address });
        }
        catch (DbUpdateException e)
        {
            return BadRequest($"{e}\n{e.InnerException}");
        }
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult> ArchiveClient(Guid id)
    {
        var client = await _dbContext.Clients.FindAsync(id);

        if (client == null)
        {
            return NotFound($"Client with ID {id} not found.");
        }

        if (client.ArchivingState == ArchivingState.ARCHIVE)
        {
            return BadRequest("Client is already archived.");
        }

        client.ArchivingState = ArchivingState.ARCHIVE;

        await _dbContext.SaveChangesAsync();
        return Ok(new { Id = client.Id, State = client.ArchivingState });
    }

    [HttpPost("{id:guid}/unarchive")]
    public async Task<ActionResult> UnarchiveClient(Guid id)
    {
        var client = await _dbContext.Clients.FindAsync(id);

        if (client == null)
        {
            return NotFound($"Client with ID {id} not found.");
        }

        if (client.ArchivingState == ArchivingState.WORKING)
        {
            return BadRequest("Client is already active.");
        }

        client.ArchivingState = ArchivingState.WORKING;

        await _dbContext.SaveChangesAsync();
        return Ok(new { Id = client.Id, State = client.ArchivingState });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteClient(Guid id)
    {
        var client = await _dbContext.Clients.FindAsync(id);

        if (client == null)
        {
            return NotFound($"Client with ID {id} not found.");
        }

        _dbContext.Clients.Remove(client);

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
