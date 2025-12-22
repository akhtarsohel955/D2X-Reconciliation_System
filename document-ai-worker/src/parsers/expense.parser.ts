// Expense parser for Amazon Textract AnalyzeExpense output

type SummaryField = {
  Type?: { Text?: string };
  ValueDetection?: { Text?: string };
};

type LineItemExpenseField = {
  Type?: { Text?: string };
  ValueDetection?: { Text?: string };
};

type LineItem = {
  LineItemExpenseFields?: LineItemExpenseField[];
};

type LineItemGroup = {
  LineItems?: LineItem[];
};

type ExpenseDocument = {
  SummaryFields?: SummaryField[];
  LineItemGroups?: LineItemGroup[];
};

// ===== Parsed Output Types =====

export interface ParsedExpense {
  vendor?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  lineItems: ParsedLineItem[];
}

export interface ParsedLineItem {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
}

// ===== Utility Helpers =====

function toNumber(value?: string): number | undefined {
  if (!value) return undefined;

  const cleaned = value.replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);

  return isNaN(num) ? undefined : num;
}

// ===== SUMMARY FIELD MAPPING =====

const SUMMARY_FIELD_MAP: Record<string, keyof ParsedExpense> = {
  VENDOR_NAME: 'vendor',
  INVOICE_RECEIPT_ID: 'invoiceNumber',
  INVOICE_RECEIPT_DATE: 'invoiceDate',
  SUBTOTAL: 'subtotal',
  TAX: 'tax',
  TOTAL: 'total',
  CURRENCY: 'currency',
};

// ===== MAIN PARSER =====

export function parseExpenseDocuments(
  expenseDocuments: ExpenseDocument[],
): ParsedExpense {
  const result: ParsedExpense = {
    lineItems: [],
  };

  if (!expenseDocuments || expenseDocuments.length === 0) {
    return result;
  }

  // Usually only one document per invoice
  const doc = expenseDocuments[0];

  // -------- Parse Summary Fields --------
  if (doc.SummaryFields) {
    for (const field of doc.SummaryFields) {
      const type = field.Type?.Text;
      const value = field.ValueDetection?.Text;

      if (!type || !value) continue;

      const mappedKey = SUMMARY_FIELD_MAP[type];

      if (!mappedKey) continue;

      if (
        mappedKey === 'subtotal' ||
        mappedKey === 'tax' ||
        mappedKey === 'total'
      ) {
        (result as any)[mappedKey] = toNumber(value);
      } else {
        (result as any)[mappedKey] = value;
      }
    }
  }

  // -------- Parse Line Items --------
  if (doc.LineItemGroups) {
    for (const group of doc.LineItemGroups) {
      if (!group.LineItems) continue;

      for (const item of group.LineItems) {
        const parsedItem: ParsedLineItem = {};

        if (!item.LineItemExpenseFields) continue;

        for (const field of item.LineItemExpenseFields) {
          const type = field.Type?.Text;
          const value = field.ValueDetection?.Text;

          if (!type || !value) continue;

          switch (type) {
            case 'ITEM':
              parsedItem.description = value;
              break;

            case 'QUANTITY':
              parsedItem.quantity = toNumber(value);
              break;

            case 'PRICE':
              parsedItem.unitPrice = toNumber(value);
              break;

            case 'AMOUNT':
              parsedItem.amount = toNumber(value);
              break;
          }
        }

        // Skip empty rows
        if (
          parsedItem.description ||
          parsedItem.quantity ||
          parsedItem.unitPrice ||
          parsedItem.amount
        ) {
          // Default quantity
          if (!parsedItem.quantity) {
            parsedItem.quantity = 1;
          }

          result.lineItems.push(parsedItem);
        }
      }
    }
  }

  return result;
}
