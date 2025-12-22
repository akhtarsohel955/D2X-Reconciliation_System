import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  userId: string;

  @Column('text')
  inputFileKey: string;

  @Column({ length: 20 })
  inputFileType: string;

  @Column({ length: 20 })
  documentType: 'EXPENSE' | 'HR';

  @Column({ length: 20 })
  status: string;

  @Column({ nullable: true })
  outputFileKey?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
