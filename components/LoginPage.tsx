import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { Truck, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(username, password);
        } catch (err) {
            setError('שם משתמש או סיסמה שגויים');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4 shadow-lg">
                        <Truck className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">ConcreteFlow</h1>
                    <p className="text-slate-400">מערכת לניהול מפעל בטון</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">שם משתמש</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <UserIcon className="text-slate-400" size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pr-10 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="הכנס שם משתמש"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">סיסמה</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <Lock className="text-slate-400" size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pr-10 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                                    placeholder="הכנס סיסמה"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? 'מתחבר...' : 'התחבר למערכת (2.1 Control Center)'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 border-t border-slate-100">
                    &copy; {new Date().getFullYear()} ConcreteFlow. כל הזכויות שמורות.
                    <br />
                    <div className="mt-8 text-center text-sm text-slate-400">
                        גרסה: 2.1 (Last Update: {new Date().toLocaleTimeString('he-IL')})
                    </div>
                </div>
            </div>
        </div>
    );
};
