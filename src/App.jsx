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
  Layers,
  PlusCircle,
  MinusCircle
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
    remoteUrl: '',
    status: '確定', 
    memo: '歓喜あふれる座談会にしましょう！',
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
  return WEEKDAYS[d.getDay()];
};

const isDateMatch = (event, checkDateStr) => {
  const checkDate = new Date(checkDateStr);
  const startDate = new Date(event.date);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  if (checkDate < startDate) return false;
  if (endDate && checkDate > endDate) return false;

  if (event.regType === 'period') {
    return true; 
  } else if (event.regType === 'repeat') {
    if (event.repeatType === 'weekly') return checkDate.getDay() === startDate.getDay();
    if (event.repeatType === 'monthly') return checkDate.getDate() === startDate.getDate();
    if (event.repeatType === 'yearly') return checkDate.getMonth() === startDate.getMonth() && checkDate.getDate() === startDate.getDate();
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

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (eventData) => {
    if (Array.isArray(eventData)) {
      setEvents(prev => [...prev, ...eventData]);
      showToast(`${eventData.length}件の会合を登録しました`);
    } else if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
      showToast("会合を更新しました");
    } else {
      setEvents(prev => [...prev, eventData]);
      showToast("会合を登録しました");
    }
    setIsRegisterModalOpen(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEventIds(prev => prev.filter(sid => sid !== id));
    showToast(`会合を削除しました。`);
  };

  const toggleEventSelection = (id) => {
    setSelectedEventIds(prev => 
      prev.includes(id) ? prev.filter(eventId => eventId !== id) : [...prev, id]
    );
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setIsRegisterModalOpen(true);
  };

  const selectedSortedEvents = events
    .filter(e => selectedEventIds.includes(e.id))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 border-b border-cyan-500/30 sticky top-0 z-40 p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌺</span>
            <h1 className="text-xl font-bold text-cyan-50">Soka Schedule Portal</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-800/50 rounded-lg p-1 border border-cyan-500/20">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-cyan-600' : 'text-slate-400'}`}><List size={18}/></button>
              <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md ${viewMode === 'calendar' ? 'bg-cyan-600' : 'text-slate-400'}`}><CalendarIcon size={18}/></button>
            </div>
            <button onClick={() => { setEditingEvent(null); setPrefilledDate(''); setIsRegisterModalOpen(true); }} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-1 shadow-lg shadow-cyan-500/20">
              <Plus size={18}/> 登録
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {selectedEventIds.length > 0 && (
          <div className="mb-6 bg-cyan-900/40 border border-cyan-400/50 rounded-xl p-4 flex items-center justify-between animate-fade-in shadow-xl">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-900 font-bold px-2 py-0.5 rounded-full text-xs">{selectedEventIds.length}</span>
              <span className="text-cyan-100 font-medium">件選択中</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedEventIds([])} className="text-xs text-cyan-300 px-3 py-2 hover:bg-cyan-500/10 rounded-lg">クリア</button>
              <button onClick={() => setIsShareModalOpen(true)} className="bg-[#06C755] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-lg active:scale-95 transition-transform">
                <Share2 size={16}/> LINE共有
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
                onEdit={() => startEdit(event)}
                onDelete={() => deleteEvent(event.id)}
              />
            ))}
            {events.length === 0 && (
              <div className="text-center py-20 bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
                <p className="text-slate-500">登録された会合はありません</p>
              </div>
            )}
          </div>
        ) : (
          <CalendarView 
            events={events} 
            currentDate={currentDate} 
            onPrev={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            onNext={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            selectedIds={selectedEventIds}
            onToggleSelect={toggleEventSelection}
            onDateClick={(d) => { setPrefilledDate(d); setEditingEvent(null); setIsRegisterModalOpen(true); }}
            onEdit={startEdit}
            onDelete={deleteEvent}
          />
        )}
      </main>

      {isRegisterModalOpen && (
        <RegisterModal 
          onClose={() => setIsRegisterModalOpen(false)} 
          onSave={handleSave}
          initialData={editingEvent}
          prefilledDate={prefilledDate}
        />
      )}

      {isShareModalOpen && (
        <ShareModal 
          events={selectedSortedEvents}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-cyan-400 text-cyan-100 px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isSelected, onSelect, onEdit, onDelete }) {
  const day = getWeekday(event.date);
  const isRecurring = event.regType === 'repeat' || event.regType === 'period';

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${isSelected ? 'border-cyan-400 bg-cyan-900/20 shadow-lg' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
      <div className="flex gap-4">
        <button onClick={onSelect} className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 hover:border-cyan-400'}`}>
          {isSelected && <Check size={14} className="text-slate-900" strokeWidth={4}/>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-900/50 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700 uppercase">{event.category}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(event.status)}`}>{event.status}</span>
              {isRecurring && <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1"><Repeat size={10}/> 繰り返し/期間</span>}
              {event.notify && <Bell size={12} className="text-amber-400 ml-1"/>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={onEdit} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"><Edit2 size={16}/></button>
              <button onClick={() => confirm('削除しますか？') && onDelete()} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-3 text-slate-100">{event.title}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Clock size={14} className="text-cyan-500"/> {event.date}({day}) {event.startTime} 〜 {event.endTime || ''}</div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-500"/> {event.location || '（場所未定）'}</div>
            {event.remoteUrl && (
              <div className="sm:col-span-2">
                <a href={event.remoteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1 rounded-md text-xs border border-blue-800/50 transition-colors">
                  <LinkIcon size={12}/> リモート用リンクを開く <ExternalLink size={10}/>
                </a>
              </div>
            )}
          </div>
          
          {event.memo && (
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-xs text-slate-400 italic whitespace-pre-wrap leading-relaxed">
              {event.memo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarView({ events, currentDate, onPrev, onNext, selectedIds, onToggleSelect, onDateClick, onEdit, onDelete }) {
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
        <button onClick={onPrev} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronLeft/></button>
        <h2 className="text-lg font-bold">{year}年 {month + 1}月</h2>
        <button onClick={onNext} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight/></button>
      </div>
      <div className="grid grid-cols-7 text-center py-2 text-xs font-bold text-slate-500 border-y border-slate-700 bg-slate-900/30">
        {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(110px,auto)]">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-900/10 border-r border-b border-slate-700/30"></div>;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events.filter(e => isDateMatch(e, ds));
          
          return (
            <div key={ds} onClick={() => onDateClick(ds)} className="p-1 border-r border-b border-slate-700/30 min-h-[110px] hover:bg-slate-700/20 cursor-pointer group transition-colors relative">
              <div className={`text-xs font-bold mb-1 px-1 ${idx % 7 === 0 ? 'text-rose-400' : idx % 7 === 6 ? 'text-blue-400' : 'text-slate-500'}`}>{day}</div>
              <div className="space-y-1">
                {dayEvents.map(e => (
                  <div key={`${e.id}-${ds}`} 
                    onClick={(ev) => { ev.stopPropagation(); onToggleSelect(e.id); }} 
                    className={`group/item text-[10px] p-1 rounded border truncate flex items-center justify-between gap-1 transition-all ${selectedIds.includes(e.id) ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg z-10' : 'bg-slate-700 border-slate-600 text-slate-300'}`}>
                    <div className="flex items-center gap-1 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.status === '確定' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                      <span className="truncate">{e.startTime} {e.title}</span>
                    </div>
                    <div className="hidden group-hover/item:flex items-center gap-0.5 bg-slate-800/80 rounded px-1 shrink-0 ml-1">
                      <button onClick={(ev) => { ev.stopPropagation(); onEdit(e); }} className="p-0.5 text-cyan-400 hover:text-white transition-colors">
                        <Edit2 size={10}/>
                      </button>
                      <button onClick={(ev) => { ev.stopPropagation(); confirm('削除しますか？') && onDelete(e.id); }} className="p-0.5 text-rose-400 hover:text-white transition-colors">
                        <Trash2 size={10}/>
                      </button>
                    </div>
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
  const createEmptyForm = () => ({
    id: Math.random().toString(36).substr(2, 9),
    category: '座談会',
    title: '',
    date: prefilledDate || '',
    endDate: '',
    regType: 'single',
    repeatType: 'none',
    startTime: '',
    endTime: '',
    location: '',
    remoteUrl: '',
    status: '未確定',
    memo: '',
    notify: true
  });

  const [formList, setFormList] = useState(
    initialData ? [{ ...initialData }] : [createEmptyForm()]
  );

  const updateForm = (index, field, value) => {
    const newList = [...formList];
    newList[index] = { ...newList[index], [field]: value };
    setFormList(newList);
  };

  const addNewForm = () => {
    setFormList([...formList, createEmptyForm()]);
  };

  const removeForm = (index) => {
    if (formList.length <= 1) return;
    setFormList(formList.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      onSave(formList[0]);
    } else {
      onSave(formList);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl w-full max-w-2xl shadow-2xl animate-slide-up overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-900 to-cyan-900 shrink-0">
          <h2 className="font-bold flex items-center gap-2 text-cyan-50">
            {initialData ? <Edit2 size={18} className="text-cyan-400"/> : <Plus size={18} className="text-cyan-400"/>}
            {initialData ? '会合情報を編集' : '新しい会合を登録'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
            {formList.map((formData, index) => (
              <div key={formData.id} className={`space-y-5 relative ${index > 0 ? 'pt-8 border-t border-slate-700/50' : ''}`}>
                {!initialData && formList.length > 1 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                      会合 #{index + 1}
                    </span>
                    <button type="button" onClick={() => removeForm(index)} className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs font-bold transition-colors">
                      <MinusCircle size={14}/> この件を削除
                    </button>
                  </div>
                )}

                <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border border-slate-700 w-fit">
                  {[
                    { id: 'single', label: '単発' },
                    { id: 'period', label: '期間指定' },
                    { id: 'repeat', label: '繰り返し' }
                  ].map(type => (
                    <button key={type.id} type="button" onClick={() => updateForm(index, 'regType', type.id)} 
                      className={`px-4 py-1.5 text-xs font-bold rounded transition-all ${formData.regType === type.id ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                      {type.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">会合名 *</label>
                      <input required type="text" value={formData.title} onChange={e => updateForm(index, 'title', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none transition-colors" placeholder="例：ブロック座談会" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{formData.regType === 'period' ? '開始日' : '日付'}</label>
                        <input required type="date" value={formData.date} onChange={e => updateForm(index, 'date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none" />
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">終了日（任意）</label>
                         <input type="date" value={formData.endDate} min={formData.date} onChange={e => updateForm(index, 'endDate', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">開始時間</label>
                        <input required type="time" value={formData.startTime} onChange={e => updateForm(index, 'startTime', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">終了時間</label>
                        <input required type="time" value={formData.endTime} onChange={e => updateForm(index, 'endTime', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">カテゴリー</label>
                        <select value={formData.category} onChange={e => updateForm(index, 'category', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">確定度</label>
                         <select value={formData.status} onChange={e => updateForm(index, 'status', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none">
                           {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">場所</label>
                      <input type="text" value={formData.location} onChange={e => updateForm(index, 'location', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none transition-colors" placeholder="会館名、オンライン等" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-1"><LinkIcon size={10}/> リモート用リンク（Zoom等）</label>
                      <input type="url" value={formData.remoteUrl} onChange={e => updateForm(index, 'remoteUrl', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none transition-colors" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">備考</label>
                      <textarea rows="2" value={formData.memo} onChange={e => updateForm(index, 'memo', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none resize-none transition-colors" placeholder="注意事項など" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!initialData && (
              <button 
                type="button" 
                onClick={addNewForm} 
                className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
              >
                <PlusCircle size={20} className="group-hover:scale-110 transition-transform"/>
                <span className="font-bold text-sm">別の会合情報を追加する</span>
              </button>
            )}
          </div>

          <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              {!initialData && `合計: ${formList.length} 件`}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold px-4 py-2 transition-colors">キャンセル</button>
              <button type="submit" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-10 py-3 rounded-xl font-bold text-sm shadow-xl shadow-cyan-900/40 active:scale-[0.98] transition-all">
                {initialData ? '更新を保存' : `${formList.length}件をまとめて登録`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShareModal({ events, onClose }) {
  const [activeTab, setActiveTab] = useState('text');
  const [msg, setMsg] = useState('お疲れ様です！会合日程を共有します。');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  const generateFullText = () => {
    let t = `🌺【スケジュール共有】🌺\n${msg}\n\n`;
    events.forEach(e => {
      const day = getWeekday(e.date);
      t += `■ ${e.date} (${day})\n`;
      t += `  件名: ${e.title}\n`;
      t += `  時間: ${e.startTime} 〜 ${e.endTime || ''}\n`;
      t += `  カテゴリ: ${e.category}\n`;
      t += `  状況: ${e.status}\n`;
      t += `  場所: ${e.location || '未定'}\n`;
      if (e.remoteUrl) t += `  リンク: ${e.remoteUrl}\n`;
      if (e.memo) t += `  備考: ${e.memo}\n`;
      t += `\n`;
    });
    return t + `ご確認よろしくお願いします。`;
  };

  const drawImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 600;
    const itemHeight = 180; 
    const h = 150 + (events.length * itemHeight);
    canvas.width = w; canvas.height = h;

    ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0,0,w,90);
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('🌺 スケジュール一覧 🌺', w/2, 55);

    events.forEach((e, i) => {
      const y = 110 + (i * itemHeight);
      ctx.fillStyle = '#1e3a8a33'; ctx.beginPath(); ctx.roundRect(20, y, w-40, itemHeight - 20, 12); ctx.fill();
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.stroke();
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${e.date} (${getWeekday(e.date)}) ${e.startTime}〜${e.endTime || ''}`, 45, y + 40);
      
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 20px sans-serif';
      ctx.fillText(e.title, 45, y + 75);
      
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
      ctx.fillText(`[${e.category}] 状況: ${e.status} | 📍 ${e.location || '未定'}`, 45, y + 100);
      
      if (e.remoteUrl) {
        ctx.fillStyle = '#60a5fa'; ctx.fillText(`🔗 ${e.remoteUrl}`, 45, y + 120);
      }
      
      if (e.memo) {
        ctx.fillStyle = '#64748b'; ctx.font = 'italic 11px sans-serif';
        const memo = e.memo.length > 50 ? e.memo.substring(0, 50) + '...' : e.memo;
        ctx.fillText(`Note: ${memo}`, 45, y + 145);
      }
    });
  };

  useEffect(() => { if (activeTab === 'image') drawImage(); }, [activeTab, events, msg]);

  const handleCopy = () => {
    const text = generateFullText();
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold flex items-center gap-2 text-cyan-400"><Share2 size={18}/> 共有データの作成</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">メッセージ</label>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50" rows="2" />
          </div>

           <div className="flex bg-slate-800 p-1 rounded-lg">
            <button onClick={() => setActiveTab('text')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${activeTab === 'text' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>テキスト形式</button>
            <button onClick={() => setActiveTab('image')} className={`flex-1 py-2 text-xs font-bold rounded transition-all ${activeTab === 'image' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>画像形式</button>
          </div>
          
          <div className="bg-black/40 rounded-xl p-4 min-h-[150px] max-h-[40vh] overflow-y-auto custom-scrollbar border border-slate-800">
            {activeTab === 'text' ? (
              <pre className="text-[11px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">
                {generateFullText()}
              </pre>
            ) : (
              <div className="flex justify-center py-2">
                <canvas ref={canvasRef} className="max-w-full h-auto rounded border border-slate-700 shadow-lg" />
              </div>
            )}
          </div>

          <button onClick={activeTab === 'text' ? handleCopy : () => {
            const link = document.createElement('a');
            link.download = `SokaSchedule_${new Date().getTime()}.png`;
            link.href = canvasRef.current.toDataURL();
            link.click();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${copied ? 'bg-emerald-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>
            {copied ? <Check size={20}/> : activeTab === 'text' ? <Copy size={20}/> : <Download size={20}/>}
            {copied ? (activeTab === 'text' ? 'コピー完了！' : '保存完了！') : (activeTab === 'text' ? 'テキストをコピーして共有' : '画像をダウンロード保存')}
          </button>
        </div>
      </div>
    </div>
  );
}