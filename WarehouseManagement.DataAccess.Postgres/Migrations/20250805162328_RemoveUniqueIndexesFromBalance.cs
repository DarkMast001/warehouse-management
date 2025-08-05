using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WarehouseManagement.DataAccess.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueIndexesFromBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddUniqueConstraint(
                name: "AK_Balance_ResourceID_MeasureUnitID",
                table: "Balance",
                columns: new[] { "ResourceID", "MeasureUnitID" });

            migrationBuilder.DropIndex(
                name: "IX_Balance_MeasureUnitID",
                table: "Balance");

            migrationBuilder.DropIndex(
                name: "IX_Balance_ResourceID",
                table: "Balance");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_Balance_ResourceID_MeasureUnitID",
                table: "Balance");
        }
    }
}
