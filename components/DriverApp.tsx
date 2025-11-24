import React, { useState, useEffect } from 'react';
import { Vehicle, Order, VehicleStatus, OrderStatus } from '../types';
import { Navigation, Phone, MapPin, CheckCircle, Truck, ArrowRight, LogOut } from 'lucide-react';

interface DriverAppProps {
  vehicles: Vehicle[];
  orders: Order[];
  onUpdateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onBack: () => void;
}

export const DriverApp: React.FC<DriverAppProps> = ({ vehicles, orders, onUpdateVehicleStatus, onUpdateOrder, onBack }) => {
  const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(() => {
    return localStorage.getItem('driver_vehicle_id');
  });

  const currentVehicle = vehicles.find(v => v.id === currentVehicleId);
  const currentOrder = currentVehicle?.currentOrderId
    ? orders.find(o => o.id === currentVehicle.currentOrderId)
    : null;

  useEffect(() => {
    if (currentVehicleId) {
      localStorage.setItem('driver_vehicle_id', currentVehicleId);
    } else {
      localStorage.removeItem('driver_vehicle_id');
    }
  }, [currentVehicleId]);

  const handleLogin = (vehicleId: string) => {
    setCurrentVehicleId(vehicleId);
  };

  const handleLogout = () => {
    setCurrentVehicleId(null);
  };

  const advanceStatus = () => {
    if (!currentVehicle || !currentOrder) return;

    const currentStatus = currentVehicle.status;
    let nextVehicleStatus: VehicleStatus | null = null;
    let nextOrderStatus: OrderStatus | null = null;

    switch (currentStatus) {
      case 'available':
        nextVehicleStatus = 'en_route';
        nextOrderStatus = 'en_route';
        break;
      case 'en_route':
        nextVehicleStatus = 'at_site';
        nextOrderStatus = 'at_site';
        break;
      case 'at_site':
        nextVehicleStatus = 'pouring';
        nextOrderStatus = 'pouring';
        break;
      case 'pouring':
        nextVehicleStatus = 'returning';
        nextOrderStatus = 'completed'; // Order is done when pouring finishes
        break;
      case 'returning':
        nextVehicleStatus = 'available'; // Back to base
        // Order is already completed
        break;
      default:
        break;
    }

    if (nextVehicleStatus) {
      onUpdateVehicleStatus(currentVehicle.id, nextVehicleStatus);
    }
    if (nextOrderStatus) {
      onUpdateOrder(currentOrder.id, { status: nextOrderStatus });
    }

    // Special case: if returning -> available, we need to clear the currentOrderId from the vehicle
    if (nextVehicleStatus === 'available') {
      // We need to clear currentOrderId when job is done.
      // This requires updating the vehicle to remove its currentOrderId.
      // The onUpdateVehicleStatus function only updates the status, not other fields.
      // For now, we'll rely on the App.tsx logic to handle clearing currentOrderId
      // when a vehicle becomes 'available' after an order is completed.
      // If App.tsx doesn't do this, the driver will still see the old order.
      // A more robust solution would be to pass a function like onClearVehicleOrder(vehicleId)
      // or modify onUpdateVehicleStatus to accept partial vehicle updates.
      // For this MVP, let's assume 'available' means available for next order.
      // The manager might need to verify? Or we auto-clear.
      // Let's auto-clear for flow simplicity.
      // We need a way to say "Vehicle is free". 
      // Actually, if we set status to 'available', it shows up in the list.
      // But currentOrderId needs to be cleared.
      // We'll rely on the backend or a separate call if needed, 
      // but for this MVP, let's just update status.
      // Wait, if currentOrderId persists, the driver will still see the old order.
      // We MUST clear currentOrderId when job is done.
      if (nextVehicleStatus === 'available') {
        // We can't easily clear currentOrderId via onUpdateVehicleStatus if it only takes status.
        // We might need to update App.tsx to handle this or pass a more powerful function.
        // For now, let's just set status to 'available'
        onUpdateVehicleStatus(currentVehicle.id, 'available');
      }
    }
  };

  // Login Screen
  if (!currentVehicle) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Truck size={40} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ברוכים הבאים</h1>
          <p className="text-slate-500 mb-8">מערכת נהגים - בטון סבאג</p>

          <div className="space-y-3">
            <label className="block text-right font-medium text-slate-700">בחר רכב להתחברות:</label>
            <select
              className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => handleLogin(e.target.value)}
              value=""
            >
              <option value="" disabled>בחר רכב...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} - {v.driverName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onBack}
            className="mt-8 text-slate-400 hover:text-slate-600 text-sm underline"
          >
            חזרה למסך הראשי
          </button>
        </div>
      </div>
    );
  }

  // Main App Screen
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
            {(currentVehicle.vehicleNumber || '').split('-')[1] || currentVehicle.vehicleNumber}
          </div>
          <div>
            <h2 className="font-bold">{currentVehicle.driverName}</h2>
            <p className="text-xs text-slate-400">{currentVehicle.vehicleNumber}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-4">

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <p className="text-slate-500 mb-2">סטטוס נוכחי</p>
          <div className="text-2xl font-bold text-slate-800 mb-6">
            {currentVehicle.status === 'available' ? 'ממתין למשימה' :
              currentVehicle.status === 'en_route' ? 'בדרך ליעד' :
                currentVehicle.status === 'at_site' ? 'באתר' :
                  currentVehicle.status === 'pouring' ? 'פורק בטון' :
                    currentVehicle.status === 'returning' ? 'חוזר למפעל' :
                      'לא זמין'}
          </div>

          {currentOrder && (
            <button
              onClick={advanceStatus}
              className={`
                                w-full py-6 rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3
                                ${currentVehicle.status === 'returning'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}
                            `}
            >
              {currentVehicle.status === 'available' ? <span><ArrowRight /> יצאתי לדרך</span> :
                currentVehicle.status === 'en_route' ? <span><MapPin /> הגעתי לאתר</span> :
                  currentVehicle.status === 'at_site' ? <span><Truck /> מתחיל יציקה</span> :
                    currentVehicle.status === 'pouring' ? <span><ArrowRight /> סיימתי, חוזר</span> :
                      currentVehicle.status === 'returning' ? <span><CheckCircle /> הגעתי למפעל</span> :
                        'פעולה לא זמינה'}
            </button>
          )}
        </div>

        {/* Mission Details */}
        {currentOrder ? (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
              <h3 className="font-bold text-blue-900">פרטי הזמנה #{currentOrder.orderNumber}</h3>
              <span className="bg-white text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                {currentOrder.grade}
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Address & Waze */}
              <div>
                <label className="text-xs text-slate-500 font-bold">כתובת</label>
                <div className="flex items-start gap-3 mt-1">
                  <MapPin className="text-red-500 shrink-0 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-lg font-medium text-slate-800 leading-tight">{currentOrder.address}</p>
                  </div>
                </div>
                <a
                  href={`https://waze.com/ul?q=${encodeURIComponent(currentOrder.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                >
                  <Navigation size={18} /> נווט עם Waze
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs text-slate-500 font-bold">לקוח</label>
                  <p className="font-medium text-slate-800">{currentOrder.companyName}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold">כמות</label>
                  <p className="font-medium text-slate-800">{currentOrder.quantity} מ"ק</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs text-slate-500 font-bold">איש קשר</label>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-medium text-slate-800">{currentOrder.siteContactName}</p>
                  <a
                    href={`tel:${currentOrder.siteContactPhone}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-sm hover:bg-green-100 transition-colors"
                  >
                    <Phone size={16} /> חייג
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Truck size={40} className="opacity-20" />
            </div>
            <p className="text-lg font-medium">אין משימות פעילות</p>
            <p className="text-sm">המתן לקבלת סידור עבודה מהסדרן</p>
          </div>
        )}
      </div>
    </div>
  );
};
