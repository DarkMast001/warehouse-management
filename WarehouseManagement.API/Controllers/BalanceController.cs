using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WarehouseManagement.API.DTOs;
using WarehouseManagement.DataAccess.Postgres;

namespace WarehouseManagement.API.Controllers
{
    [Route("balance")]
    [ApiController]
    public class BalanceController : ControllerBase
    {
        private readonly WarehouseDbContext _dbContext;

        public BalanceController(WarehouseDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet]
        public ActionResult GetAllBalance()
        {
            return Ok(_dbContext.Balances);
        }

        [HttpPost()]
        public async Task<ActionResult> GetFilteredBalance([FromBody] FilterBalanceRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (request.ResourceId.Equals("") && request.MeasureUnitId.Equals(""))
            {
                return GetAllBalance();
            }
            else if (!request.ResourceId.Equals("") && request.MeasureUnitId.Equals(""))
            {
                var balances = await _dbContext.Balances.Where(b => b.ResourceId.ToString().Equals(request.ResourceId)).ToListAsync();
                return Ok(balances);
            }
            else if (request.ResourceId.Equals("") && !request.MeasureUnitId.Equals(""))
            {
                var balances = await _dbContext.Balances.Where(b => b.MeasureUnitId.ToString().Equals(request.MeasureUnitId)).ToListAsync();
                return Ok(balances);
            }
            else if (!request.ResourceId.Equals("") && !request.MeasureUnitId.Equals(""))
            {
                var balances = await _dbContext.Balances.Where(b => 
                    b.ResourceId.ToString().Equals(request.ResourceId) && 
                    b.MeasureUnitId.ToString().Equals(request.MeasureUnitId)
                    ).ToListAsync();
                return Ok(balances);
            }

            return BadRequest("Something went wrong");
        }
    }
}
