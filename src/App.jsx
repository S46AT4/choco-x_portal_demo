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
const REPEAT_OPTIONS = [
  { id: 'weekly', label: '毎週' },
  { id: 'monthly', label: '毎月' },
  { id: 'yearly', label: '毎年' }
];

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
  const [activeDateDetails, setActiveDateDetails] = useState(null);

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
    setActiveDateDetails(null);
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEventIds(prev => prev.filter(sid => sid !== id));
    showToast(`会合を削除しました。`);
    setActiveDateDetails(null);
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
      <nav className="bg-gradient-to-r from-blue-900 via-cyan-900 to-teal-900 border-b border-cyan-500/30 sticky top-0 z-40 p-3 sm:p-4 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xl sm:text-2xl">🌺</span>
            <h1 className="text-base sm:text-xl font-bold text-cyan-50">Soka Portal</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="flex bg-slate-800/50 rounded-lg p-0.5 sm:p-1 border border-cyan-500/20">
              <button onClick={() => setViewMode('list')} className={`p-1.5 sm:p-2 rounded-md ${viewMode === 'list' ? 'bg-cyan-600' : 'text-slate-400'}`}><List size={16}/></button>
              <button onClick={() => setViewMode('calendar')} className={`p-1.5 sm:p-2 rounded-md ${viewMode === 'calendar' ? 'bg-cyan-600' : 'text-slate-400'}`}><CalendarIcon size={16}/></button>
            </div>
            <button onClick={() => { setEditingEvent(null); setPrefilledDate(''); setIsRegisterModalOpen(true); }} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold flex items-center gap-1 shadow-lg shadow-cyan-500/20 text-sm">
              <Plus size={16}/> <span className="hidden sm:inline">登録</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {selectedEventIds.length > 0 && (
          <div className="mb-6 bg-cyan-900/40 border border-cyan-400/50 rounded-xl p-3 sm:p-4 flex items-center justify-between animate-fade-in shadow-xl sticky top-20 z-30 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-900 font-bold px-2 py-0.5 rounded-full text-xs">{selectedEventIds.length}</span>
              <span className="text-cyan-100 font-medium text-sm">選択中</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedEventIds([])} className="text-xs text-cyan-300 px-2 py-2 hover:bg-cyan-500/10 rounded-lg">クリア</button>
              <button onClick={() => setIsShareModalOpen(true)} className="bg-[#06C755] text-white px-3 sm:px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs sm:text-sm shadow-lg active:scale-95 transition-transform">
                <Share2 size={16}/> LINE
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
            onDateClick={(d) => {
               const dayEvents = events.filter(e => isDateMatch(e, d));
               if (dayEvents.length > 0) {
                 setActiveDateDetails({ date: d, events: dayEvents });
               } else {
                 setPrefilledDate(d); setEditingEvent(null); setIsRegisterModalOpen(true);
               }
            }}
          />
        )}
      </main>

      {/* 日付詳細モーダル */}
      {activeDateDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setActiveDateDetails(null)}>
          <div className="bg-slate-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl border-t sm:border border-slate-700 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-cyan-400">{activeDateDetails.date} ({getWeekday(activeDateDetails.date)})</h3>
              <button onClick={() => setActiveDateDetails(null)} className="p-2 text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {activeDateDetails.events.map(event => (
                <div key={event.id} className="bg-slate-700/50 p-3 rounded-xl border border-slate-600">
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(event.status)}`}>{event.status}</span>
                     <div className="flex gap-2">
                        <button onClick={() => { setEditingEvent(event); setIsRegisterModalOpen(true); }} className="p-2 bg-cyan-600/20 text-cyan-400 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => confirm('削除しますか？') && deleteEvent(event.id)} className="p-2 bg-rose-600/20 text-rose-400 rounded-lg"><Trash2 size={16}/></button>
                     </div>
                   </div>
                   <p className="font-bold mb-2">{event.title}</p>
                   <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1"><Clock size={12}/> {event.startTime} 〜 {event.endTime}</div>
                      <div className="flex items-center gap-1"><MapPin size={12}/> {event.location}</div>
                   </div>
                </div>
              ))}
              <button 
                onClick={() => { setPrefilledDate(activeDateDetails.date); setEditingEvent(null); setIsRegisterModalOpen(true); }}
                className="w-full py-3 border border-dashed border-slate-600 rounded-xl text-cyan-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-cyan-400/5"
              >
                <Plus size={16}/> 追加登録
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-cyan-400 text-cyan-100 px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce-in text-sm">
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
    <div className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 ${isSelected ? 'border-cyan-400 bg-cyan-900/20 shadow-lg' : 'border-slate-700 bg-slate-800'}`}>
      <div className="flex gap-3 sm:gap-4">
        <button onClick={onSelect} className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500 hover:border-cyan-400'}`}>
          {isSelected && <Check size={14} className="text-slate-900" strokeWidth={4}/>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span className="bg-blue-900/50 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-700 uppercase">{event.category}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(event.status)}`}>{event.status}</span>
              {isRecurring && <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded flex items-center gap-1"><Repeat size={10}/> {event.repeatType === 'weekly' ? '毎週' : '頻度'}</span>}
              {event.notify && <Bell size={12} className="text-amber-400 ml-1"/>}
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={onEdit} className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg"><Edit2 size={16}/></button>
              <button onClick={() => confirm('削除しますか？') && onDelete()} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold mb-2 text-slate-100">{event.title}</h3>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-y-2 gap-x-6 text-[13px] sm:text-sm text-slate-400">
            <div className="flex items-center gap-2"><Clock size={14} className="text-cyan-500 shrink-0"/> {event.date}({day}) {event.startTime} 〜 {event.endTime || ''}</div>
            <div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-500 shrink-0"/> {event.location || '（場所未定）'}</div>
            {event.remoteUrl && (
              <div className="mt-1 sm:mt-0 w-full">
                <a href={event.remoteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-900/20 px-3 py-1.5 rounded-md text-[11px] sm:text-xs border border-blue-800/50">
                  <LinkIcon size={12}/> リンクを開く <ExternalLink size={10}/>
                </a>
              </div>
            )}
          </div>
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
      <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-800/50">
        <button onClick={onPrev} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronLeft size={20}/></button>
        <h2 className="text-base sm:text-lg font-bold">{year}年 {month + 1}月</h2>
        <button onClick={onNext} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><ChevronRight size={20}/></button>
      </div>
      <div className="grid grid-cols-7 text-center py-2 text-[10px] font-bold text-slate-500 border-y border-slate-700 bg-slate-900/30">
        {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(60px,auto)] sm:auto-rows-[minmax(110px,auto)]">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-900/10 border-r border-b border-slate-700/30"></div>;
          const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events.filter(e => isDateMatch(e, ds));
          
          return (
            <div key={ds} onClick={() => onDateClick(ds)} className="p-0.5 sm:p-1 border-r border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer transition-colors relative">
              <div className={`text-[10px] sm:text-xs font-bold mb-1 px-1 ${idx % 7 === 0 ? 'text-rose-400' : idx % 7 === 6 ? 'text-blue-400' : 'text-slate-500'}`}>{day}</div>
              <div className="space-y-0.5">
                {dayEvents.map((e, eIdx) => (
                  <div key={`${e.id}-${ds}-${eIdx}`} 
                    className={`text-[8px] sm:text-[10px] p-0.5 sm:p-1 rounded border truncate flex items-center justify-between gap-1 ${selectedIds.includes(e.id) ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-700/80 border-slate-600 text-slate-300'}`}>
                    <span className="truncate">{e.startTime} {e.title}</span>
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
    if (field === 'regType' && value === 'single') newList[index].repeatType = 'none';
    if (field === 'regType' && value === 'repeat' && newList[index].repeatType === 'none') newList[index].repeatType = 'weekly';
    setFormList(newList);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(initialData ? formList[0] : formList);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-slate-800 border-t sm:border border-slate-600 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-blue-900 to-cyan-900 shrink-0">
          <h2 className="font-bold flex items-center gap-2 text-cyan-50">
            {initialData ? <Edit2 size={18}/> : <Plus size={18}/>}
            {initialData ? '会合情報を編集' : '新しい会合を登録'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X size={24}/></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {formList.map((formData, index) => (
              <div key={formData.id} className={`space-y-4 ${index > 0 ? 'pt-6 border-t border-slate-700/50' : ''}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 w-fit">
                    {['single', 'period', 'repeat'].map(type => (
                      <button key={type} type="button" onClick={() => updateForm(index, 'regType', type)} 
                        className={`px-3 py-1.5 text-[11px] font-bold rounded transition-all ${formData.regType === type ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>
                        {type === 'single' ? '単発' : type === 'period' ? '期間' : '頻度'}
                      </button>
                    ))}
                  </div>
                  {formData.regType === 'repeat' && (
                    <div className="flex gap-1 p-1 bg-slate-900 rounded-lg border border-cyan-500/30">
                      {REPEAT_OPTIONS.map(opt => (
                        <button key={opt.id} type="button" onClick={() => updateForm(index, 'repeatType', opt.id)}
                          className={`px-2.5 py-1.5 text-[10px] font-bold rounded transition-all ${formData.repeatType === opt.id ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {!initialData && formList.length > 1 && (
                    <button type="button" onClick={() => setFormList(formList.filter((_, i) => i !== index))} className="ml-auto text-rose-400 hover:text-rose-300 p-1">
                      <MinusCircle size={20}/>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">会合名 *</label>
                      <input required type="text" value={formData.title} onChange={e => updateForm(index, 'title', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none transition-colors" placeholder="例：地区座談会" />
                    </div>

                    <div className={`grid ${formData.regType === 'single' ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                      <div className="min-w-0">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 truncate">日付</label>
                        <input required type="date" value={formData.date} onChange={e => updateForm(index, 'date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-2.5 text-[13px] outline-none appearance-none" />
                      </div>
                      {formData.regType !== 'single' && (
                        <div className="min-w-0">
                           <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 truncate">終了日（任意）</label>
                           <input type="date" value={formData.endDate} min={formData.date} onChange={e => updateForm(index, 'endDate', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-2.5 text-[13px] outline-none appearance-none" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 truncate">開始時間</label>
                        <input required type="time" value={formData.startTime} onChange={e => updateForm(index, 'startTime', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-2.5 text-[13px] outline-none" />
                      </div>
                      <div className="min-w-0">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 truncate">終了時間</label>
                        <input required type="time" value={formData.endTime} onChange={e => updateForm(index, 'endTime', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 sm:p-2.5 text-[13px] outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">カテゴリー</label>
                        <select value={formData.category} onChange={e => updateForm(index, 'category', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                         <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">状況</label>
                         <select value={formData.status} onChange={e => updateForm(index, 'status', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm outline-none">
                           {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">場所</label>
                      <input type="text" value={formData.location} onChange={e => updateForm(index, 'location', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none" placeholder="会館、Zoom等" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1"><LinkIcon size={10}/> リンク</label>
                      <input type="url" value={formData.remoteUrl} onChange={e => updateForm(index, 'remoteUrl', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!initialData && (
              <button type="button" onClick={() => setFormList([...formList, createEmptyForm()])} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 hover:border-cyan-500 transition-all">
                <PlusCircle size={20}/> <span className="font-bold text-sm">別の会合を追加</span>
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end items-center gap-3 shrink-0">
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold px-3 py-2">取消</button>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 sm:px-12 py-2.5 sm:py-3 rounded-xl font-bold text-sm shadow-xl transition-all">
              {/* ボタンの文言を「一括登録」から「保存」または「登録」に変更 */}
              {initialData ? '保存' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShareModal({ events, onClose }) {
  const [msg, setMsg] = useState('会合日程を共有します。');
  const [copied, setCopied] = useState(false);

  const generateFullText = () => {
    let t = `🌺【スケジュール】🌺\n${msg}\n\n`;
    events.forEach(e => {
      t += `■ ${e.date} (${getWeekday(e.date)})\n  ${e.title}\n  ${e.startTime} 〜 ${e.endTime}\n  場所: ${e.location || '未定'}\n\n`;
    });
    return t;
  };

  const handleCopy = () => {
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

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-cyan-400">共有テキストの作成</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white"><X size={24}/></button>
        </div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-cyan-500/50" rows="2" />
        <div className="bg-black/40 rounded-xl p-4 max-h-[40vh] overflow-y-auto border border-slate-800 text-[11px] text-slate-400 font-mono whitespace-pre-wrap">
          {generateFullText()}
        </div>
        <button onClick={handleCopy} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-600' : 'bg-cyan-600 hover:bg-cyan-500'}`}>
          {copied ? <Check size={20}/> : <Copy size={20}/>}
          {copied ? 'コピー完了！' : 'コピーして共有'}
        </button>
      </div>
    </div>
  );
}