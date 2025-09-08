import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JournalEntry, JournalEntryDocument } from './schemas/journal-entry.schema';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { QueryJournalEntriesDto } from './dto/query-journal-entries.dto';

export interface JournalEntriesResponse {
  entries: JournalEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MoodAnalytics {
  averageMood: number;
  moodDistribution: { [key: string]: number };
  moodTrend: Array<{ date: string; mood: number }>;
  totalEntries: number;
}

@Injectable()
export class JournalService {
  constructor(
    @InjectModel(JournalEntry.name)
    private journalEntryModel: Model<JournalEntryDocument>,
  ) {}

  async create(
    userId: string,
    createJournalEntryDto: CreateJournalEntryDto,
  ): Promise<JournalEntry> {
    const journalEntry = new this.journalEntryModel({
      ...createJournalEntryDto,
      user: new Types.ObjectId(userId),
    });
    
    return journalEntry.save();
  }

  async findAll(
    userId: string,
    query: QueryJournalEntriesDto,
  ): Promise<JournalEntriesResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      moodRatingMin,
      moodRatingMax,
      privacy,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {
      user: new Types.ObjectId(userId),
      isArchived: false,
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Add mood rating filter
    if (moodRatingMin || moodRatingMax) {
      filter['mood.rating'] = {};
      if (moodRatingMin) {
        filter['mood.rating'].$gte = moodRatingMin;
      }
      if (moodRatingMax) {
        filter['mood.rating'].$lte = moodRatingMax;
      }
    }

    // Add privacy filter
    if (privacy) {
      filter.privacy = privacy;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [entries, total] = await Promise.all([
      this.journalEntryModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'username email profilePicture')
        .exec(),
      this.journalEntryModel.countDocuments(filter),
    ]);

    return {
      entries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<JournalEntry> {
    const entry = await this.journalEntryModel
      .findOne({ _id: id, user: userId })
      .populate('user', 'username email profilePicture')
      .exec();

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return entry;
  }

  async update(
    id: string,
    userId: string,
    updateJournalEntryDto: UpdateJournalEntryDto,
  ): Promise<JournalEntry> {
    const entry = await this.journalEntryModel
      .findOneAndUpdate(
        { _id: id, user: userId },
        updateJournalEntryDto,
        { new: true, runValidators: true }
      )
      .populate('user', 'username email profilePicture')
      .exec();

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return entry;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.journalEntryModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();

    if (!result) {
      throw new NotFoundException('Journal entry not found');
    }
  }

  async archive(id: string, userId: string): Promise<JournalEntry> {
    return this.update(id, userId, { isArchived: true });
  }

  async unarchive(id: string, userId: string): Promise<JournalEntry> {
    return this.update(id, userId, { isArchived: false });
  }

  async toggleFavorite(id: string, userId: string): Promise<JournalEntry> {
    const entry = await this.findOne(id, userId);
    return this.update(id, userId, { isFavorite: !entry.isFavorite });
  }

  async getMoodAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<MoodAnalytics> {
    const filter: any = {
      user: new Types.ObjectId(userId),
      isArchived: false,
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = startDate;
      }
      if (endDate) {
        filter.createdAt.$lte = endDate;
      }
    }

    const entries = await this.journalEntryModel
      .find(filter, 'mood createdAt')
      .sort({ createdAt: 1 })
      .exec();

    const totalEntries = entries.length;
    
    if (totalEntries === 0) {
      return {
        averageMood: 0,
        moodDistribution: {},
        moodTrend: [],
        totalEntries: 0,
      };
    }

    // Calculate average mood
    const averageMood = entries.reduce((sum, entry) => sum + entry.mood.rating, 0) / totalEntries;

    // Calculate mood distribution
    const moodDistribution: { [key: string]: number } = {};
    entries.forEach((entry) => {
      const label = entry.mood.label;
      moodDistribution[label] = (moodDistribution[label] || 0) + 1;
    });

    // Calculate mood trend (daily averages)
    const moodTrend: Array<{ date: string; mood: number }> = [];
    const dailyMoods: { [date: string]: number[] } = {};

    entries.forEach((entry) => {
      const date = entry.createdAt.toISOString().split('T')[0];
      if (!dailyMoods[date]) {
        dailyMoods[date] = [];
      }
      dailyMoods[date].push(entry.mood.rating);
    });

    Object.entries(dailyMoods).forEach(([date, moods]) => {
      const dailyAverage = moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
      moodTrend.push({ date, mood: Math.round(dailyAverage * 100) / 100 });
    });

    return {
      averageMood: Math.round(averageMood * 100) / 100,
      moodDistribution,
      moodTrend,
      totalEntries,
    };
  }

  async getPopularTags(userId: string, limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
    const result = await this.journalEntryModel.aggregate([
      { $match: { user: new Types.ObjectId(userId), isArchived: false } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { tag: '$_id', count: 1, _id: 0 } },
    ]);

    return result;
  }

  async shareEntry(
    entryId: string,
    userId: string,
    shareWithUserIds: string[],
  ): Promise<JournalEntry> {
    const entry = await this.findOne(entryId, userId);
    
    if (entry.privacy === 'private') {
      throw new ForbiddenException('Cannot share private entries');
    }

    const shareWithObjectIds = shareWithUserIds.map(id => new Types.ObjectId(id));
    
    return this.update(entryId, userId, {
      sharedWith: shareWithObjectIds as any,
    });
  }

  async getSharedEntries(userId: string): Promise<JournalEntry[]> {
    return this.journalEntryModel
      .find({
        sharedWith: new Types.ObjectId(userId),
        isArchived: false,
      })
      .populate('user', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }
}
