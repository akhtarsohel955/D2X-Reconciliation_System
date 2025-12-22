import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;                // FIX

  @Column()
  status!: string;            // FIX

  @Column({ nullable: true })
  outputFileKey?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;           // FIX

  @UpdateDateColumn()
  updatedAt!: Date;           // FIX
}
