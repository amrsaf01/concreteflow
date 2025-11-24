import React from 'react';
import { Order, Vehicle } from '../types';
import { Clock, ChevronUp, ChevronDown, CheckCircle, XCircle, MapPin, Package } from 'lucide-react';

interface WaitingQueueWidgetProps {
    orders: Order[];  // Orders with status === 'waiting_for_vehicle'
    vehicles: Vehicle[];
    onMoveUp: (orderId: string) => void;
    onMoveDown: (orderId: string) => void;
    onAssignNow: (orderId: string) => void;
    onRemoveFromQueue: (orderId: string) => void;
}

export const WaitingQueueWidget: React.FC<WaitingQueueWidgetProps> = ({
    orders,
    vehicles,
    onMoveUp,
    onMoveDown,
    onAssignNow,
    onRemoveFromQueue
}) => {
    // Sort by queue position
    const sortedOrders = [...orders].sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));

    const availableVehicles = vehicles.filter(v => v.status === 'available');
    const hasAvailableVehicles = availableVehicles.length > 0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
                <h2 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                    <Clock size={18} className="text-amber-600" />
                    תור המתנה לרכב
                </h2>
                <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                        {sortedOrders.length} בתור
                    </span>
                    {hasAvailableVehicles && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                            {availableVehicles.length} רכבים פנויים
                        </span>
                    )}
                </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {sortedOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Clock className="mx-auto mb-2 opacity-20" size={48} />
                        <p>אין הזמנות בתור</p>
                        <p className="text-xs mt-1">הזמנות שממתינות לרכב זמין יופיעו כאן</p>
                    </div>
                ) : (
                    sortedOrders.map((order, index) => (
                        <div
                            key={order.id}
                            className="p-4 hover:bg-amber-50/30 transition-colors"
                        >
                            {/* Queue Position Badge */}
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {order.queuePosition}
                                </div>

                                <div className="flex-1">
                                    {/* Company & Details */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{order.companyName}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <MapPin size={12} /> {order.address}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-mono font-bold text-slate-700 text-sm">
                                                {(order.deliveryTime || '').split('T')[1]?.substring(0, 5) || '??:??'}
                                            </span>
                                            <span className="text-xs text-slate-400">זמן מבוקש</span>
                                        </div>
                                    </div>

                                    {/* Order Info */}
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            <Package size={12} /> {order.quantity} מ״ק
                                        </span>
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                                            {order.grade}
                                        </span>
                                        {order.pumpRequired && (
                                            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                                                משאבה
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        {/* Move Up */}
                                        <button
                                            onClick={() => onMoveUp(order.id)}
                                            disabled={index === 0}
                                            className={`p-2 rounded-lg border transition-all ${index === 0
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                            title="העלה בתור"
                                        >
                                            <ChevronUp size={16} />
                                        </button>

                                        {/* Move Down */}
                                        <button
                                            onClick={() => onMoveDown(order.id)}
                                            disabled={index === sortedOrders.length - 1}
                                            className={`p-2 rounded-lg border transition-all ${index === sortedOrders.length - 1
                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                                }`}
                                            title="הורד בתור"
                                        >
                                            <ChevronDown size={16} />
                                        </button>

                                        {/* Assign Now */}
                                        <button
                                            onClick={() => onAssignNow(order.id)}
                                            className="flex-1 bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg shadow hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium"
                                            title="שבץ עכשיו"
                                        >
                                            <CheckCircle size={14} />
                                            שבץ עכשיו
                                        </button>

                                        {/* Remove from Queue */}
                                        <button
                                            onClick={() => onRemoveFromQueue(order.id)}
                                            className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-slate-400"
                                            title="הוצא מהתור"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Queue Info Footer */}
            {sortedOrders.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center">
                    {hasAvailableVehicles ? (
                        <span className="text-green-600 font-medium">✓ יש רכבים פנויים - ניתן לשבץ מיד</span>
                    ) : (
                        <span className="text-amber-600 font-medium">⏳ אין רכבים פנויים - ההזמנות ימתינו בתור</span>
                    )}
                </div>
            )}
        </div>
    );
};
