import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createJournalEntryDto: CreateJournalEntryDto,
    @Request() req,
  ) {
    return this.journalService.create(req.user._id.toString(), createJournalEntryDto);
  }

  @Get()
  findAll(@Query() query: QueryJournalEntriesDto, @Request() req) {
    return this.journalService.findAll(req.user._id.toString(), query);
  }

  @Get('analytics/mood')
  getMoodAnalytics(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.journalService.getMoodAnalytics(req.user._id.toString(), start, end);
  }

  @Get('analytics/tags')
  getPopularTags(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const tagLimit = limit ? parseInt(limit, 10) : 10;
    return this.journalService.getPopularTags(req.user._id.toString(), tagLimit);
  }

  @Get('shared')
  getSharedEntries(@Request() req) {
    return this.journalService.getSharedEntries(req.user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.journalService.findOne(id, req.user._id.toString());
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJournalEntryDto: UpdateJournalEntryDto,
    @Request() req,
  ) {
    return this.journalService.update(id, req.user._id.toString(), updateJournalEntryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    return this.journalService.remove(id, req.user._id.toString());
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Request() req) {
    return this.journalService.archive(id, req.user._id.toString());
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string, @Request() req) {
    return this.journalService.unarchive(id, req.user._id.toString());
  }

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string, @Request() req) {
    return this.journalService.toggleFavorite(id, req.user._id.toString());
  }

  @Post(':id/share')
  shareEntry(
    @Param('id') id: string,
    @Body('userIds') userIds: string[],
    @Request() req,
  ) {
    return this.journalService.shareEntry(id, req.user._id.toString(), userIds);
  }
}
