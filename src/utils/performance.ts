/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
    private static metrics: Map<string, number[]> = new Map();
    private static memorySnapshots: Array<{ timestamp: number; usage: NodeJS.MemoryUsage }> = [];

    /**
     * Measure execution time of a function
     */
    static async measureAsync<T>(
        name: string,
        fn: () => Promise<T>
    ): Promise<{ result: T; duration: number }> {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;

        this.recordMetric(name, duration);
        return { result, duration };
    }

    /**
     * Measure execution time of a synchronous function
     */
    static measure<T>(name: string, fn: () => T): { result: T; duration: number } {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;

        this.recordMetric(name, duration);
        return { result, duration };
    }

    /**
     * Record a metric value
     */
    static recordMetric(name: string, value: number): void {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(value);
    }

    /**
     * Get statistics for a metric
     */
    static getMetricStats(name: string): {
        count: number;
        avg: number;
        min: number;
        max: number;
        p95: number;
    } | null {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) {
            return null;
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((acc, val) => acc + val, 0);

        return {
            count: values.length,
            avg: sum / values.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            p95: sorted[Math.floor(sorted.length * 0.95)],
        };
    }

    /**
     * Take a memory snapshot
     */
    static takeMemorySnapshot(): void {
        this.memorySnapshots.push({
            timestamp: Date.now(),
            usage: process.memoryUsage(),
        });

        // Keep only last 100 snapshots
        if (this.memorySnapshots.length > 100) {
            this.memorySnapshots.shift();
        }
    }

    /**
     * Get memory usage report
     */
    static getMemoryReport(): {
        current: NodeJS.MemoryUsage;
        trend: string;
        snapshots: number;
    } {
        const current = process.memoryUsage();

        let trend = 'stable';
        if (this.memorySnapshots.length > 1) {
            const first = this.memorySnapshots[0].usage.heapUsed;
            const last = this.memorySnapshots[this.memorySnapshots.length - 1].usage.heapUsed;
            const change = ((last - first) / first) * 100;

            if (change > 10) trend = 'increasing';
            else if (change < -10) trend = 'decreasing';
        }

        return {
            current,
            trend,
            snapshots: this.memorySnapshots.length,
        };
    }

    /**
     * Clear all metrics
     */
    static clearMetrics(): void {
        this.metrics.clear();
        this.memorySnapshots = [];
    }

    /**
     * Get all metrics
     */
    static getAllMetrics(): Record<string, ReturnType<typeof this.getMetricStats>> {
        const result: Record<string, ReturnType<typeof this.getMetricStats>> = {};
        for (const [name] of this.metrics) {
            result[name] = this.getMetricStats(name);
        }
        return result;
    }
}

/**
 * Decorator for measuring method execution time
 */
export function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const name = `${target.constructor.name}.${propertyKey}`;
        const start = performance.now();
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;

        PerformanceMonitor.recordMetric(name, duration);
        return result;
    };
}
