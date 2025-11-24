import React from 'react';
import { Order, Vehicle } from '../types';
import { ArrowRight, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface DispatchCalendarProps {
    orders: Order[];
    vehicles: Vehicle[];
    onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
    onBack: () => void;
}

export function DispatchCalendar({ orders, vehicles, onUpdateOrder, onBack }: DispatchCalendarProps) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 6); // 06:00 to 18:00

    // Filter only active mixers
    const activeMixers = vehicles.filter(v => v.type === 'mixer' && v.status !== 'off_duty');

    const getOrderStyle = (order: Order) => {
        const timePart = (order.deliveryTime || '').split('T')[1] || '00:00';
        const startHour = parseInt(timePart.split(':')[0]);
        const startMinute = parseInt(timePart.split(':')[1]);

        // Calculate position relative to 06:00
        const startOffset = (startHour - 6) + (startMinute / 60);
        const duration = 1; // Assume 1 hour per order for visualization

        return {
            left: `${(startOffset / 12) * 100}%`,
            width: `${(duration / 12) * 100}%`,
        };
    };

    const handleDragStart = (e: React.DragEvent, orderId: string) => {
        e.dataTransfer.setData('orderId', orderId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, vehicleId: string, hour: number) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('orderId');

        // Construct new time string (keep date, update time)
        // Assuming today for simplicity as per current mock data structure
        const today = new Date().toISOString().split('T')[0];
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const newDeliveryTime = `${today}T${timeString}`;

        onUpdateOrder(orderId, {
            assignedVehicleId: vehicleId,
            deliveryTime: newDeliveryTime
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowRight size={20} className="text-slate-500" />
                    </button>
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" />
                        לוח שיבוצים יומי
                    </h2>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
                        <span>רגיל</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></span>
                        <span>משאבה</span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto relative">
                <div className="min-w-[1000px] h-full flex flex-col">
                    {/* Time Header */}
                    <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                        <div className="w-48 p-4 border-l border-slate-200 font-bold text-slate-700 shrink-0">
                            רכב / נהג
                        </div>
                        <div className="flex-1 flex relative">
                            {hours.map(hour => (
                                <div key={hour} className="flex-1 p-2 text-center border-l border-slate-200 text-sm text-slate-500">
                                    {hour}:00
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vehicle Rows */}
                    <div className="flex-1">
                        {activeMixers.map(vehicle => (
                            <div key={vehicle.id} className="flex border-b border-slate-100 h-24 group hover:bg-slate-50/50 transition-colors">
                                {/* Vehicle Info Column */}
                                <div className="w-48 p-4 border-l border-slate-200 shrink-0 flex flex-col justify-center bg-white sticky right-0 z-10 group-hover:bg-slate-50/50">
                                    <div className="font-bold text-slate-800">{vehicle.vehicleNumber}</div>
                                    <div className="text-sm text-slate-500">{vehicle.driverName}</div>
                                    <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full w-fit ${vehicle.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                        vehicle.status === 'en_route' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {vehicle.status === 'available' ? 'פנוי' :
                                            vehicle.status === 'en_route' ? 'במשימה' : 'תפוס'}
                                    </div>
                                </div>

                                {/* Timeline Track */}
                                <div className="flex-1 relative bg-slate-50/30">
                                    {/* Grid Lines & Drop Zones */}
                                    <div className="absolute inset-0 flex">
                                        {hours.map(hour => (
                                            <div
                                                key={hour}
                                                className="flex-1 border-l border-slate-100 h-full transition-colors hover:bg-blue-50/30"
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, vehicle.id, hour)}
                                            />
                                        ))}
                                    </div>

                                    {/* Order Blocks */}
                                    {orders
                                        .filter(o => o.assignedVehicleId === vehicle.id && o.status !== 'completed' && o.status !== 'rejected')
                                        .map(order => (
                                            <div
                                                key={order.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, order.id)}
                                                className={`absolute top-2 bottom-2 rounded-lg border shadow-sm p-2 text-xs overflow-hidden cursor-move hover:shadow-md transition-all z-10 ${order.pumpRequired
                                                    ? 'bg-purple-100 border-purple-200 text-purple-900'
                                                    : 'bg-blue-100 border-blue-200 text-blue-900'
                                                    }`}
                                                style={getOrderStyle(order)}
                                                title={`${order.companyName} - ${order.address}`}
                                            >
                                                <div className="font-bold truncate">{order.companyName}</div>
                                                <div className="truncate opacity-75">{order.quantity} מ"ק</div>
                                                <div className="truncate opacity-75">{order.address}</div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
