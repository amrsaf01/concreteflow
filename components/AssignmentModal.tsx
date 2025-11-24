import React, { useState, useEffect } from 'react';
import { Vehicle, Order } from '../types';
import { Truck, X, Check, AlertTriangle, Info } from 'lucide-react';
import { calculateRequiredVehicles } from '../src/utils/vehicleCalculator';

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (vehicleIds: string[]) => void;
    vehicles: Vehicle[];
    order: Order | null;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onConfirm, vehicles, order }) => {
    const [selectedMixers, setSelectedMixers] = useState<string[]>([]);
    const [selectedPump, setSelectedPump] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedMixers([]);
            setSelectedPump(null);
        }
    }, [isOpen]);

    if (!isOpen || !order) return null;

    const requirements = calculateRequiredVehicles(order);
    const mixers = vehicles.filter(v => v.type === 'mixer');
    const pumps = vehicles.filter(v => v.type === 'pump');

    const handleConfirm = () => {
        const selectedIds = [...selectedMixers];
        if (selectedPump) {
            selectedIds.push(selectedPump);
        }
        onConfirm(selectedIds);
        onClose();
    };

    const toggleMixer = (vehicleId: string) => {
        if (selectedMixers.includes(vehicleId)) {
            setSelectedMixers(prev => prev.filter(id => id !== vehicleId));
        } else {
            if (selectedMixers.length < requirements.mixers) {
                setSelectedMixers(prev => [...prev, vehicleId]);
            }
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

    const isSelectionValid = selectedMixers.length === requirements.mixers &&
        (requirements.pump === 0 || !!selectedPump);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" dir="rtl">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">שיבוץ רכבים למשימה</h2>
                        <p className="text-gray-500 mt-1">הזמנה #{order.orderNumber} - {order.companyName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Requirements Summary */}
                <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Info size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900">דרישות שיבוץ (לפי חוק)</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                כמות: {order.quantity} מ"ק • משאבה: {order.pumpRequired ? 'כן' : 'לא'}
                            </p>
                            <div className="mt-2 font-bold text-lg text-blue-800">
                                ✅ נדרש: {requirements.breakdown}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Lists */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">

                    {/* Mixers Section */}
                    <div>
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
                            <span>בחר מיקסרים ({selectedMixers.length}/{requirements.mixers})</span>
                            {selectedMixers.length < requirements.mixers && (
                                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                    חסרים {requirements.mixers - selectedMixers.length} מיקסרים
                                </span>
                            )}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {mixers.map(vehicle => {
                                const isAvailable = vehicle.status === 'available';
                                const isSelected = selectedMixers.includes(vehicle.id);
                                const isDisabled = !isAvailable && !isSelected;

                                return (
                                    <div
                                        key={vehicle.id}
                                        onClick={() => !isDisabled && toggleMixer(vehicle.id)}
                                        className={`
                                            relative flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer
                                            ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-100 hover:border-blue-300 bg-white'}
                                            ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                {(vehicle.vehicleNumber || '').split('-')[1] || vehicle.vehicleNumber}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{vehicle.driverName}</p>
                                                <p className="text-xs text-gray-500">קיבולת: {vehicle.capacity}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(vehicle.status)}`}>
                                                {getStatusText(vehicle.status)}
                                            </span>
                                            {isSelected && <Check className="text-blue-600" size={16} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pumps Section */}
                    {requirements.pump > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-700 mb-3 flex items-center justify-between">
                                <span>בחר משאבה ({selectedPump ? 1 : 0}/1)</span>
                                {!selectedPump && (
                                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                        נדרשת משאבה
                                    </span>
                                )}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {pumps.map(vehicle => {
                                    const isAvailable = vehicle.status === 'available';
                                    const isSelected = selectedPump === vehicle.id;
                                    const isDisabled = !isAvailable && !isSelected;

                                    return (
                                        <div
                                            key={vehicle.id}
                                            onClick={() => !isDisabled && setSelectedPump(isSelected ? null : vehicle.id)}
                                            className={`
                                                relative flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer
                                                ${isSelected ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-100 hover:border-purple-300 bg-white'}
                                                ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                    {(vehicle.vehicleNumber || '').split('-')[1] || vehicle.vehicleNumber}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{vehicle.driverName}</p>
                                                    <p className="text-xs text-gray-500">משאבה</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(vehicle.status)}`}>
                                                    {getStatusText(vehicle.status)}
                                                </span>
                                                {isSelected && <Check className="text-purple-600" size={16} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {!isSelectionValid && (
                            <span className="flex items-center gap-1 text-orange-600">
                                <AlertTriangle size={14} />
                                אנא בחר את כל הרכבים הנדרשים
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isSelectionValid}
                            className={`
                                px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all
                                ${isSelectionValid ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-900/20' : 'bg-gray-300 cursor-not-allowed'}
                            `}
                        >
                            <Check size={18} /> אשר שיבוץ
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
