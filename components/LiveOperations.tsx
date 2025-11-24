
import React, { useState, useEffect } from 'react';
import { Vehicle, Order, VehicleStatus } from '../types';
import { Truck, MapPin, Factory, Info, Navigation, X } from 'lucide-react';

interface LiveOperationsProps {
  vehicles: Vehicle[];
  orders: Order[];
}

// Mock coordinates for simulation
const FACTORY_POS = { x: 50, y: 50 };
const SITES = [
  { id: 's1', x: 20, y: 20, name: 'צפון ת״א' },
  { id: 's2', x: 80, y: 20, name: 'רמת גן' },
  { id: 's3', x: 80, y: 80, name: 'גבעתיים' },
  { id: 's4', x: 20, y: 80, name: 'דרום ת״א' },
  { id: 's5', x: 50, y: 15, name: 'הרצליה' },
];

export const LiveOperations: React.FC<LiveOperationsProps> = ({ vehicles, orders }) => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'vehicle' | 'site', data: any } | null>(null);
  const [time, setTime] = useState(Date.now());

  // Animation loop for smooth movement effects
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getVehiclePosition = (vehicle: Vehicle) => {
    // Default to factory
    let targetPos = FACTORY_POS;
    let isMoving = false;

    if (vehicle.status === 'available' || vehicle.status === 'maintenance') {
      return { ...FACTORY_POS, isMoving: false };
    }

    const order = orders.find(o => o.id === vehicle.currentOrderId);
    if (!order) return { ...FACTORY_POS, isMoving: false };

    // Deterministic pseudo-random site assignment based on order ID hash
    const siteIndex = (order.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % SITES.length;
    const site = SITES[siteIndex];

    switch (vehicle.status) {
      case 'en_route':
        // Simulate movement: In a real app, this would be interpolated. 
        // Here we place them at 40% of the way
        return {
          x: FACTORY_POS.x + (site.x - FACTORY_POS.x) * 0.4,
          y: FACTORY_POS.y + (site.y - FACTORY_POS.y) * 0.4,
          isMoving: true,
          rotation: Math.atan2(site.y - FACTORY_POS.y, site.x - FACTORY_POS.x) * (180 / Math.PI)
        };
      case 'at_site':
      case 'pouring':
        return { ...site, isMoving: false };
      case 'returning':
        // 60% of the way back
        return {
          x: site.x + (FACTORY_POS.x - site.x) * 0.6,
          y: site.y + (FACTORY_POS.y - site.y) * 0.6,
          isMoving: true,
          rotation: Math.atan2(FACTORY_POS.y - site.y, FACTORY_POS.x - site.x) * (180 / Math.PI)
        };
      default:
        return { ...FACTORY_POS, isMoving: false };
    }
  };

  const getStatusColor = (status: VehicleStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'en_route': return 'bg-blue-500';
      case 'at_site': return 'bg-orange-500';
      case 'pouring': return 'bg-purple-500 animate-pulse';
      case 'returning': return 'bg-indigo-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      {/* Map Background Grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 flex gap-4 z-10">
        <div className="bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700 shadow-lg text-white text-right">
          <p className="text-xs text-slate-400">רכבים פעילים</p>
          <p className="text-xl font-bold font-mono text-blue-400">
            {vehicles.filter(v => v.status !== 'available' && v.status !== 'off_duty').length}
            <span className="text-sm text-slate-500 font-normal">/{vehicles.length}</span>
          </p>
        </div>
        <div className="bg-slate-800/90 backdrop-blur p-3 rounded-lg border border-slate-700 shadow-lg text-white text-right">
          <p className="text-xs text-slate-400">יציקות פעילות</p>
          <p className="text-xl font-bold font-mono text-purple-400">
            {vehicles.filter(v => v.status === 'pouring').length}
          </p>
        </div>
      </div>

      {/* Factory Node */}
      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-0"
        style={{ left: `${FACTORY_POS.x}%`, top: `${FACTORY_POS.y}%` }}>
        <div className="w-24 h-24 bg-slate-800/80 rounded-full border-2 border-slate-600 flex items-center justify-center shadow-[0_0_50px_rgba(30,41,59,0.5)]">
          <Factory size={40} className="text-slate-400" />
        </div>
        <span className="mt-2 text-slate-400 font-bold bg-slate-900/80 px-2 py-1 rounded text-sm">המפעל הראשי</span>
      </div>

      {/* Site Nodes */}
      {SITES.map(site => (
        <div key={site.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
          style={{ left: `${site.x}%`, top: `${site.y}%` }}
          onClick={() => setSelectedEntity({ type: 'site', data: site })}
        >
          <div className="w-16 h-16 bg-slate-800/50 rounded-full border border-slate-700 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-slate-800 transition-all">
            <MapPin size={24} className="text-slate-500 group-hover:text-blue-400" />
          </div>
          <span className="mt-1 text-slate-500 text-xs font-medium bg-slate-900/50 px-2 py-1 rounded">{site.name}</span>
        </div>
      ))}

      {/* Vehicles */}
      {vehicles.map(vehicle => {
        const pos = getVehiclePosition(vehicle);
        const isAtFactory = vehicle.status === 'available' || vehicle.status === 'maintenance';

        // Offset vehicles at factory so they don't stack perfectly
        const offset = isAtFactory ? (parseInt(vehicle.id.replace(/\D/g, '')) * 5) - 15 : 0;
        const finalX = isAtFactory ? pos.x + (offset / 10) : pos.x; // Small adjustment for factory parking
        const finalY = isAtFactory ? pos.y + (offset / 10) : pos.y;

        return (
          <div key={vehicle.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-1000 ease-in-out z-20"
            style={{
              left: `${finalX}%`,
              top: `${finalY}%`,
            }}
            onClick={() => setSelectedEntity({ type: 'vehicle', data: vehicle })}
          >
            <div className={`relative transition-transform duration-1000`}
              style={{ transform: pos.rotation ? `rotate(${pos.rotation}deg)` : 'none' }}>
              <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white ${getStatusColor(vehicle.status)}`}>
                <Truck size={20} className="text-white" />
              </div>
              {/* Status Dot Ping */}
              {vehicle.status === 'pouring' && (
                <div className="absolute -inset-2 bg-purple-500/30 rounded-full animate-ping"></div>
              )}
            </div>

            {/* Label (Only show if not moving fast or hovered) */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/70 text-white text-[10px] px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
              {vehicle.vehicleNumber}
            </div>
          </div>
        );
      })}

      {/* Detail Modal / Popover */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-white rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 fade-in z-50" dir="rtl">
          <button onClick={() => setSelectedEntity(null)} className="absolute top-2 left-2 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>

          {selectedEntity.type === 'vehicle' && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${getStatusColor(selectedEntity.data.status)}`}>
                  <Truck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedEntity.data.vehicleNumber}</h3>
                  <p className="text-sm text-gray-500">{selectedEntity.data.driverName}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">סטטוס:</span>
                  <span className="font-bold">{selectedEntity.data.status}</span>
                </div>
                {selectedEntity.data.currentOrderId && (
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-500">הזמנה:</span>
                    <span className="font-bold text-blue-600">{orders.find((o: Order) => o.id === selectedEntity.data.currentOrderId)?.orderNumber || 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-500">קיבולת:</span>
                  <span className="font-bold">{selectedEntity.data.capacity} קוב</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  צור קשר
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                  היסטוריה
                </button>
              </div>
            </div>
          )}

          {selectedEntity.type === 'site' && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-slate-800">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedEntity.data.name}</h3>
                  <p className="text-sm text-gray-500">אתר פעיל</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                אתר זה מרכז פעילות מאזור {selectedEntity.data.name}.
                כרגע אין הזמנות פעילות ספציפיות המשויכות לנקודת ציון זו במפה (הדגמה).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
