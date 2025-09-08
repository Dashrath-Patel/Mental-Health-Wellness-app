import { 
  IsString, 
  IsNotEmpty, 
  IsObject, 
  ValidateNested, 
  IsNumber, 
  Min, 
  Max, 
  IsOptional, 
  IsArray, 
  IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';

export class MoodDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @IsString()
  @IsNotEmpty()
  label: string;
}

export class CreateJournalEntryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @ValidateNested()
  @Type(() => MoodDto)
  mood: MoodDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsEnum(['private', 'therapist', 'public'])
  @IsOptional()
  privacy?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  weather?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activities?: string[];
}
