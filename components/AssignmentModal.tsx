import React, { useState } from 'react';
import { Vehicle, Order } from '../types';
import { Truck, X, Check } from 'lucide-react';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (vehicleId: string) => void;
    vehicles: Vehicle[];
    order: Order | null;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onConfirm, vehicles, order }) => {
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    if (!isOpen || !order) return null;

    const handleConfirm = () => {
        if (selectedVehicleId) {
            onConfirm(selectedVehicleId);
            onClose();
            setSelectedVehicleId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border-green-200';
            case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available': return 'פנוי';
            case 'maintenance': return 'בטיפול';
            case 'en_route': return 'בדרך';
            case 'at_site': return 'באתר';
            case 'pouring': return 'יוצק';
            case 'returning': return 'חוזר';
            default: return status;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">שיבוץ רכב למשימה</h2>
                        <p className="text-gray-500 mt-1">הזמנה #{order.orderNumber} - {order.companyName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Vehicle List */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid gap-4">
                        {vehicles.map(vehicle => {
                            const isAvailable = vehicle.status === 'available';
                            const isSelected = selectedVehicleId === vehicle.id;
                            const isRecommended = isAvailable && vehicle.capacity >= order.quantity;

                            return (
                                <div
                                    key={vehicle.id}
                                    onClick={() => isAvailable && setSelectedVehicleId(vehicle.id)}
                                    className={`
                                        relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer
                                        ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-100 hover:border-blue-300 bg-white'}
                                        ${!isAvailable ? 'opacity-60 grayscale cursor-not-allowed' : ''}
                                        ${isRecommended ? 'border-emerald-400 shadow-sm' : ''}
                                    `}
                                >
                                    {isRecommended && (
                                        <div className="absolute -top-3 -right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                            <Check size={12} /> מומלץ
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {(vehicle.vehicleNumber || '').split('-')[1] || vehicle.vehicleNumber}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{vehicle.driverName}</p>
                                            <p className="text-xs text-gray-500">
                                                {vehicle.type === 'mixer' ? `קיבולת: ${vehicle.capacity} קוב` : 'משאבת בטון'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(vehicle.status)}`}>
                                            {getStatusText(vehicle.status)}
                                        </span>
                                        {isSelected && <Check className="text-blue-600" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        ביטול
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedVehicleId}
                        className={`
                            px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all
                            ${selectedVehicleId ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-900/20' : 'bg-gray-300 cursor-not-allowed'}
                        `}
                    >
                        <Check size={18} /> אשר שיבוץ
                    </button>
                </div>

            </div>
        </div>
    );
};
