import { Order } from '../../types';

export interface VehicleRequirement {
    mixers: number;
    pump: number;
    total: number;
    breakdown: string;
}

export function calculateRequiredVehicles(order: Order): VehicleRequirement {
    // 8 cubic meters max per mixer
    const MAX_CAPACITY = 8;

    const mixersNeeded = Math.ceil(order.quantity / MAX_CAPACITY);
    const pumpNeeded = order.pumpRequired ? 1 : 0;

    const breakdownParts = [];
    if (mixersNeeded > 0) {
        breakdownParts.push(`${mixersNeeded} מיקסר${mixersNeeded > 1 ? 'ים' : ''}`);
    }
    if (pumpNeeded > 0) {
        breakdownParts.push('משאבה');
    }

    return {
        mixers: mixersNeeded,
        pump: pumpNeeded,
        total: mixersNeeded + pumpNeeded,
        breakdown: breakdownParts.join(' + ')
    };
}
