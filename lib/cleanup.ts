import { ChildProcess } from 'child_process'

// Track active Python processes
const activeProcesses = new Map<string, ChildProcess>()

/**
 * Register a Python process for tracking and cleanup
 */
export function registerProcess(id: string, process: ChildProcess): void {
    activeProcesses.set(id, process)

    // Auto-cleanup when process exits
    process.on('exit', () => {
        activeProcesses.delete(id)
    })
}

/**
 * Cleanup a specific process by ID
 */
export function cleanupProcess(id: string): void {
    const process = activeProcesses.get(id)
    if (process && !process.killed) {
        process.kill('SIGTERM')
        activeProcesses.delete(id)
    }
}

/**
 * Cleanup all active processes
 */
export function cleanupAll(): void {
    for (const [id, process] of activeProcesses.entries()) {
        if (!process.killed) {
            console.log(`Cleaning up process: ${id}`)
            process.kill('SIGTERM')
        }
    }
    activeProcesses.clear()
}

/**
 * Get count of active processes
 */
export function getActiveProcessCount(): number {
    return activeProcesses.size
}

// Setup cleanup handlers
if (typeof process !== 'undefined') {
    process.on('SIGINT', () => {
        console.log('\nReceived SIGINT, cleaning up processes...')
        cleanupAll()
        process.exit(0)
    })

    process.on('SIGTERM', () => {
        console.log('\nReceived SIGTERM, cleaning up processes...')
        cleanupAll()
        process.exit(0)
    })

    process.on('exit', () => {
        cleanupAll()
    })
}
