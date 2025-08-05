using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WarehouseManagement.DataAccess.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAlternativeKeyAtBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_Balance_ResourceID_MeasureUnitID",
                table: "Balance");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "AK_Balance_ResourceID_MeasureUnitID",
                table: "Balance",
                columns: new[] { "ResourceID", "MeasureUnitID" });
        }
    }
}
