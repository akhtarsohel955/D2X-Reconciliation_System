import ExcelJS from 'exceljs';
import { ParsedExpense } from '../parsers/expense.parser';

export async function generateExpenseExcel(
  expense: ParsedExpense,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  // ===== Sheet 1: Summary =====
  const summarySheet = workbook.addWorksheet('Summary');

  summarySheet.columns = [
    { header: 'Field', key: 'field', width: 25 },
    { header: 'Value', key: 'value', width: 40 },
  ];

  const summaryRows = [
    { field: 'Vendor', value: expense.vendor },
    { field: 'Invoice Number', value: expense.invoiceNumber },
    { field: 'Invoice Date', value: expense.invoiceDate },
    { field: 'Subtotal', value: expense.subtotal },
    { field: 'Tax', value: expense.tax },
    { field: 'Total', value: expense.total },
    { field: 'Currency', value: expense.currency },
  ];

  summaryRows.forEach((row) => {
    if (row.value !== undefined) {
      summarySheet.addRow(row);
    }
  });

  summarySheet.getRow(1).font = { bold: true };

  // ===== Sheet 2: Line Items =====
  const itemsSheet = workbook.addWorksheet('Line Items');

  itemsSheet.columns = [
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Quantity', key: 'quantity', width: 15 },
    { header: 'Unit Price', key: 'unitPrice', width: 20 },
    { header: 'Amount', key: 'amount', width: 20 },
  ];

  expense.lineItems.forEach((item) => {
    itemsSheet.addRow({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    });
  });

  itemsSheet.getRow(1).font = { bold: true };

  // ===== Generate Excel Buffer =====
  const buffer = await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}
