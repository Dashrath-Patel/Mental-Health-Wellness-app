import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop()
  password?: string; // Optional for OAuth users

  @Prop({ default: '' })
  profilePicture: string;

  @Prop({ default: 'local', enum: ['local', 'google', 'passkey'] })
  authMethod: string;

  @Prop()
  googleId?: string;

  @Prop()
  passkeyCredentials?: string; // Store passkey credential data

  @Prop({ 
    type: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true }
      },
      privacy: {
        profileVisibility: { type: String, default: 'private' },
        journalSharing: { type: Boolean, default: false },
        allowDataCollection: { type: Boolean, default: false }
      }
    },
    default: () => ({})
  })
  preferences: {
    theme: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      reminders: boolean;
    };
    privacy: {
      profileVisibility: string;
      journalSharing: boolean;
      allowDataCollection: boolean;
    };
  };

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  emailVerificationToken?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ googleId: 1 });
