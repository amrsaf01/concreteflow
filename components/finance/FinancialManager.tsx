import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Package, FileText } from 'lucide-react';
import { Product, PriceList } from '../../types';
import { api } from '../../src/services/api';

interface FinancialManagerProps {
    onBack: () => void;
}

export function FinancialManager({ onBack }: FinancialManagerProps) {
    const [activeTab, setActiveTab] = useState<'products' | 'pricelists'>('products');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">ניהול פיננסי</h2>
                    <p className="text-slate-500 text-sm">ניהול מוצרים ומחירונים</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        חזרה
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-6">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'products'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Package size={18} />
                    מוצרים ושירותים
                </button>
                <button
                    onClick={() => setActiveTab('pricelists')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pricelists'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText size={18} />
                    מחירונים
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'products' ? <ProductsTab /> : <PriceListsTab />}
            </div>
        </div>
    );
}

function ProductsTab() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        type: 'concrete',
        unit: 'm3',
        basePrice: 0
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                type: 'concrete',
                unit: 'm3',
                basePrice: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                const updated = await api.updateProduct(editingProduct.id, formData);
                setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else {
                const created = await api.createProduct(formData);
                setProducts(prev => [...prev, created]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('שגיאה בשמירת המוצר');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
            try {
                await api.deleteProduct(id);
                setProducts(prev => prev.filter(p => p.id !== id));
            } catch (error) {
                console.error('Failed to delete product:', error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">קטלוג מוצרים</h3>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    מוצר חדש
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">שם המוצר</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">סוג</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">יחידת מידה</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">מחיר בסיס</th>
                            <th className="px-6 py-3 text-sm font-semibold text-slate-600">פעולות</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    {product.type === 'concrete' ? 'בטון' :
                                        product.type === 'pump' ? 'משאבה' : 'תוסף'}
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{product.unit}</td>
                                <td className="px-6 py-4 text-slate-900 font-bold">₪{product.basePrice}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(product)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                    לא נמצאו מוצרים בקטלוג
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingProduct ? 'עריכת מוצר' : 'מוצר חדש'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">שם המוצר</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">סוג</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="concrete">בטון</option>
                                        <option value="pump">משאבה</option>
                                        <option value="additive">תוסף</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">יחידת מידה</label>
                                    <select
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="m3">מ"ק</option>
                                        <option value="hour">שעה</option>
                                        <option value="kg">ק"ג</option>
                                        <option value="fixed">מחיר קבוע</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">מחיר בסיס (₪)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.basePrice}
                                    onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                                >
                                    <Save size={18} />
                                    שמור
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function PriceListsTab() {
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPriceLists();
    }, []);

    const fetchPriceLists = async () => {
        try {
            const data = await api.getPriceLists();
            setPriceLists(data);
        } catch (error) {
            console.error('Failed to fetch price lists:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">מחירונים</h3>
                <button
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => alert('פונקציונליות זו תתווסף בקרוב')}
                >
                    <Plus size={20} />
                    מחירון חדש
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {priceLists.map(list => (
                    <div key={list.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-slate-800">{list.name}</h4>
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                {list.items.length} פריטים
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            נוצר ב: {new Date(list.createdAt).toLocaleDateString('he-IL')}
                        </p>
                        <button className="w-full py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors text-sm font-medium">
                            צפה בפריטים
                        </button>
                    </div>
                ))}
                {priceLists.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <FileText className="mx-auto text-slate-300 mb-2" size={48} />
                        <p className="text-slate-500">לא הוגדרו מחירונים</p>
                    </div>
                )}
            </div>
        </div>
    );
}
