import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface AppConfig {
    apiUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {

    private config: AppConfig = null;
    private loaded = false;

    constructor(private http: HttpClient) { }

    loadConfig(): Promise<void> {
        return this.http
            .get<AppConfig>('/assets/config/app-config.json')
            .toPromise()
            .then((config) => {
                this.config = config;
                this.loaded = true;
                console.log('[AppConfig] Runtime config loaded:', config.apiUrl);
            })
            .catch((error) => {
                console.warn('[AppConfig] Could not load runtime config, falling back to environment.ts', error);
                this.config = { apiUrl: environment.apiUrl };
                this.loaded = true;
            });
    }

    get apiUrl(): string {
        if (!this.loaded) {
            console.warn('[AppConfig] Config not yet loaded, using environment fallback');
            return environment.apiUrl;
        }
        return this.config?.apiUrl || environment.apiUrl;
    }

    getHostname(): string {
        try {
            const url = new URL(this.apiUrl);
            return url.host;
        } catch {
            return this.apiUrl;
        }
    }
}
