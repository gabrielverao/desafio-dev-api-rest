export class LoggerService {
    constructor(private readonly context: string) { }

    info(message: string, data?: unknown) {
        console.log(`[INFO] [${this.context}] ${message}`, data ?? '');
    }

    warn(message: string, data?: unknown) {
        console.warn(`[WARN] [${this.context}] ${message}`, data ?? '');
    }

    error(message: string, error?: unknown) {
        console.error(`[ERROR] [${this.context}] ${message}`, error ?? '');
    }
}
