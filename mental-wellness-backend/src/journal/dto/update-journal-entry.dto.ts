import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';
import { CreateJournalEntryDto } from './create-journal-entry.dto';

export class UpdateJournalEntryDto extends PartialType(CreateJournalEntryDto) {
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @IsString()
  @IsOptional()
  therapistNotes?: string;

  @IsArray()
  @IsOptional()
  sharedWith?: string[];
}
