/**
 * Execution Concurrency Limiter
 * 
 * Limits the number of concurrent Docker execution processes to prevent server overload.
 * Shared between /execute and /submit endpoints.
 */

// Maximum number of concurrent executions allowed
const MAX_CONCURRENT_EXECUTIONS = 3;

// Current count of active executions
let activeExecutions = 0;

export const executionLimiter = {
    /**
     * Tries to acquire a slot for execution.
     * Returns true if successful, false if limit reached.
     */
    tryAcquire: (): boolean => {
        if (activeExecutions < MAX_CONCURRENT_EXECUTIONS) {
            activeExecutions++;
            console.log(`[Limiter] Acquired slot. Active executions: ${activeExecutions}/${MAX_CONCURRENT_EXECUTIONS}`);
            return true;
        }
        console.warn(`[Limiter] Limit reached. Active executions: ${activeExecutions}/${MAX_CONCURRENT_EXECUTIONS}`);
        return false;
    },

    /**
     * Releases a slot after execution is complete.
     */
    release: (): void => {
        if (activeExecutions > 0) {
            activeExecutions--;
            console.log(`[Limiter] Released slot. Active executions: ${activeExecutions}/${MAX_CONCURRENT_EXECUTIONS}`);
        } else {
            console.warn('[Limiter] Attempted to release slot but count is already 0');
        }
    },

    /**
     * Get current stats (for debugging/admin)
     */
    getStats: () => {
        return {
            active: activeExecutions,
            limit: MAX_CONCURRENT_EXECUTIONS
        };
    }
};
