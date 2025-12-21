import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  inputFileKey: string;

  @IsIn(['EXPENSE', 'HR'])
  documentType: 'EXPENSE' | 'HR';
}
