import React from 'react';
import { Vehicle } from '../types';
import { User, Phone, Truck, Award, Star } from 'lucide-react';

interface DriversListProps {
    vehicles: Vehicle[];
    onBack: () => void;
}

export const DriversList: React.FC<DriversListProps> = ({ vehicles, onBack }) => {
    // Mock driver data enhanced with vehicle info
    const drivers = vehicles.map(v => ({
        id: v.id,
        name: v.driverName,
        phone: '050-0000000', // Mock phone
        license: 'B, C1', // Mock license
        vehicleNumber: v.vehicleNumber,
        vehicleType: v.type,
        status: v.status,
        rating: 4.8, // Mock rating
        seniority: '3 שנים' // Mock seniority
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <User className="text-blue-600" /> אינדקס נהגים
                    </h1>
                    <p className="text-gray-500 mt-1">ניהול פרטי נהגים וקשר ישיר</p>
                </div>
                <button onClick={onBack} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                    חזרה ללוח בקרה
                </button>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map(driver => (
                    <div key={driver.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                                        {driver.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{driver.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            {driver.rating} • {driver.seniority}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${driver.status === 'available' ? 'bg-green-100 text-green-700' :
                                    driver.status === 'maintenance' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    {driver.status === 'available' ? 'פנוי' :
                                        driver.status === 'maintenance' ? 'במוסך' : 'בעבודה'}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    <Truck size={18} className="text-gray-400" />
                                    <span className="font-mono font-bold">{driver.vehicleNumber}</span>
                                    <span className="text-xs text-gray-400">({driver.vehicleType === 'mixer' ? 'מיקסר' : 'משאבה'})</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-600 p-2">
                                    <Phone size={18} className="text-gray-400" />
                                    <span>{driver.phone}</span>
                                </div>

                                <div className="flex items-center gap-3 text-gray-600 p-2">
                                    <Award size={18} className="text-gray-400" />
                                    <span>רישיון: {driver.license}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    <Phone size={16} /> חייג
                                </button>
                                <button className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                    כרטיס עובד
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
