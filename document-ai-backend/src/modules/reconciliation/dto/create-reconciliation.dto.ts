import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReconciliationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  sourceFileKeys: string[];

  @IsArray()
  @IsString({ each: true })
  targetFileKeys: string[];

  @IsEnum(['INVOICE_PO', 'BANK_LEDGER', 'TIMESHEET_PAYROLL', 'GENERAL'])
  reconciliationType:
    | 'INVOICE_PO'
    | 'BANK_LEDGER'
    | 'TIMESHEET_PAYROLL'
    | 'GENERAL';
}
