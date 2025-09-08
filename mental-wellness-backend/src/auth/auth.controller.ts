import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  Get,
  HttpCode,
  HttpStatus,
  ValidationPipe
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      id: req.user._id.toString(),
      email: req.user.email,
      username: req.user.username,
      profilePicture: req.user.profilePicture,
      isEmailVerified: req.user.isEmailVerified,
      preferences: req.user.preferences,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  // TODO: Implement Google OAuth endpoints
  @Get('google')
  async googleAuth() {
    // This will redirect to Google OAuth
    return { message: 'Google OAuth not implemented yet' };
  }

  @Get('google/callback')
  async googleCallback() {
    // Handle Google OAuth callback
    return { message: 'Google OAuth callback not implemented yet' };
  }
}
