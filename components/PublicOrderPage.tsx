import React, { useState } from 'react';
import { ArrowRight, Truck } from 'lucide-react';
import { BotSimulator } from './BotSimulator';
import { api } from '../src/services/api';

export const PublicOrderPage: React.FC = () => {
    const [showBot, setShowBot] = useState(false);

    const handleOrderCreated = async (order: any) => {
        try {
            await api.createOrder(order);
            console.log('Order created successfully');
        } catch (error) {
            console.error('Failed to create order:', error);
            alert('שגיאה ביצירת ההזמנה. אנא נסה שוב.');
        }
    };

    if (showBot) {
        return (
            <div className="min-h-screen bg-slate-50" dir="rtl">
                <BotSimulator
                    onOrderCreated={handleOrderCreated}
                    onBack={() => setShowBot(false)}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50" dir="rtl">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-3 rounded-xl shadow-lg">
                            <Truck size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">בטון סבאג</h1>
                            <p className="text-sm text-slate-500">הזמנת בטון מהירה ופשוטה</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-l from-orange-500 to-orange-600 p-8 text-white">
                        <h2 className="text-3xl font-bold mb-3">הזמן בטון בקלות 🏗️</h2>
                        <p className="text-orange-100 text-lg">
                            שיחה קצרה עם הבוט החכם שלנו - וההזמנה בדרך אליך
                        </p>
                    </div>

                    {/* Features */}
                    <div className="p-8 space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-slate-50 rounded-xl">
                                <div className="text-4xl mb-3">⚡</div>
                                <h3 className="font-bold text-slate-900 mb-2">מהיר</h3>
                                <p className="text-sm text-slate-600">תהליך הזמנה של 2 דקות</p>
                            </div>
                            <div className="text-center p-6 bg-slate-50 rounded-xl">
                                <div className="text-4xl mb-3">🤖</div>
                                <h3 className="font-bold text-slate-900 mb-2">חכם</h3>
                                <p className="text-sm text-slate-600">הבוט זוכר אותך ומזרז את התהליך</p>
                            </div>
                            <div className="text-center p-6 bg-slate-50 rounded-xl">
                                <div className="text-4xl mb-3">📱</div>
                                <h3 className="font-bold text-slate-900 mb-2">נוח</h3>
                                <p className="text-sm text-slate-600">עובד מכל מכשיר, בכל זמן</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="pt-6">
                            <button
                                onClick={() => setShowBot(true)}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg group"
                            >
                                <span>התחל הזמנה חדשה</span>
                                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="pt-6 border-t border-slate-200">
                            <h3 className="font-bold text-slate-900 mb-3">איך זה עובד?</h3>
                            <ol className="space-y-2 text-slate-700">
                                <li className="flex items-start gap-2">
                                    <span className="bg-orange-100 text-orange-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">1</span>
                                    <span>לחץ על "התחל הזמנה חדשה"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="bg-orange-100 text-orange-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">2</span>
                                    <span>ענה על כמה שאלות פשוטות (כמות, סוג בטון, כתובת...)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="bg-orange-100 text-orange-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">3</span>
                                    <span>אשר את ההזמנה - וזהו! נעדכן אותך ברגע שנהג ישובץ</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-slate-500 text-sm">
                    <p>יש שאלות? צור קשר: 050-0000000</p>
                    <p className="mt-2">&copy; {new Date().getFullYear()} בטון סבאג - כל הזכויות שמורות</p>
                </div>
            </main>
        </div>
    );
};
