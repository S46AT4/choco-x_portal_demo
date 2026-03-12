import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  Plus, 
  Bell, 
  Share2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Link as LinkIcon,
  X, 
  Trash2, 
  Edit2, 
  Download, 
  Repeat, 
  ExternalLink,
  PlusCircle, 
  MinusCircle,
  FileText,
  Image as ImageIcon,
  Info
} from 'lucide-react';

// 初期データ
const initialEvents = [
  { 
    id: '1', 
    category: '座談会', 
    title: '10月度 地区座談会', 
    date: '2026-10-25', 
    endDate: '2026-10-25',
    regType: 'single',
    repeatType: 'none',
    startTime: '19:00', 
    endTime: '20:30', 
    location: '〇〇会館', 
    remoteUrl: 'https://example.com/map',
    status: '確定', 
    memo: '歓喜あふれる座談会にしましょう！地区の友人にも声をかけてください。',
    notify: true
  },
  { 
    id: '2', 
    category: '唱題会', 
    title: 'ウィークリー唱題会', 
    date: '2026-10-01', 
    endDate: '2026-11-30', 
    regType: 'repeat',
    repeatType: 'weekly',
    startTime: '09:00', 
    endTime: '10:00', 
    location: 'オンライン', 
    remoteUrl: 'https://zoom.us/j/example',
    status: '確定', 
    memo: '毎週木曜日の開催です。同盟唱題で出発しましょう！',
    notify: false
  }
];

const CATEGORIES = ['座談会', '本部幹部会', '協議会', '唱題会', '御書学習会', 'その他'];
const STATUS_OPTIONS = ['未確定', '確定', '調整中', '中止'];
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const getStatusColor = (status) => {
  switch (status) {
    case '確定': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    case '未確定': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    case '調整中': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    case '中止': return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
  }
};

const getWeekday = (dateStr) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : WEEKDAYS[d.getDay()];
};

const isDateMatch = (event, checkDateStr) => {
  const checkDate = new Date(checkDateStr);
  const startDate = new Date(event.date);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  if (checkDate < startDate) return false;
  if (endDate && checkDate > endDate) return false;
  if (event.regType === 'period') return true; 
  if (event.regType === 'repeat') {
    if (event.repeatType === 'weekly') return checkDate.getDay() === startDate.getDay();
    if (event.repeatType === 'monthly') return checkDate.getDate() === startDate.getDate();
  }
  return event.date === checkDateStr;
};

export default function App() {
  const [events, setEvents] = useState(initialEvents);
  const [viewMode, setViewMode] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1));
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [prefilledDate, setPrefilledDate] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeDateDetails, setActiveDateDetails] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (eventData) => {
    if (Array.isArray(eventData)) {
      setEvents(prev => [...prev, ...eventData]);
    } else if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
    } else {
      setEvents(prev => [...prev, eventData]);
    }
    setIsRegisterModalOpen(false);
    setEditingEvent(null);
    setActiveDateDetails(null);
    showToast("保存しました");
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEventIds(prev => prev.filter(sid => sid !== id));
    setActiveDateDetails(null);
    showToast("削除しました");
  };

  const toggleEventSelection = (id) => {
    setSelectedEventIds(prev => 
      prev.includes(id) ? prev.filter(eventId => eventId !== id) : [...prev, id]
    );
  };

  const selectedSortedEvents = events
    .filter(e => selectedEventIds.includes(e.id))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-10">
      <nav className="bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 border-b border-cyan-500/30 sticky top-0 z-40 p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌺</span>
            <h1 className="text-xl font-bold text-cyan-50">Soka Portal</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-800/50 rounded-lg p-1 border border-cyan-500/20">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-cyan-600' : 'text-slate-400'}`}><List size={18}/></button>
              <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md ${viewMode === 'calendar' ? 'bg-cyan-600' : 'text-slate-400'}`}><CalendarIcon size={18}/></button>
            </div>
            <button onClick={() => { setEditingEvent(null); setPrefilledDate(''); setIsRegisterModalOpen(true); }} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 text-sm">
              <Plus size={18}/> <span className="hidden sm:inline">登録</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {selectedEventIds.length > 0 && (
          <div className="mb-6 bg-cyan-900/40 border border-cyan-400/50 rounded-2xl p-4 flex items-center justify-between animate-fade-in shadow-xl sticky top-20 z-30 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-500 text-slate-900 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">{selectedEventIds.length}</div>
              <span className="text-cyan-100 font-bold">選択中</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedEventIds([])} className="text-sm text-cyan-300 px-3 py-2 hover:bg-cyan-500/10 rounded-lg">クリア</button>
              <button onClick={() => setIsShareModalOpen(true)} className="bg-[#06C755] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg active:scale-95 transition-all">
                <Share2 size={18}/> LINEで共有
              </button>
            </div>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="space-y-4">
            {[...events].sort((a,b) => new Date(a.date) - new Date(b.date)).map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                isSelected={selectedEventIds.includes(event.id)}
                onSelect={() => toggleEventSelection(event.id)}
                onEdit={() => { setEditingEvent(event); setIsRegisterModalOpen(true); }}
                onDelete={() => deleteEvent(event.id)}
              />
            ))}
          </div>
        ) : (
          <CalendarView 
            events={events} 
            currentDate={currentDate} 
            onPrev={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            onNext={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            selectedIds={selectedEventIds}
            onToggleSelect={toggleEventSelection}
            onDateClick={(d) => {
               const dayEvents = events.filter(e => isDateMatch(e, d));
               if (dayEvents.length > 0) setActiveDateDetails({ date: d, events: dayEvents });
               else { setPrefilledDate(d); setEditingEvent(null); setIsRegisterModalOpen(true); }
            }}
          />
        )}
      </main>

      {/* 詳細・登録・共有モーダル */}
      {activeDateDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setActiveDateDetails(null)}>
          <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-700 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-cyan-400">{activeDateDetails.date} ({getWeekday(activeDateDetails.date)})</h3>
              <button onClick={() => setActiveDateDetails(null)} className="p-2 text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {activeDateDetails.events.map(event => (
                <div key={event.id} className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                   <div className="flex justify-between items-start mb-3">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(event.status)}`}>{event.status}</span>
                     <div className="flex gap-2">
                        <button onClick={() => { setEditingEvent(event); setIsRegisterModalOpen(true); }} className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => confirm('削除しますか？') && deleteEvent(event.id)} className="p-2 bg-rose-600/20 text-rose-400 rounded-lg"><Trash2 size={16}/></button>
                     </div>
                   </div>
                   <p className="font-bold text-lg mb-2">{event.title}</p>
                   <div className="text-sm text-slate-400 space-y-2">
                      <div className="flex items-center gap-2"><Clock size={14}/> {event.startTime} 〜 {event.endTime}</div>
                      <div className="flex items-center gap-2"><MapPin size={14}/> {event.location}</div>
                   </div>
                </div>
              ))}
              <button onClick={() => { setPrefilledDate(activeDateDetails.date); setEditingEvent(null); setIsRegisterModalOpen(true); }} className="w-full py-4 border border-dashed border-slate-600 rounded-xl text-cyan-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-cyan-400/5">
                <Plus size={18}/> 追加登録
              </button>
            </div>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <RegisterModal onClose={() => setIsRegisterModalOpen(false)} onSave={handleSave} initialData={editingEvent} prefilledDate={prefilledDate} />
      )}

      {isShareModalOpen && (
        <ShareModal events={selectedSortedEvents} onClose={() => setIsShareModalOpen(false)} />
      )}

      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-cyan-400 text-cyan-100 px-6 py-3 rounded-full shadow-2xl z-[100] animate-bounce-in text-sm font-bold">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isSelected, onSelect, onEdit, onDelete }) {
  const day = getWeekday(event.date);
  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 ${isSelected ? 'border-cyan-400 bg-cyan-900/20 shadow-xl' : 'border-slate-700 bg-slate-800'}`}>
      <div className="flex gap-4">
        <button onClick={onSelect} className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 hover:border-cyan-400'}`}>
          {isSelected && <Check size={16} className="text-slate-900" strokeWidth={4}/>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-900/50 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700">{event.category}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(event.status)}`}>{event.status}</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={onEdit} className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg"><Edit2 size={18}/></button>
              <button onClick={() => confirm('削除しますか？') && onDelete()} className="p-2 text-slate-400 hover:text-rose-400 rounded-lg"><Trash2 size={18}/></button>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-2 text-slate-100">{event.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Clock size={16} className="text-cyan-500"/> {event.date}({day}) {event.startTime}〜{event.endTime}</div>
            <div className="flex items-center gap-2"><MapPin size={16} className="text-cyan-500"/> {event.location || '（場所未定）'}</div>
          </div>
          {event.memo && <p className="mt-2 text-xs text-slate-500 italic border-l-2 border-slate-700 pl-2">{event.memo}</p>}
          {event.remoteUrl && (
            <div className="mt-3">
              <a href={event.remoteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-lg text-xs border border-blue-800/50">
                <LinkIcon size={14}/> リンクを開く <ExternalLink size={12}/>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ events, currentDate, onPrev, onNext, selectedIds, onToggleSelect, onDateClick }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between p-4 bg-slate-800/50">
        <button onClick={onPrev} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronLeft size={24}/></button>
        <h2 className="text-lg font-bold">{year}年 {month + 1}月</h2>
        <button onClick={onNext} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight size={24}/></button>
      </div>
      <div className="grid grid-cols-7 text-center py-2 text-[10px] font-bold text-slate-500 border-y border-slate-700 bg-slate-900/30">
        {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(100px,auto)]">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-900/10 border-r border-b border-slate-700/30"></div>;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events.filter(e => isDateMatch(e, ds));
          return (
            <div key={ds} onClick={() => onDateClick(ds)} className="p-1 border-r border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer transition-colors">
              <div className={`text-xs font-bold mb-1 px-1 ${idx % 7 === 0 ? 'text-rose-400' : idx % 7 === 6 ? 'text-blue-400' : 'text-slate-500'}`}>{day}</div>
              <div className="space-y-1">
                {dayEvents.map((e, eIdx) => (
                  <div key={`${e.id}-${ds}-${eIdx}`} className={`text-[9px] p-1 rounded border truncate ${selectedIds.includes(e.id) ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700/80 border-slate-600 text-slate-300'}`}>
                    {e.startTime} {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegisterModal({ onClose, onSave, initialData, prefilledDate }) {
  const [formData, setFormData] = useState(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    category: '座談会',
    title: '',
    date: prefilledDate || '',
    regType: 'single',
    startTime: '',
    endTime: '',
    location: '',
    remoteUrl: '',
    status: '確定',
    memo: ''
  });

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-800 border-t sm:border border-slate-600 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h2 className="font-bold text-cyan-400 flex items-center gap-2"><Plus size={20}/> 会合登録</h2>
          <button onClick={onClose} className="p-2 text-slate-400"><X size={24}/></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">会合名</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" placeholder="例：地区座談会" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">日付</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">開始</label>
                <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">終了</label>
                <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">カテゴリー</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">状況</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm outline-none">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">場所</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" placeholder="会館など" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">リンク</label>
              <input type="url" value={formData.remoteUrl} onChange={e => setFormData({...formData, remoteUrl: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none" placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">メモ</label>
              <textarea value={formData.memo} onChange={e => setFormData({...formData, memo: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none h-20" placeholder="持ち物など" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 text-slate-400 font-bold">キャンセル</button>
          <button onClick={() => onSave(formData)} className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg transition-all">保存</button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ events, onClose }) {
  const [msg, setMsg] = useState('会合日程を共有します。ご確認をお願いします。');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const canvasRef = useRef(null);

  const generateFullText = () => {
    let t = `🌺【会合日程共有】🌺\n${msg}\n\n`;
    events.forEach(e => {
      t += `■ ${e.date} (${getWeekday(e.date)})\n`;
      t += `  ${e.title} [${e.category} / ${e.status}]\n`;
      t += `  時間: ${e.startTime} 〜 ${e.endTime}\n`;
      t += `  場所: ${e.location || '（未定）'}\n`;
      if (e.remoteUrl) t += `  リンク: ${e.remoteUrl}\n`;
      if (e.memo) t += `  メモ: ${e.memo}\n`;
      t += `\n`;
    });
    t += `--------------------\n作成: Soka Portal`;
    return t;
  };

  useEffect(() => {
    if (activeTab === 'image' && canvasRef.current) drawCanvas();
  }, [activeTab, msg, events]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // スケーリング設定（高解像度化）
    const width = 800;
    const headerHeight = 180;
    const itemHeight = 240; // 情報を増やすため高さを拡張
    const footerHeight = 80;
    const height = headerHeight + (events.length * itemHeight) + footerHeight;
    
    canvas.width = width;
    canvas.height = height;

    // 背景
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // ヘッダー
    const grad = ctx.createLinearGradient(0, 0, width, 0);
    grad.addColorStop(0, '#1e3a8a');
    grad.addColorStop(1, '#134e4a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, headerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('🌺 会合スケジュール', 40, 80);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    // メッセージが長い場合の簡易改行処理
    const displayMsg = msg.length > 30 ? msg.substring(0, 28) + '...' : msg;
    ctx.fillText(displayMsg, 40, 135);

    // 各会合
    events.forEach((e, i) => {
      const y = headerHeight + (i * itemHeight) + 30;
      
      // カード背景
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(30, y - 10, width - 60, itemHeight - 20, 20);
      ctx.fill();
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 日付
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${e.date} (${getWeekday(e.date)})`, 60, y + 35);

      // カテゴリー & 状況
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath(); ctx.roundRect(400, y + 10, 100, 30, 5); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(e.category, 450, y + 31);

      const sCol = e.status === '確定' ? '#10b981' : '#f59e0b';
      ctx.fillStyle = sCol;
      ctx.beginPath(); ctx.roundRect(510, y + 10, 80, 30, 5); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(e.status, 550, y + 31);
      ctx.textAlign = 'left';

      // タイトル
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(e.title, 60, y + 85);

      // 情報アイコン付きテキスト
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`🕒 ${e.startTime} 〜 ${e.endTime}`, 60, y + 125);
      ctx.fillText(`📍 ${e.location || '未定'}`, 380, y + 125);
      
      // リンク
      if (e.remoteUrl) {
        ctx.fillStyle = '#60a5fa';
        const linkTxt = e.remoteUrl.length > 45 ? e.remoteUrl.substring(0, 42) + '...' : e.remoteUrl;
        ctx.fillText(`🔗 ${linkTxt}`, 60, y + 160);
      }

      // メモ
      if (e.memo) {
        ctx.fillStyle = '#64748b';
        ctx.font = 'italic 18px sans-serif';
        const memoTxt = e.memo.length > 40 ? e.memo.substring(0, 38) + '...' : e.memo;
        ctx.fillText(`📝 ${memoTxt}`, 60, y + 195);
      }
    });

    // フッター
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, height - 60, width, 60);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Soka Schedule Portal', width / 2, height - 25);
  };

  const handleCopyText = () => {
    const text = generateFullText();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.download = `Schedule_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-xl text-cyan-400">共有設定</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"><X size={24}/></button>
        </div>

        {/* メッセージ入力欄：タブに関係なく常に上に表示 */}
        <div className="px-5 pt-5 shrink-0">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 px-1">添えるメッセージ</label>
          <textarea 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50" 
            rows="2" 
            placeholder="例：今月の日程です！"
          />
        </div>

        <div className="flex bg-slate-800/50 p-1 m-5 rounded-xl border border-slate-700 shrink-0">
          <button onClick={() => setActiveTab('text')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <FileText size={18}/> テキスト表示
          </button>
          <button onClick={() => setActiveTab('image')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'image' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400'}`}>
            <ImageIcon size={18}/> 画像カード
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {activeTab === 'text' ? (
            <div className="animate-fade-in">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 px-1">コピー内容プレビュー</label>
              <div className="bg-black/40 rounded-2xl p-5 border border-slate-800 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                {generateFullText()}
              </div>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2 w-full px-1">生成された画像（全情報表示）</label>
              <div className="rounded-2xl border border-slate-800 overflow-hidden bg-black/20 shadow-2xl">
                <canvas ref={canvasRef} className="max-w-full h-auto" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-amber-400/80 bg-amber-400/10 px-4 py-2 rounded-lg border border-amber-400/20">
                <Info size={14}/>
                <span className="text-[11px] font-bold">画像を保存してLINEに貼り付けてください</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-slate-800 bg-slate-900/80 shrink-0">
          <button 
            onClick={activeTab === 'text' ? handleCopyText : handleDownloadImage} 
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${copied ? 'bg-emerald-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
          >
            {copied ? <Check size={20}/> : activeTab === 'text' ? <Copy size={20}/> : <Download size={20}/>}
            {copied ? (activeTab === 'text' ? 'コピーしました！' : '保存しました！') : (activeTab === 'text' ? 'テキストをコピーする' : '画像をダウンロードする')}
          </button>
        </div>
      </div>
    </div>
  );
}