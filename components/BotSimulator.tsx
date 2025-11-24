
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowRight, Mic, CheckCheck, Truck, User, RefreshCw } from 'lucide-react';
import { Order, ConcreteGrade } from '../types';
import { KNOWN_CLIENTS } from '../constants';

interface BotSimulatorProps {
  onOrderCreated: (order: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => void;
  onBack: () => void;
}

type Step = 'INIT' | 'IDENTIFY_NAME' | 'IDENTIFY_COMPANY' | 'QTY' | 'GRADE' | 'ADDRESS' | 'TIME' | 'PUMP' | 'CONFIRM' | 'DONE';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'audio';
}

interface QuickReply {
  label: string;
  value: string;
}

const SIMULATION_PERSONAS = [
  { label: 'לקוח לא מזוהה (חדש)', phone: '050-0000000', name: null, company: null },
  { label: 'מוחמד (סולל בונה)', phone: '052-9876543', name: 'מוחמד חליל', company: 'סולל בונה' },
  { label: 'אבי (דניה סיבוס)', phone: '054-5555555', name: 'אבי כהן', company: 'דניה סיבוס' },
];

export const BotSimulator: React.FC<BotSimulatorProps> = ({ onOrderCreated, onBack }) => {
  const [currentPersona, setCurrentPersona] = useState(SIMULATION_PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState<Step>('INIT');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState<QuickReply[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Temporary order state
  const [tempOrder, setTempOrder] = useState<Partial<Order>>({});

  // Reset chat when persona changes
  useEffect(() => {
    startConversation();
  }, [currentPersona]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, showQuickReplies]);

  const startConversation = () => {
    setMessages([]);
    setStep('INIT');
    setTempOrder({ siteContactPhone: currentPersona.phone });
    
    // Identify User logic
    const knownClient = KNOWN_CLIENTS[currentPersona.phone];
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      if (knownClient) {
        // Known Client Flow (VIP)
        setTempOrder(prev => ({ 
          ...prev, 
          companyName: knownClient.company,
          siteContactName: knownClient.siteName,
          supervisorName: knownClient.supervisorName,
          supervisorPhone: knownClient.supervisorPhone
        }));
        
        addMessage(`שלום ${knownClient.siteName} מחברת ${knownClient.company}! 👋\nשמח לראות אותך שוב.\n\nכמה קוב בטון נדרש להיום?`, 'bot');
        setStep('QTY');
      } else {
        // Unknown Client Flow (Privacy Mode - Don't leak names)
        addMessage("שלום! ברוך הבא להזמנות בטון סבאג. 🏗️\nלא זיהיתי את המספר במערכת.\n\nאיך לקרוא לך?", 'bot');
        setStep('IDENTIFY_NAME');
      }
    }, 1000);
  };

  const addMessage = (text: string, sender: 'bot' | 'user', type: 'text' | 'audio' = 'text') => {
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      text, 
      sender, 
      timestamp: new Date(),
      status: sender === 'user' ? 'sent' : 'read',
      type
    }]);
    
    if (sender === 'user') {
      setTimeout(() => {
        setMessages(current => current.map(m => 
          m.id === Date.now().toString() ? { ...m, status: 'read' } : m
        ));
      }, 1000);
    }
  };

  const simulateBotResponse = (text: string, nextStep: Step, replies: QuickReply[] = [], delay = 1500) => {
    setShowQuickReplies([]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(text, 'bot');
      setStep(nextStep);
      setShowQuickReplies(replies);
    }, delay);
  };

  const handleSend = (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    addMessage(textToSend, 'user');
    setInput('');
    setShowQuickReplies([]);

    processUserInput(textToSend);
  };

  const processUserInput = (userText: string) => {
    const lowerText = userText.toLowerCase();
    
    switch (step) {
      case 'IDENTIFY_NAME':
        setTempOrder(prev => ({ ...prev, siteContactName: userText }));
        simulateBotResponse(`נעים להכיר, ${userText}. 🤝\nעבור איזו חברה ההזמנה?`, 'IDENTIFY_COMPANY');
        break;

      case 'IDENTIFY_COMPANY':
        setTempOrder(prev => ({ ...prev, companyName: userText }));
        simulateBotResponse(`רשמתי. חברת "${userText}".\nאנא רשום את שם המפקח בחברה לקבלת אישורים (אופציונלי):`, 'QTY');
        break;

      case 'QTY':
        // If we came from COMPANY step, the user input is actually the Supervisor Name or Quantity
        // This is a simplified logic flow. If text is a number, assume quantity. If text, assume supervisor name.
        const isNumber = /^\d+(\.\d+)?$/.test(userText) || /^\d+\s*קוב/.test(userText);
        
        if (!tempOrder.quantity && !isNumber && step === 'QTY' && !tempOrder.supervisorName) {
             // We just came from company, user entered supervisor name
             setTempOrder(prev => ({ ...prev, supervisorName: userText, supervisorPhone: '050-0000000' })); // Mock phone for new user
             simulateBotResponse(`תודה. רשמתי את ${userText} כמפקח.\n\nכמה קוב בטון תרצו להזמין?`, 'QTY');
             return;
        }

        const qtyMatch = userText.match(/\d+(\.\d+)?/);
        if (!qtyMatch) {
          simulateBotResponse("לא הצלחתי להבין את הכמות. אנא רשום מספר (לדוגמה: 8).", 'QTY');
          return;
        }
        const qty = parseFloat(qtyMatch[0]);
        
        if (qty <= 0 || qty > 100) {
           simulateBotResponse("הכמות נראית לא הגיונית. אנא נסה שוב.", 'QTY');
        } else {
          setTempOrder(prev => ({ ...prev, quantity: qty }));
          simulateBotResponse(
            `רשמתי ${qty} קוב. \nאיזה סוג בטון נדרש?`, 
            'GRADE',
            [
              { label: 'B-30 (סטנדרט)', value: 'B30' },
              { label: 'B-40 (חזק)', value: 'B40' },
              { label: 'B-50 (כבד)', value: 'B50' },
              { label: 'B-25 (קל)', value: 'B25' }
            ]
          );
        }
        break;

      case 'GRADE':
        const gradeMatch = userText.match(/[bב][\s-]?(\d+)/i) || userText.match(/(\d+)/);
        let grade: ConcreteGrade | null = null;
        if (gradeMatch) {
           const num = gradeMatch[1];
           const validGrades = ['20', '25', '30', '35', '40', '50'];
           if (validGrades.includes(num)) {
             grade = `B${num}` as ConcreteGrade;
           }
        }
        if (['B20', 'B25', 'B30', 'B35', 'B40', 'B50'].includes(userText.toUpperCase())) {
            grade = userText.toUpperCase() as ConcreteGrade;
        }

        if (grade) {
            setTempOrder(prev => ({ ...prev, grade }));
            simulateBotResponse(
              "מעולה. 📍 מה כתובת האתר ליציקה?", 
              'ADDRESS',
              [{ label: 'השתמש במיקום נוכחי', value: 'דרך מנחם בגין 144, תל אביב' }]
            );
        } else {
            simulateBotResponse("אנא בחר דרגת בטון תקנית (B30, B40 וכו').", 'GRADE');
        }
        break;

      case 'ADDRESS':
        setTempOrder(prev => ({ ...prev, address: userText }));
        simulateBotResponse(
          "מתי תרצו שנגיע? 🕒", 
          'TIME',
          [
            { label: 'עכשיו / דחוף', value: 'בהקדם האפשרי' },
            { label: 'מחר בבוקר (07:00)', value: 'מחר ב-07:00' },
            { label: 'מחר בצהריים (12:00)', value: 'מחר ב-12:00' }
          ]
        );
        break;

      case 'TIME':
        setTempOrder(prev => ({ ...prev, deliveryTime: userText }));
        simulateBotResponse(
          "האם נדרשת משאבת בטון לפריקה? 🏗️", 
          'PUMP',
          [
            { label: 'כן, צריך משאבה', value: 'כן' },
            { label: 'לא, פריקה רגילה', value: 'לא' }
          ]
        );
        break;

      case 'PUMP':
        const isYes = ['כן', 'yes', 'צריך', 'חיובי', 'עם'].some(w => lowerText.includes(w));
        setTempOrder(prev => ({ ...prev, pumpRequired: isYes }));
        
        const summary = `
*סיכום הזמנה:* 📝
🏢 חברה: *${tempOrder.companyName}*
👷 שטח: ${tempOrder.siteContactName} (${currentPersona.phone})
👔 מפקח: ${tempOrder.supervisorName || 'לא צוין'} (${tempOrder.supervisorPhone || '-'})

📦 כמות: ${tempOrder.quantity} קוב
🏗️ סוג: ${tempOrder.grade}
📍 כתובת: ${tempOrder.address}
🕒 זמן: ${userText}
🚛 משאבה: ${isYes ? 'כן' : 'לא'}

*האם לאשר את ההזמנה?*
        `;
        simulateBotResponse(summary, 'CONFIRM', [
          { label: '✅ אשר הזמנה', value: 'כן' },
          { label: '❌ בטל', value: 'לא' }
        ]);
        break;

      case 'CONFIRM':
        if (lowerText.includes('כן') || lowerText.includes('yes') || lowerText.includes('אשר')) {
          const confirmationMsg = `✅ *ההזמנה התקבלה בהצלחה!*
          
מספר הזמנה #ORD-NEW נוצר.

1. אישור נשלח אליך ל-WhatsApp.
2. ${tempOrder.supervisorName ? `עותק נשלח למפקח ${tempOrder.supervisorName} במייל/SMS.` : 'עותק נשמר במערכת.'}

אנו נשלח עדכון ברגע שישובץ נהג.`;

          simulateBotResponse(confirmationMsg, 'DONE', [
             { label: 'הזמנה חדשה', value: 'הזמנה חדשה' }
          ]);
          
          if (tempOrder.quantity && tempOrder.grade) {
            onOrderCreated({
              companyName: tempOrder.companyName!,
              siteContactName: tempOrder.siteContactName!,
              siteContactPhone: currentPersona.phone,
              supervisorName: tempOrder.supervisorName,
              supervisorPhone: tempOrder.supervisorPhone,
              quantity: tempOrder.quantity!,
              grade: tempOrder.grade as ConcreteGrade,
              address: tempOrder.address || 'לא צוין',
              deliveryTime: new Date().toISOString(),
              pumpRequired: !!tempOrder.pumpRequired
            });
          }
        } else {
          simulateBotResponse("ההזמנה בוטלה.", 'INIT', [{label: 'התחל מחדש', value: 'התחל'}]);
        }
        break;
        
      case 'DONE':
      case 'INIT':
        setStep('QTY');
        simulateBotResponse("היי! כמה קוב בטון אתה צריך הפעם?", 'QTY');
        break;
    }
  };

  const handleMicClick = () => {
    if (isRecording) return;
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      addMessage("🎤 הודעה קולית (0:07)", 'user', 'audio');
      setIsTyping(true);
      
      setTimeout(() => {
        setIsTyping(false);
        setTempOrder(prev => ({
           ...prev,
           companyName: prev.companyName || 'לקוח לא מזוהה',
           siteContactName: prev.siteContactName || 'משתמש קולי',
           quantity: 12,
           grade: 'B30',
           address: 'דיזנגוף 50, תל אביב',
           deliveryTime: 'מחר בבוקר',
           pumpRequired: true
        }));
        setStep('CONFIRM');
        
        const summary = `
*זיהיתי מההקלטה:* 🎙️
כמות: 12 קוב
סוג: B30
כתובת: דיזנגוף 50, תל אביב
זמן: מחר בבוקר
משאבה: כן

האם אני צודק?
        `;
        addMessage(summary, 'bot');
        setShowQuickReplies([
          { label: '✅ כן, אשר', value: 'כן' },
          { label: '❌ לא, תקן', value: 'לא' }
        ]);
      }, 2000);
    }, 2500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] max-w-md mx-auto shadow-2xl border-x border-gray-200 overflow-hidden">
      {/* Simulation Toolbar */}
      <div className="bg-gray-800 p-2 text-white text-xs flex items-center justify-between gap-2" dir="rtl">
        <div className="flex items-center gap-2">
          <User size={14} />
          <span>מדמה שיחה מאת:</span>
        </div>
        <select 
          value={currentPersona.phone}
          onChange={(e) => setCurrentPersona(SIMULATION_PERSONAS.find(p => p.phone === e.target.value) || SIMULATION_PERSONAS[0])}
          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs outline-none focus:border-green-500"
        >
          {SIMULATION_PERSONAS.map(p => (
            <option key={p.phone} value={p.phone}>{p.label}</option>
          ))}
        </select>
        <button onClick={startConversation} className="p-1 hover:bg-gray-600 rounded" title="Restart Chat">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* WhatsApp Header */}
      <div className="bg-[#008069] text-white p-3 flex items-center shadow-md z-10" dir="rtl">
        <button onClick={onBack} className="ml-1 hover:bg-[#006d59] p-2 rounded-full">
          <ArrowRight size={24} />
        </button>
        <div className="flex items-center flex-1 cursor-pointer">
          <div className="relative">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#008069] ml-3 border border-gray-200">
                <Truck size={24} />
             </div>
             <div className="absolute bottom-0 left-3 w-3 h-3 bg-green-400 rounded-full border-2 border-[#008069]"></div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-base leading-tight">בטון סבאג - בוט הזמנות</h2>
            <p className="text-xs opacity-80 leading-tight">
               {isTyping ? 'מקליד/ה...' : 'עסקים (Business Account)'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 bg-[#E5DDD5] space-y-2"
        style={{ 
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', 
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-1`}
          >
            <div 
              className={`relative max-w-[85%] min-w-[80px] px-3 py-2 rounded-lg shadow-sm text-sm ${
                msg.sender === 'user' 
                  ? 'bg-[#D9FDD3] text-gray-900 rounded-tr-none' 
                  : 'bg-white text-gray-900 rounded-tl-none'
              }`}
            >
              {msg.type === 'audio' ? (
                 <div className="flex items-center gap-3 min-w-[150px]">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                       <Mic size={16} />
                    </div>
                    <div className="flex-1">
                       <div className="h-1 bg-gray-300 rounded w-full mb-1"></div>
                       <span className="text-xs text-gray-500">0:07</span>
                    </div>
                 </div>
              ) : (
                 <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              )}

              <div className="flex items-center justify-end gap-1 mt-1 select-none">
                <span className="text-[10px] text-gray-500">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'user' && (
                  <span className={`${msg.status === 'read' ? 'text-[#53bdeb]' : 'text-gray-400'}`}>
                    <CheckCheck size={14} strokeWidth={2} />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-white px-4 py-2 rounded-full rounded-tl-none shadow-sm text-gray-500 text-xs italic">
                מקליד...
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#F0F2F5] p-2">
        {showQuickReplies.length > 0 && (
           <div className="flex gap-2 overflow-x-auto pb-2 mb-1 scrollbar-hide px-1">
              {showQuickReplies.map((reply, idx) => (
                 <button
                    key={idx}
                    onClick={() => handleSend(reply.value)}
                    className="whitespace-nowrap bg-white border border-gray-200 text-[#008069] px-4 py-2 rounded-full text-sm font-medium shadow-sm active:bg-gray-50 transition-colors"
                 >
                    {reply.label}
                 </button>
              ))}
           </div>
        )}

        <div className="flex items-end gap-2">
           <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-2 shadow-sm border border-white focus-within:border-[#008069] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isRecording ? "מקליט..." : "הקלד הודעה"}
                disabled={isRecording}
                className="flex-1 bg-transparent focus:outline-none text-right text-gray-700 min-h-[24px] max-h-[100px]"
                dir="rtl"
              />
           </div>

           <button 
             onClick={input.trim() ? () => handleSend() : handleMicClick}
             className={`p-3 rounded-full shadow-md transition-all flex items-center justify-center ${
                input.trim() 
                   ? 'bg-[#008069] text-white hover:bg-[#006d59]' 
                   : isRecording 
                      ? 'bg-red-500 text-white animate-pulse scale-110' 
                      : 'bg-[#008069] text-white'
             }`}
           >
             {input.trim() ? (
                <Send size={20} className="transform rotate-180 ml-0.5" />
             ) : (
                <Mic size={20} />
             )}
           </button>
        </div>
      </div>
    </div>
  );
};
