using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WarehouseManagement.DataAccess.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class ChangeSomeConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptResource_MeasureUnits_MeasureUnitID",
                table: "ReceiptResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptResource_Resources_ResourceID",
                table: "ReceiptResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentResource_MeasureUnits_MeasureUnitID",
                table: "ShipmentResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentResource_Resources_ResourceID",
                table: "ShipmentResource");

            migrationBuilder.AlterColumn<Guid>(
                name: "ReceiptDocumentID",
                table: "ReceiptResource",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Balance_ResourceID_MeasureUnitID",
                table: "Balance",
                columns: new[] { "ResourceID", "MeasureUnitID" });

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptResource_MeasureUnits_MeasureUnitID",
                table: "ReceiptResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptResource_Resources_ResourceID",
                table: "ReceiptResource",
                column: "ResourceID",
                principalTable: "Resources",
                principalColumn: "ResourceID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentResource_MeasureUnits_MeasureUnitID",
                table: "ShipmentResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentResource_Resources_ResourceID",
                table: "ShipmentResource",
                column: "ResourceID",
                principalTable: "Resources",
                principalColumn: "ResourceID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptResource_MeasureUnits_MeasureUnitID",
                table: "ReceiptResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ReceiptResource_Resources_ResourceID",
                table: "ReceiptResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentResource_MeasureUnits_MeasureUnitID",
                table: "ShipmentResource");

            migrationBuilder.DropForeignKey(
                name: "FK_ShipmentResource_Resources_ResourceID",
                table: "ShipmentResource");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Balance_ResourceID_MeasureUnitID",
                table: "Balance");

            migrationBuilder.AlterColumn<Guid>(
                name: "ReceiptDocumentID",
                table: "ReceiptResource",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptResource_MeasureUnits_MeasureUnitID",
                table: "ReceiptResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReceiptResource_Resources_ResourceID",
                table: "ReceiptResource",
                column: "ResourceID",
                principalTable: "Resources",
                principalColumn: "ResourceID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentResource_MeasureUnits_MeasureUnitID",
                table: "ShipmentResource",
                column: "MeasureUnitID",
                principalTable: "MeasureUnits",
                principalColumn: "MeasureUnitID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ShipmentResource_Resources_ResourceID",
                table: "ShipmentResource",
                column: "ResourceID",
                principalTable: "Resources",
                principalColumn: "ResourceID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
