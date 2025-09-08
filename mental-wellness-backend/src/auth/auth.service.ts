import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    profilePicture?: string;
    isEmailVerified: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<AuthResult> {
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      username: user.username 
    };
    
    // Update last login
    await this.usersService.updateLastLogin(user._id.toString());

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResult> {
    try {
      const user = await this.usersService.create({
        email: registerDto.email,
        username: registerDto.username,
        password: registerDto.password,
        authMethod: 'local',
      });

      return this.login(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Registration failed');
    }
  }

  async googleLogin(googleUser: any): Promise<AuthResult> {
    let user = await this.usersService.findByGoogleId(googleUser.id);
    
    if (!user) {
      // Check if user exists with this email
      const existingUser = await this.usersService.findByEmail(googleUser.email);
      if (existingUser) {
        // Link Google account to existing user
        user = await this.usersService.update(existingUser._id.toString(), {
          googleId: googleUser.id,
          authMethod: 'google',
          isEmailVerified: true,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          email: googleUser.email,
          username: googleUser.email.split('@')[0], // Generate username from email
          googleId: googleUser.id,
          authMethod: 'google',
          profilePicture: googleUser.picture,
        });
      }
    }

    return this.login(user);
  }

  async refreshToken(user: User): Promise<{ access_token: string }> {
    const payload = { 
      email: user.email, 
      sub: user._id.toString(),
      username: user.username 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Return success even if user not found for security
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    const resetToken = this.jwtService.sign(
      { email, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.setPasswordResetToken(email, resetToken, expires);

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordResetEmail(email, resetToken);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      if (decoded.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.usersService.findByPasswordResetToken(token);
      if (!user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      await this.usersService.update(user._id.toString(), { password: newPassword });
      await this.usersService.clearPasswordResetToken(user._id.toString());

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
