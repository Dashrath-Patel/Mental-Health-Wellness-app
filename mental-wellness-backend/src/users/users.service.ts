import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { username: createUserDto.username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password if provided
    if (createUserDto.password) {
      const saltRounds = 12;
      createUserDto.password = await bcrypt.hash(createUserDto.password, saltRounds);
    }

    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username, isActive: true }).select('-password').exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId, isActive: true }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Hash password if being updated
    if (updateUserDto.password) {
      const saltRounds = 12;
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    // Soft delete - set isActive to false
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      {
        passwordResetToken: token,
        passwordResetExpires: expires
      }
    ).exec();
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    }).exec();
  }

  async clearPasswordResetToken(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1
      }
    }).exec();
  }

  async setEmailVerificationToken(email: string, token: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { email },
      { emailVerificationToken: token }
    ).exec();
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.userModel.findOneAndUpdate(
      { emailVerificationToken: token },
      {
        isEmailVerified: true,
        $unset: { emailVerificationToken: 1 }
      },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    return user;
  }
}
