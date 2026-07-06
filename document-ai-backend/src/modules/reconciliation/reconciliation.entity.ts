import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reconciliation')
export class Reconciliation {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  userId: string;

  @Column({ length: 255, nullable: true })
  name?: string;

  @Column({ length: 20 })
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  // Source and target files (JSON arrays of S3 keys)
  @Column({ type: 'json' })
  sourceFileKeys: string[];

  @Column({ type: 'json' })
  targetFileKeys: string[];

  // Reconciliation type
  @Column({ length: 50 })
  reconciliationType:
    | 'INVOICE_PO'
    | 'BANK_LEDGER'
    | 'TIMESHEET_PAYROLL'
    | 'GENERAL';

  // Results
  @Column({ type: 'int', default: 0 })
  matchedCount: number;

  @Column({ type: 'int', default: 0 })
  unmatchedCount: number;

  @Column({ type: 'int', default: 0 })
  discrepancyCount: number;

  // Output
  @Column({ nullable: true })
  resultFileKey?: string;

  @Column({ type: 'json', nullable: true })
  matchingResults?: any;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
