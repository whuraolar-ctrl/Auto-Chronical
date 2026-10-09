import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly url: string;
    private readonly publishablekey: string;

    readonly admin: SupabaseClient;

    constructor(config: ConfigService) {
        this.url = config.getOrThrow<string>('SUPABASE_URL');
        this.publishablekey = config.getOrThrow<string>('SUPABASE_PUBLISHABLE_KEY');
        this.admin = createClient(this.url, config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'), {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }

    createAuthClient(): SupabaseClient {
        return createClient(this.url, this.publishablekey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
}