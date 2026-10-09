import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { User } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SupabaseAuthGuard } from './supabase-auth.guard';

const MINUTE = 60_000;

function bearerToken(authorization?: string): string {
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';
  if (!token) {
    throw new UnauthorizedException('Authorization token is required');
  }
  return token;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: MINUTE } })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: MINUTE } })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: MINUTE } })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(SupabaseAuthGuard)
  logout(@Headers('authorization') authorization?: string) {
    return this.auth.logout(bearerToken(authorization));
  }

  @Post('resend-verification')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: MINUTE } })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.auth.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: MINUTE } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  /** Send the recovery access token as `Authorization: Bearer <token>`. */
  @Post('reset-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: MINUTE } })
  resetPassword(
    @Body() dto: ResetPasswordDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.auth.resetPassword(dto, bearerToken(authorization));
  }

  @Get('google')
  googleLogin() {
    return this.auth.googleLogin();
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  me(@CurrentUser() user: User) {
    return this.auth.getMe(user);
  }

  @Post('complete-profile')
  @HttpCode(200)
  @UseGuards(SupabaseAuthGuard)
  completeProfile(@CurrentUser() user: User, @Body() dto: CompleteProfileDto) {
    return this.auth.completeProfile(user, dto);
  }
}
