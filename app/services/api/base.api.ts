export interface ApiEnvelope<T = any> {
    data?: T;
    error?: string | Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    rateLimit?: { remaining?: number; resetAt?: string } | null;
}

export class ApiError extends Error {
    public status: number;
    public body: any;

    constructor(message: string, status = 500, body?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

export type PreRequestHook = (opts: {
    method: string;
    url: string;
    headers: HeadersInit;
    body?: any
}) => Promise<void> | void;

export abstract class BaseApiClient {
    protected baseUrl: string;
    protected authToken?: string;
    protected preRequestHook?: PreRequestHook;

    protected constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
    }

    setAuthToken(token: string | undefined) {
        this.authToken = token;
    }

    setPreRequestHook(hook: PreRequestHook | undefined) {
        this.preRequestHook = hook;
    }

    protected async request<T = any>(method: string, path: string, body?: unknown, extraHeaders?: HeadersInit): Promise<T> {
        const url = `${this.baseUrl}${path}`;

        // Use a plain record for headers to avoid indexing issues with the
        // HeadersInit union type and to make it easy to mutate programmatically.
        const headersObj: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(extraHeaders && typeof extraHeaders === 'object' && !(extraHeaders instanceof Headers) ? (extraHeaders as Record<string, string>) : {}),
        };

        if (this.authToken) {
            headersObj['Authorization'] = `Bearer ${this.authToken}`;
        }

        if (this.preRequestHook) {
            try {
                await this.preRequestHook({method, url, headers: headersObj, body});
            } catch {
                // swallow hook errors to avoid breaking requests
                // but you may want to log in real implementation
            }
        }

        const opts: RequestInit = {
            method,
            headers: headersObj,
        };

        if (body !== undefined) {
            try {
                opts.body = JSON.stringify(body);
            } catch {
                // If body is not serializable, leave it as-is
                (opts as any).body = body as any;
            }
        }

        const res = await fetch(url, opts);

        // read response text first
        const text = await res.text();
        let parsed: any;
        try {
            parsed = text ? JSON.parse(text) : undefined;
        } catch {
            // non-json response
            parsed = text;
        }

        // If HTTP error, throw structured ApiError with parsed body if available
        if (!res.ok) {
            const message = (parsed && (parsed.error || parsed.message)) || res.statusText || 'API Error';
            throw new ApiError(String(message), res.status, parsed);
        }

        // Normalize envelope: prefer { data } shape, else fall back to direct response
        if (parsed && typeof parsed === 'object' && ('data' in parsed || 'error' in parsed || 'meta' in parsed)) {
            const env: ApiEnvelope<T> = parsed as ApiEnvelope<T>;
            if (env.error) {
                const message = typeof env.error === 'string' ? env.error : JSON.stringify(env.error);
                throw new ApiError(message, res.status, env);
            }
            return env.data as T;
        }

        // If parsed is an object but not an envelope, return it directly
        return parsed as T;
    }
}
