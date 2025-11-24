import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../src/services/api';
import { Users, Plus, Edit2, Trash2, X, Check, Shield, ShieldAlert, Truck, Phone, MessageSquare } from 'lucide-react';

interface TeamManagementProps {
    onBack: () => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onBack }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'driver' as UserRole
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.updateUser(editingUser.id, formData);
            } else {
                await api.createUser(formData);
            }
            await loadUsers();
            closeModal();
        } catch (error) {
            console.error('Failed to save user:', error);
            alert('שגיאה בשמירת המשתמש');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
            try {
                await api.deleteUser(id);
                await loadUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.username,
                password: '', // Don't show existing password
                name: user.name,
                role: user.role
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'driver'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'owner': return <ShieldAlert className="text-red-500" size={18} />;
            case 'manager': return <Shield className="text-blue-500" size={18} />;
            case 'dispatcher': return <Phone className="text-purple-500" size={18} />;
            case 'driver': return <Truck className="text-green-500" size={18} />;
            case 'customer': return <MessageSquare className="text-orange-500" size={18} />;
            default: return <Users size={18} />;
        }
    };

    const getRoleName = (role: UserRole) => {
        switch (role) {
            case 'owner': return 'בעלים';
            case 'manager': return 'מנהל';
            case 'dispatcher': return 'סדרן';
            case 'driver': return 'נהג';
            case 'customer': return 'לקוח';
            default: return role;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6" dir="rtl">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">ניהול צוות</h1>
                        <p className="text-slate-500">ניהול משתמשים והרשאות מערכת</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onBack}
                            className="px-4 py-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                            חזרה
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                            <Plus size={20} />
                            הוסף משתמש
                        </button>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-right py-4 px-6 font-medium text-slate-500">שם מלא</th>
                                <th className="text-right py-4 px-6 font-medium text-slate-500">שם משתמש</th>
                                <th className="text-right py-4 px-6 font-medium text-slate-500">תפקיד</th>
                                <th className="text-right py-4 px-6 font-medium text-slate-500">כניסה אחרונה</th>
                                <th className="text-left py-4 px-6 font-medium text-slate-500">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-900">{user.name}</div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                                        {user.username}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            {getRoleIcon(user.role)}
                                            <span className="text-sm text-slate-700">{getRoleName(user.role)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-500">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('he-IL') : '-'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="ערוך"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {user.username !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="מחק"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && !isLoading && (
                        <div className="p-8 text-center text-slate-500">
                            לא נמצאו משתמשים במערכת
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">שם מלא</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">שם משתמש</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {editingUser ? 'סיסמה (השאר ריק ללא שינוי)' : 'סיסמה'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">תפקיד</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="driver">נהג</option>
                                    <option value="dispatcher">סדרן</option>
                                    <option value="manager">מנהל</option>
                                    <option value="owner">בעלים</option>
                                    <option value="customer">לקוח</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    {editingUser ? 'שמור שינויים' : 'צור משתמש'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
