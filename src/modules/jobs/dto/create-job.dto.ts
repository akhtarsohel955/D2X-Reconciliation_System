import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  inputFileKey: string;

  @IsString()
  @IsNotEmpty()
  inputFileType: string;

  @IsIn(['EXPENSE', 'HR'])
  documentType: 'EXPENSE' | 'HR';
}
