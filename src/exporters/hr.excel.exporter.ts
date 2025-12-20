import ExcelJS from 'exceljs';
import { HRParsedResult } from '../parsers/hr.parser';

/**
 * Generate Excel for HR documents
 */
export async function generateHRExcel(
  hrData: HRParsedResult,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  /* =========================
     Sheet 1: Employee Details
     ========================= */

  const employeeSheet = workbook.addWorksheet('Employee Details');

  employeeSheet.columns = [
    { header: 'Field', key: 'field', width: 30 },
    { header: 'Value', key: 'value', width: 40 },
  ];

  Object.entries(hrData.employeeDetails).forEach(
    ([field, value]) => {
      if (value) {
        employeeSheet.addRow({
          field: humanize(field),
          value,
        });
      }
    },
  );

  employeeSheet.getRow(1).font = { bold: true };

  /* =========================
     Sheet 2: Employment Details
     ========================= */

  const employmentSheet =
    workbook.addWorksheet('Employment Details');

  employmentSheet.columns = [
    { header: 'Field', key: 'field', width: 30 },
    { header: 'Value', key: 'value', width: 40 },
  ];

  Object.entries(hrData.employmentDetails).forEach(
    ([field, value]) => {
      if (value) {
        employmentSheet.addRow({
          field: humanize(field),
          value,
        });
      }
    },
  );

  employmentSheet.getRow(1).font = { bold: true };

  /* =========================
     Sheets for Tables
     ========================= */

  hrData.tables.forEach((table, index) => {
    const sheetName = `Table ${index + 1}`;
    const tableSheet = workbook.addWorksheet(sheetName);

    if (table.headers.length > 0) {
      tableSheet.columns = table.headers.map((h) => ({
        header: h,
        key: h,
        width: 25,
      }));

      table.rows.forEach((row) => {
        const rowObj: Record<string, string> = {};
        table.headers.forEach((header, idx) => {
          rowObj[header] = row[idx] || '';
        });
        tableSheet.addRow(rowObj);
      });

      tableSheet.getRow(1).font = { bold: true };
    }
  });

  /* =========================
     Generate Excel Buffer
     ========================= */

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/* =========================
   Helper: camelCase → Title Case
   ========================= */

function humanize(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
}
