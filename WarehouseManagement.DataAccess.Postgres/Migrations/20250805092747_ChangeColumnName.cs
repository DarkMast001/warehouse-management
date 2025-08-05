using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WarehouseManagement.DataAccess.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class ChangeColumnName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Balance_MeasureUnit_MeasureUnitID",
                table: "Balance");

            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptResource_MeasureUnit_MeasureUnitID",
                table: "ReceiptResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentResource_MeasureUnit_MeasureUnitID",
                table: "ShipmentResource");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MeasureUnit",
                table: "MeasureUnit");

            migrationBuilder.RenameTable(
                name: "MeasureUnit",
                newName: "MeasureUnits");

            migrationBuilder.RenameIndex(
                name: "IX_MeasureUnit_Name",
                table: "MeasureUnits",
                newName: "IX_MeasureUnits_Name");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MeasureUnits",
                table: "MeasureUnits",
                column: "MeasureUnitID");

            migrationBuilder.AddForeignKey(
                name: "FK_Balance_MeasureUnits_MeasureUnitID",
                table: "Balance",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptResource_MeasureUnits_MeasureUnitID",
                table: "ReceiptResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentResource_MeasureUnits_MeasureUnitID",
                table: "ShipmentResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Balance_MeasureUnits_MeasureUnitID",
                table: "Balance");

            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptResource_MeasureUnits_MeasureUnitID",
                table: "ReceiptResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentResource_MeasureUnits_MeasureUnitID",
                table: "ShipmentResource");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MeasureUnits",
                table: "MeasureUnits");

            migrationBuilder.RenameTable(
                name: "MeasureUnits",
                newName: "MeasureUnit");

            migrationBuilder.RenameIndex(
                name: "IX_MeasureUnits_Name",
                table: "MeasureUnit",
                newName: "IX_MeasureUnit_Name");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MeasureUnit",
                table: "MeasureUnit",
                column: "MeasureUnitID");

            migrationBuilder.AddForeignKey(
                name: "FK_Balance_MeasureUnit_MeasureUnitID",
                table: "Balance",
                column: "MeasureUnitID",
                principalTable: "MeasureUnit",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptResource_MeasureUnit_MeasureUnitID",
                table: "ReceiptResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnit",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentResource_MeasureUnit_MeasureUnitID",
                table: "ShipmentResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnit",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
