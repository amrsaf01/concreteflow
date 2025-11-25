import { Order, Vehicle } from '../../types';

export interface DispatchAnalysis {
    estimatedDurationMinutes: number;
    estimatedEndTime: Date;
    alertLevel: 'none' | 'warning' | 'critical';
    alertMessage?: string;
}

// Constants for estimation
const TRAVEL_TIME_MINUTES = 20; // Average travel time to site
const POURING_TIME_PER_M3_MINUTES = 5; // Time to pour 1 cubic meter
const RETURN_TIME_MINUTES = 20; // Average return time
const WARNING_THRESHOLD_MINUTES = 15; // Delay threshold for warning
const CRITICAL_THRESHOLD_MINUTES = 30; // Delay threshold for critical alert

export function analyzeOrder(order: Order): DispatchAnalysis {
    const now = new Date();
    const startTime = order.startTime ? new Date(order.startTime) : now;

    // Calculate estimated duration
    // Duration = Travel + (Quantity * Pouring Rate) + Return
    const pouringDuration = order.quantity * POURING_TIME_PER_M3_MINUTES;
    const totalDurationMinutes = TRAVEL_TIME_MINUTES + pouringDuration + RETURN_TIME_MINUTES;

    const estimatedEndTime = new Date(startTime.getTime() + totalDurationMinutes * 60000);

    let alertLevel: 'none' | 'warning' | 'critical' = 'none';
    let alertMessage = undefined;

    // Check for delays if order is active
    if (['en_route', 'at_site', 'pouring'].includes(order.status)) {
        const timeElapsedMinutes = (now.getTime() - startTime.getTime()) / 60000;
        const expectedProgress = timeElapsedMinutes / totalDurationMinutes;

        // Simple delay check: If we are past estimated end time
        if (now > estimatedEndTime) {
            const delayMinutes = (now.getTime() - estimatedEndTime.getTime()) / 60000;

            if (delayMinutes > CRITICAL_THRESHOLD_MINUTES) {
                alertLevel = 'critical';
                alertMessage = `איחור קריטי של ${Math.round(delayMinutes)} דקות`;
            } else if (delayMinutes > WARNING_THRESHOLD_MINUTES) {
                alertLevel = 'warning';
                alertMessage = `עיכוב של ${Math.round(delayMinutes)} דקות`;
            }
        }
    }

    return {
        estimatedDurationMinutes: totalDurationMinutes,
        estimatedEndTime,
        alertLevel,
        alertMessage
    };
}

export function getOrderProgress(order: Order): number {
    if (order.status === 'completed') return 100;
    if (order.status === 'pending' || order.status === 'approved') return 0;

    const analysis = analyzeOrder(order);
    const startTime = order.startTime ? new Date(order.startTime).getTime() : Date.now();
    const totalDuration = analysis.estimatedDurationMinutes * 60000;
    const elapsed = Date.now() - startTime;

    return Math.min(Math.round((elapsed / totalDuration) * 100), 95); // Cap at 95% until actually completed
}
