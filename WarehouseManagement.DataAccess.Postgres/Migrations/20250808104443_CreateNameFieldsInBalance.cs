using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WarehouseManagement.DataAccess.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class CreateNameFieldsInBalance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MeasureUnitName",
                table: "Balance",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResourceName",
                table: "Balance",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MeasureUnitName",
                table: "Balance");

            migrationBuilder.DropColumn(
                name: "ResourceName",
                table: "Balance");
        }
    }
}
