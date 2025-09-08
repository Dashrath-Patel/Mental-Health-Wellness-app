import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type JournalEntryDocument = JournalEntry & Document;

@Schema({ timestamps: true })
export class JournalEntry {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ 
    type: {
      rating: { type: Number, required: true, min: 1, max: 10 },
      label: { type: String, required: true }
    },
    required: true
  })
  mood: {
    rating: number;
    label: string;
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: [{
      type: { type: String, enum: ['image', 'audio', 'document'] },
      url: String,
      filename: String,
      size: Number,
      uploadedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  attachments: Array<{
    type: 'image' | 'audio' | 'document';
    url: string;
    filename: string;
    size: number;
    uploadedAt: Date;
  }>;

  @Prop({ 
    type: String, 
    enum: ['private', 'therapist', 'public'], 
    default: 'private' 
  })
  privacy: string;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: false })
  isFavorite: boolean;

  @Prop()
  therapistNotes?: string;

  @Prop()
  sharedWith?: Types.ObjectId[];

  @Prop()
  location?: string;

  @Prop()
  weather?: string;

  @Prop()
  activities?: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry);

// Indexes for better performance
JournalEntrySchema.index({ user: 1, createdAt: -1 });
JournalEntrySchema.index({ user: 1, 'mood.rating': 1 });
JournalEntrySchema.index({ user: 1, tags: 1 });
JournalEntrySchema.index({ user: 1, isArchived: 1 });
