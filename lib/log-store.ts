// Global log storage (in production, use Redis or a proper logging service)
// Using a class to ensure it's a singleton
class LogStore {
    private static instance: LogStore
    private logs: Array<{ timestamp: string; level: string; message: string }> = []

    private constructor() { }

    static getInstance(): LogStore {
        if (!LogStore.instance) {
            LogStore.instance = new LogStore()
        }
        return LogStore.instance
    }

    addLog(level: 'info' | 'error' | 'success', message: string) {
        const timestamp = new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })

        this.logs.push({ timestamp, level, message })

        // Keep only last 100 logs
        if (this.logs.length > 100) {
            this.logs = this.logs.slice(-100)
        }

        // Also log to console for debugging
        console.log(`[${level.toUpperCase()}] ${message}`)
    }

    getLogs() {
        return this.logs
    }

    clearLogs() {
        this.logs = []
    }
}

export const logStore = LogStore.getInstance()
