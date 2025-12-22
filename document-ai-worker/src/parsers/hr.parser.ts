/* =========================================================
   HR Parser for Amazon Textract AnalyzeDocument (FORMS+TABLES)
   ========================================================= */

type Block = {
  Id: string;
  BlockType: string;
  Text?: string;
  Relationships?: {
    Type: string;
    Ids: string[];
  }[];
  RowIndex?: number;
  ColumnIndex?: number;
};

/* =======================
   Parsed Output Interfaces
   ======================= */

export interface HRParsedResult {
  employeeDetails: {
    name?: string;
    employeeId?: string;
    email?: string;
    phone?: string;
    designation?: string;
    department?: string;
  };

  employmentDetails: {
    joiningDate?: string;
    salary?: string;
    employmentType?: string;
    location?: string;
  };

  tables: {
    title?: string;
    headers: string[];
    rows: string[][];
  }[];

  otherFields: Record<string, string>;
}

/* =======================
   Key Normalization Maps
   ======================= */

const EMPLOYEE_KEY_MAP: Record<string, keyof HRParsedResult['employeeDetails']> =
  {
    'employee name': 'name',
    'full name': 'name',
    name: 'name',

    'employee id': 'employeeId',
    'emp id': 'employeeId',

    email: 'email',
    'email id': 'email',

    phone: 'phone',
    mobile: 'phone',

    designation: 'designation',
    role: 'designation',

    department: 'department',
  };

const EMPLOYMENT_KEY_MAP: Record<
  string,
  keyof HRParsedResult['employmentDetails']
> = {
  'date of joining': 'joiningDate',
  doj: 'joiningDate',
  'joining date': 'joiningDate',

  salary: 'salary',
  'annual salary': 'salary',

  'employment type': 'employmentType',
  'job type': 'employmentType',

  location: 'location',
};

/* =======================
   Helper Functions
   ======================= */

function normalizeKey(key: string): string {
  return key.toLowerCase().trim();
}

function collectTextFromRelationships(
  block: Block,
  blockMap: Map<string, Block>,
): string {
  if (!block.Relationships) return '';

  const texts: string[] = [];

  for (const rel of block.Relationships) {
    if (rel.Type === 'CHILD') {
      for (const id of rel.Ids) {
        const child = blockMap.get(id);
        if (child?.Text) {
          texts.push(child.Text);
        }
      }
    }
  }

  return texts.join(' ');
}

/* =======================
   MAIN HR PARSER
   ======================= */

export function parseHRDocument(blocks: Block[]): HRParsedResult {
  const result: HRParsedResult = {
    employeeDetails: {},
    employmentDetails: {},
    tables: [],
    otherFields: {},
  };

  if (!blocks || blocks.length === 0) return result;

  // Build block lookup map
  const blockMap = new Map<string, Block>();
  blocks.forEach((b) => blockMap.set(b.Id, b));

  /* =======================
     PART 1: KEY-VALUE PARSING
     ======================= */

  const keyBlocks = blocks.filter(
    (b) =>
      b.BlockType === 'KEY_VALUE_SET' &&
      b.Relationships?.some((r) => r.Type === 'CHILD'),
  );

  const valueBlocks = blocks.filter(
    (b) =>
      b.BlockType === 'KEY_VALUE_SET' &&
      b.Relationships?.some((r) => r.Type === 'VALUE'),
  );

  for (const keyBlock of keyBlocks) {
    const keyText = normalizeKey(
      collectTextFromRelationships(keyBlock, blockMap),
    );

    if (!keyText) continue;

    // Find VALUE block linked to this KEY
    const valueRel = keyBlock.Relationships?.find(
      (r) => r.Type === 'VALUE',
    );
    if (!valueRel) continue;

    const valueBlock = valueBlocks.find((vb) =>
      vb.Id === valueRel.Ids[0],
    );
    if (!valueBlock) continue;

    const valueText = collectTextFromRelationships(
      valueBlock,
      blockMap,
    );

    if (!valueText) continue;

    // Map to known fields
    if (EMPLOYEE_KEY_MAP[keyText]) {
      result.employeeDetails[EMPLOYEE_KEY_MAP[keyText]] = valueText;
    } else if (EMPLOYMENT_KEY_MAP[keyText]) {
      result.employmentDetails[EMPLOYMENT_KEY_MAP[keyText]] = valueText;
    } else {
      // Unknown fields preserved
      result.otherFields[keyText] = valueText;
    }
  }

  /* =======================
     PART 2: TABLE PARSING
     ======================= */

  const tableBlocks = blocks.filter((b) => b.BlockType === 'TABLE');
  const cellBlocks = blocks.filter((b) => b.BlockType === 'CELL');

  for (const table of tableBlocks) {
    const tableCells = cellBlocks.filter((cell) =>
      table.Relationships?.some(
        (r) => r.Type === 'CHILD' && r.Ids.includes(cell.Id),
      ),
    );

    const rows: Record<number, Record<number, string>> = {};

    for (const cell of tableCells) {
      if (!cell.RowIndex || !cell.ColumnIndex) continue;

      const cellText = collectTextFromRelationships(cell, blockMap);

      if (!rows[cell.RowIndex]) {
        rows[cell.RowIndex] = {};
      }

      rows[cell.RowIndex][cell.ColumnIndex] = cellText;
    }

    const rowIndexes = Object.keys(rows)
      .map(Number)
      .sort((a, b) => a - b);

    if (rowIndexes.length === 0) continue;

    const headers =
      Object.values(rows[rowIndexes[0]]) || [];

    const dataRows: string[][] = [];

    for (let i = 1; i < rowIndexes.length; i++) {
      const row = rows[rowIndexes[i]];
      dataRows.push(Object.values(row));
    }

    result.tables.push({
      headers,
      rows: dataRows,
    });
  }

  return result;
}
