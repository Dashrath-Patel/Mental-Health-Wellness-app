import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { JournalEntry, JournalEntrySchema } from './schemas/journal-entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JournalEntry.name, schema: JournalEntrySchema }
    ]),
  ],
  providers: [JournalService],
  controllers: [JournalController],
  exports: [JournalService],
})
export class JournalModule {}
