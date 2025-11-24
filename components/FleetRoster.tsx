import React, { useState } from 'react';
import { Vehicle, VehicleStatus, VehicleType } from '../types';
import { Truck, User, AlertTriangle, CheckCircle, Plus, Trash2, Wrench, Coffee, XCircle } from 'lucide-react';

interface FleetRosterProps {
    vehicles: Vehicle[];
    onUpdateStatus: (vehicleId: string, status: VehicleStatus) => void;
    onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'status'>) => void;
    onRemoveVehicle: (vehicleId: string) => void;
    onBack: () => void;
}

export const FleetRoster: React.FC<FleetRosterProps> = ({ vehicles, onUpdateStatus, onAddVehicle, onRemoveVehicle, onBack }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newVehicle, setNewVehicle] = useState<{
        vehicleNumber: string;
        type: VehicleType;
        driverName: string;
        capacity: number;
    }>({
        vehicleNumber: '',
        type: 'mixer',
        driverName: '',
        capacity: 10
    });

    const activeVehicles = vehicles.filter(v => v.status !== 'maintenance' && v.status !== 'off_duty');
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance');
    const offDutyVehicles = vehicles.filter(v => v.status === 'off_duty');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVehicle.vehicleNumber || !newVehicle.driverName) return;

        onAddVehicle(newVehicle);
        setIsAdding(false);
        setNewVehicle({ vehicleNumber: '', type: 'mixer', driverName: '', capacity: 10 });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="text-blue-600" /> ניהול צי רכב וסידור עבודה
                    </h1>
                    <p className="text-gray-500 mt-1">ניהול זמינות יומית ומצבת כלים</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={20} /> הוסף רכב
                    </button>
                    <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        חזרה ללוח בקרה
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">סה״כ צי פעיל</p>
                        <h3 className="text-3xl font-bold text-green-600">{activeVehicles.length}</h3>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">במוסך / תקול</p>
                        <h3 className="text-3xl font-bold text-red-600">{maintenanceVehicles.length}</h3>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <Wrench size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">לא במשמרת / חופש</p>
                        <h3 className="text-3xl font-bold text-gray-600">{offDutyVehicles.length}</h3>
                    </div>
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                        <Coffee size={24} />
                    </div>
                </div>
            </div>

            {/* Add Vehicle Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">הוספת רכב חדש</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">מספר רכב</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newVehicle.vehicleNumber}
                                    onChange={e => setNewVehicle({ ...newVehicle, vehicleNumber: e.target.value })}
                                    placeholder="לדוגמה: 12-345-67"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">שם נהג</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newVehicle.driverName}
                                    onChange={e => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                                    placeholder="שם מלא"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">סוג כלי</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                                        value={newVehicle.type}
                                        onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value as VehicleType })}
                                    >
                                        <option value="mixer">מיקסר</option>
                                        <option value="pump">משאבה</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">קיבולת (קוב)</label>
                                    <input
                                        type="number"
                                        className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                                        value={newVehicle.capacity}
                                        onChange={e => setNewVehicle({ ...newVehicle, capacity: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">ביטול</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">שמור רכב</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vehicle List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">מספר רכב</th>
                            <th className="px-6 py-4">נהג</th>
                            <th className="px-6 py-4">סוג</th>
                            <th className="px-6 py-4">סטטוס נוכחי</th>
                            <th className="px-6 py-4">פעולות מהירות</th>
                            <th className="px-6 py-4">ניהול</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {vehicles.map(vehicle => (
                            <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 font-mono font-bold text-gray-700">{vehicle.vehicleNumber}</td>
                                <td className="px-6 py-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                        <User size={16} />
                                    </div>
                                    {vehicle.driverName}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${vehicle.type === 'mixer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {vehicle.type === 'mixer' ? 'מיקסר' : 'משאבה'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {vehicle.status === 'maintenance' ? (
                                        <span className="flex items-center gap-1 text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full w-fit">
                                            <Wrench size={14} /> במוסך
                                        </span>
                                    ) : vehicle.status === 'off_duty' ? (
                                        <span className="flex items-center gap-1 text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full w-fit">
                                            <Coffee size={14} /> לא במשמרת
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full w-fit">
                                            <CheckCircle size={14} /> פעיל
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onUpdateStatus(vehicle.id, 'available')}
                                            className={`p-2 rounded-lg border transition-all ${['available', 'en_route', 'at_site', 'pouring', 'returning'].includes(vehicle.status) ? 'bg-green-100 border-green-300 text-green-700' : 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600'}`}
                                            title="סמן כפעיל"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(vehicle.id, 'maintenance')}
                                            className={`p-2 rounded-lg border transition-all ${vehicle.status === 'maintenance' ? 'bg-red-100 border-red-300 text-red-700' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600'}`}
                                            title="שלח למוסך"
                                        >
                                            <Wrench size={18} />
                                        </button>
                                        <button
                                            onClick={() => onUpdateStatus(vehicle.id, 'off_duty')}
                                            className={`p-2 rounded-lg border transition-all ${vehicle.status === 'off_duty' ? 'bg-gray-200 border-gray-400 text-gray-800' : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'}`}
                                            title="סמן כלא במשמרת"
                                        >
                                            <Coffee size={18} />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            if (confirm('האם אתה בטוח שברצונך למחוק רכב זה? פעולה זו אינה הפיכה.')) {
                                                onRemoveVehicle(vehicle.id);
                                            }
                                        }}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                        title="מחק רכב"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {vehicles.length === 0 && (
                    <div className="text-center py-12">
                        <Truck className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">אין רכבים במערכת. הוסף רכב חדש כדי להתחיל.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
