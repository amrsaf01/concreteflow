import React from 'react';
import { Order, Vehicle } from '../types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { TrendingUp, Activity, Truck, CheckCircle, PieChart as PieIcon, Download } from 'lucide-react';

interface ReportsProps {
    orders: Order[];
    vehicles: Vehicle[];
}

export const Reports: React.FC<ReportsProps> = ({ orders, vehicles }) => {
    // --- Export Function ---
    const handleExport = () => {
        // 1. Convert orders to CSV
        const headers = ['Order ID', 'Company', 'Quantity', 'Grade', 'Address', 'Time', 'Status', 'Vehicle'];
        const rows = orders.map(o => [
            o.id,
            o.companyName,
            o.quantity,
            o.grade,
            o.address.replace(/,/g, ' '), // Escape commas
            o.deliveryTime,
            o.status,
            o.assignedVehicleId || 'Unassigned'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // 2. Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `reports-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- KPI Calculations ---
    const totalVolume = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + o.quantity, 0);

    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalOrdersCount = orders.length;
    const completionRate = totalOrdersCount > 0 ? Math.round((completedOrders / totalOrdersCount) * 100) : 0;

    const activeVehicles = vehicles.filter(v => v.status !== 'off_duty' && v.status !== 'maintenance').length;
    const fleetUtilization = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0;

    const avgOrderSize = totalOrdersCount > 0
        ? Math.round(orders.reduce((sum, o) => sum + o.quantity, 0) / totalOrdersCount)
        : 0;

    // --- Chart Data Preparation ---

    // 1. Status Distribution (Pie Chart)
    const statusCounts = orders.reduce((acc, order) => {
        const status = order.status === 'pending' ? 'ממתין' :
            order.status === 'completed' ? 'הושלם' :
                order.status === 'rejected' ? 'נדחה' : 'בטיפול';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const COLORS = ['#FFBB28', '#00C49F', '#FF8042', '#0088FE'];

    // 2. Vehicle Performance (Bar Chart)
    const vehicleStats = vehicles.map(v => {
        const orderCount = orders.filter(o => o.assignedVehicleId === v.id).length;
        return {
            name: v.vehicleNumber,
            orders: orderCount
        };
    }).filter(v => v.orders > 0).sort((a, b) => b.orders - a.orders).slice(0, 10);

    // 3. Daily Volume (Mock History + Today)
    const todayVolume = totalVolume;
    const volumeData = [
        { name: 'לפני 6 ימים', volume: 120 },
        { name: 'לפני 5 ימים', volume: 150 },
        { name: 'לפני 4 ימים', volume: 180 },
        { name: 'לפני 3 ימים', volume: 140 },
        { name: 'שלשום', volume: 200 },
        { name: 'אתמול', volume: 160 },
        { name: 'היום', volume: todayVolume > 0 ? todayVolume : 45 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-blue-600" />
                    דוחות וניתוח נתונים
                </h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm font-medium shadow-sm"
                    >
                        <Download size={16} />
                        ייצוא ל-CSV
                    </button>
                    <div className="text-sm text-slate-500">
                        סיכום פעילות בזמן אמת
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="text-blue-600" size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{totalVolume}</div>
                    <div className="text-sm text-slate-500">סה"כ נפח (מ"ק)</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <CheckCircle className="text-emerald-600" size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{completionRate}%</div>
                    <div className="text-sm text-slate-500">שיעור השלמה</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <Truck className="text-purple-600" size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{fleetUtilization}%</div>
                    <div className="text-sm text-slate-500">ניצולת צי</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <PieIcon className="text-orange-600" size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{avgOrderSize}</div>
                    <div className="text-sm text-slate-500">ממוצע להזמנה (מ"ק)</div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Volume Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">נפח יציקות שבועי</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={volumeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="נפח (מ״ק)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-lg mb-6 text-slate-800">התפלגות סטטוס הזמנות</h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Vehicle Performance */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-6 text-slate-800">ביצועי רכבים (מספר משימות)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={vehicleStats} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} fontSize={12} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="orders" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} name="משימות" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
