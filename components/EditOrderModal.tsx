import React, { useState, useEffect } from 'react';
import { Order, ConcreteGrade } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (orderId: string, updates: Partial<Order>) => void;
    order: Order | null;
}

export function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
    const [formData, setFormData] = useState<Partial<Order>>({});

    useEffect(() => {
        if (order) {
            setFormData({
                quantity: order.quantity,
                grade: order.grade,
                address: order.address,
                deliveryTime: order.deliveryTime,
                pumpRequired: order.pumpRequired,
                notes: order.notes,
                siteContactName: order.siteContactName,
                siteContactPhone: order.siteContactPhone,
            });
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(order.id, formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">עריכת הזמנה</h2>
                        <p className="text-sm text-slate-500">#{order.orderNumber} - {order.companyName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">כמות (מ"ק)</label>
                            <input
                                type="number"
                                value={formData.quantity || ''}
                                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">סוג בטון</label>
                            <select
                                value={formData.grade || ''}
                                onChange={e => setFormData({ ...formData, grade: e.target.value as ConcreteGrade })}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {['B20', 'B25', 'B30', 'B35', 'B40', 'B50'].map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">כתובת</label>
                        <input
                            type="text"
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">זמן אספקה</label>
                            <input
                                type="datetime-local"
                                value={formData.deliveryTime ? formData.deliveryTime.slice(0, 16) : ''}
                                onChange={e => setFormData({ ...formData, deliveryTime: new Date(e.target.value).toISOString() })}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.pumpRequired || false}
                                    onChange={e => setFormData({ ...formData, pumpRequired: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">נדרשת משאבה</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">איש קשר</label>
                            <input
                                type="text"
                                value={formData.siteContactName || ''}
                                onChange={e => setFormData({ ...formData, siteContactName: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">טלפון</label>
                            <input
                                type="text"
                                value={formData.siteContactPhone || ''}
                                onChange={e => setFormData({ ...formData, siteContactPhone: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">הערות</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={18} />
                            שמור שינויים
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
