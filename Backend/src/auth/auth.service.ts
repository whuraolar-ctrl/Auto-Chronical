import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';


import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly config: ConfigService,
  ) {}


 

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'Login successful.',
      user: data.user,
      session: data.session,
    };
  }

  async getCurrentUser(accessToken: string) {
    if (!accessToken) {
      throw new UnauthorizedException('Authorization token is required.');
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      throw new UnauthorizedException(
        'Invalid or expired authorization token.',
      );
    }

    return {
      message: 'User retrieved successfully.',
      user,
    };
  }

  async forgotPassword(email: string) {
    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    const redirectTo = process.env.PASSWORD_RESET_REDIRECT_URL;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      ...(redirectTo ? { redirectTo } : {}),
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(password: string, accessToken: string) {
    if (!password) {
      throw new BadRequestException('New password is required.');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters.');
    }

    if (!accessToken) {
      throw new UnauthorizedException('Authorization token is required.');
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      throw new UnauthorizedException(
        'Invalid or expired authorization token.',
      );
    }

    // supabase-js's `updateUser` needs a full stored session (access *and*
    // refresh token), but the reset flow only hands us the recovery access
    // token. Call the GoTrue `/user` endpoint directly with that token instead
    // — it's the same request `updateUser` makes under the hood, and it accepts
    // a recovery access token on its own.
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_PUBLISHABLE_KEY!,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      let message = 'Unable to update password.';
      try {
        const body = await res.json();
        if (body?.msg) message = body.msg;
        else if (body?.message) message = body.message;
      } catch {
        // Non-JSON error body — fall back to the generic message.
      }
      throw new BadRequestException(message);
    }

    const data = await res.json();

    return {
      message: 'Password updated successfully.',
      user: data.user,
    };
  }

  async googleLogin() {
    const redirectTo = process.env.GOOGLE_AUTH_REDIRECT_URL;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : {},
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Google authentication started',
      url: data.url,
    };
  }
}
