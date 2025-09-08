import { IsOptional, IsString, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';

export class QueryJournalEntriesDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  moodRatingMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  moodRatingMax?: number;

  @IsOptional()
  @IsEnum(['private', 'therapist', 'public'])
  privacy?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'mood.rating', 'title'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
