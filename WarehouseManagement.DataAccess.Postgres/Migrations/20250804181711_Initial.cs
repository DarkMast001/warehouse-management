using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WarehouseManagement.DataAccess.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    ClientID = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ArchivingState = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.ClientID);
                });

            migrationBuilder.CreateTable(
                name: "MeasureUnit",
                columns: table => new
                {
                    MeasureUnitID = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ArchivingState = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MeasureUnit", x => x.MeasureUnitID);
                });

            migrationBuilder.CreateTable(
                name: "ReceiptDocument",
                columns: table => new
                {
                    ReceiptDocumentID = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReceiptDocument", x => x.ReceiptDocumentID);
                });

            migrationBuilder.CreateTable(
                name: "Resources",
                columns: table => new
                {
                    ResourceID = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ArchivingState = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resources", x => x.ResourceID);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentDocument",
                columns: table => new
                {
                    ShipmentDocumentID = table.Column<Guid>(type: "uuid", nullable: false),
                    Number = table.Column<int>(type: "integer", nullable: false),
                    ClientID = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "date", nullable: false),
                    DocumentState = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentDocument", x => x.ShipmentDocumentID);
                    table.ForeignKey(
                        name: "FK_ShipmentDocument_Clients_ClientID",
                        column: x => x.ClientID,
                        principalTable: "Clients",
                        principalColumn: "ClientID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Balance",
                columns: table => new
                {
                    BalanceID = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceID = table.Column<Guid>(type: "uuid", nullable: false),
                    MeasureUnitID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Balance", x => x.BalanceID);
                    table.ForeignKey(
                        name: "FK_Balance_MeasureUnit_MeasureUnitID",
                        column: x => x.MeasureUnitID,
                        principalTable: "MeasureUnit",
                        principalColumn: "MeasureUnitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Balance_Resources_ResourceID",
                        column: x => x.ResourceID,
                        principalTable: "Resources",
                        principalColumn: "ResourceID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReceiptResource",
                columns: table => new
                {
                    ReceiptResourceID = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceID = table.Column<Guid>(type: "uuid", nullable: false),
                    MeasureUnitID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    ReceiptDocumentID = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReceiptResource", x => x.ReceiptResourceID);
                    table.ForeignKey(
                        name: "FK_ReceiptResource_MeasureUnit_MeasureUnitID",
                        column: x => x.MeasureUnitID,
                        principalTable: "MeasureUnit",
                        principalColumn: "MeasureUnitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReceiptResource_ReceiptDocument_ReceiptDocumentID",
                        column: x => x.ReceiptDocumentID,
                        principalTable: "ReceiptDocument",
                        principalColumn: "ReceiptDocumentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReceiptResource_Resources_ResourceID",
                        column: x => x.ResourceID,
                        principalTable: "Resources",
                        principalColumn: "ResourceID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentResource",
                columns: table => new
                {
                    ShipmentResourceID = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceID = table.Column<Guid>(type: "uuid", nullable: false),
                    MeasureUnitID = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    ShipmentDocumentID = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentResource", x => x.ShipmentResourceID);
                    table.ForeignKey(
                        name: "FK_ShipmentResource_MeasureUnit_MeasureUnitID",
                        column: x => x.MeasureUnitID,
                        principalTable: "MeasureUnit",
                        principalColumn: "MeasureUnitID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ShipmentResource_Resources_ResourceID",
                        column: x => x.ResourceID,
                        principalTable: "Resources",
                        principalColumn: "ResourceID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ShipmentResource_ShipmentDocument_ShipmentDocumentID",
                        column: x => x.ShipmentDocumentID,
                        principalTable: "ShipmentDocument",
                        principalColumn: "ShipmentDocumentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Balance_MeasureUnitID",
                table: "Balance",
                column: "MeasureUnitID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Balance_ResourceID",
                table: "Balance",
                column: "ResourceID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Clients_Name",
                table: "Clients",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MeasureUnit_Name",
                table: "MeasureUnit",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReceiptDocument_Number",
                table: "ReceiptDocument",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReceiptResource_MeasureUnitID",
                table: "ReceiptResource",
                column: "MeasureUnitID");

            migrationBuilder.CreateIndex(
                name: "IX_ReceiptResource_ReceiptDocumentID",
                table: "ReceiptResource",
                column: "ReceiptDocumentID");

            migrationBuilder.CreateIndex(
                name: "IX_ReceiptResource_ResourceID",
                table: "ReceiptResource",
                column: "ResourceID");

            migrationBuilder.CreateIndex(
                name: "IX_Resources_Name",
                table: "Resources",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentDocument_ClientID",
                table: "ShipmentDocument",
                column: "ClientID");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentDocument_Number",
                table: "ShipmentDocument",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentResource_MeasureUnitID",
                table: "ShipmentResource",
                column: "MeasureUnitID");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentResource_ResourceID",
                table: "ShipmentResource",
                column: "ResourceID");

            migrationBuilder.CreateIndex(
                name: "IX_ShipmentResource_ShipmentDocumentID",
                table: "ShipmentResource",
                column: "ShipmentDocumentID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Balance");

            migrationBuilder.DropTable(
                name: "ReceiptResource");

            migrationBuilder.DropTable(
                name: "ShipmentResource");

            migrationBuilder.DropTable(
                name: "ReceiptDocument");

            migrationBuilder.DropTable(
                name: "MeasureUnit");

            migrationBuilder.DropTable(
                name: "Resources");

            migrationBuilder.DropTable(
                name: "ShipmentDocument");

            migrationBuilder.DropTable(
                name: "Clients");
        }
    }
}
