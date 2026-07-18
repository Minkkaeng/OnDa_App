import { create } from 'zustand';
import { db, seedDatabase, type Pet, type CalendarEvent } from '../db';

export interface CustomDialog {
  isOpen: boolean;
  type: 'alert' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    background: string;
    paper: string;
    text: string;
    muted: string;
  };
}

export interface CustomReminder {
  id: string;
  title: string;
  time: string;
  petId: string;
  enabled: boolean;
}

export interface BackupSnapshot {
  id: string;
  name: string;
  createdAt: string;
  pets: Pet[];
  calendarEvents: CalendarEvent[];
}

export interface Inquiry {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  status: '답변대기' | '답변완료';
  reply?: string;
}

interface PetState {
  pets: Pet[];
  activePetId: string | null;
  events: CalendarEvent[];
  loading: boolean;
  loadAllData: () => Promise<void>;
  setActivePetId: (id: string | null) => void;
  addPet: (pet: Omit<Pet, 'id'>) => Promise<Pet>;
  updatePet: (pet: Pet) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  updateCalendarEvent: (event: CalendarEvent) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  setPets: (pets: Pet[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  
  isGlobalTourActive: boolean;
  setGlobalTourActive: (active: boolean) => void;
  globalTourStep: number;
  setGlobalTourStep: (step: number) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;

  // Custom Dialog
  customDialog: CustomDialog;
  showAlert: (message: string, title?: string, onConfirm?: () => void) => void;
  showConfirm: (message: string, title?: string, onConfirm?: () => void, onCancel?: () => void) => void;
  closeDialog: () => void;

  // Themes
  activeThemeId: string;
  customThemes: CustomTheme[];
  setThemeId: (id: string) => void;
  addCustomTheme: (theme: Omit<CustomTheme, 'id'>) => void;
  updateCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (id: string) => void;

  // Reminders
  customReminders: CustomReminder[];
  addCustomReminder: (reminder: Omit<CustomReminder, 'id' | 'enabled'>) => void;
  updateCustomReminder: (reminder: CustomReminder) => void;
  deleteCustomReminder: (id: string) => void;

  // Snapshots
  backupSnapshots: BackupSnapshot[];
  addBackupSnapshot: (name: string) => Promise<void>;
  updateBackupSnapshot: (id: string, name: string) => void;
  deleteBackupSnapshot: (id: string) => void;
  restoreBackupSnapshot: (id: string) => Promise<void>;

  // Inquiries
  inquiries: Inquiry[];
  addInquiry: (title: string, category: string, content: string) => void;
  updateInquiry: (inquiry: Inquiry) => void;
  deleteInquiry: (id: string) => void;

  // Walk Tracker (Global)
  walkState: 'idle' | 'running' | 'paused';
  walkElapsedSec: number;
  walkTargetMin: number;
  setWalkState: (state: 'idle' | 'running' | 'paused') => void;
  setWalkElapsedSec: (sec: number | ((prev: number) => number)) => void;
  setWalkTargetMin: (min: number) => void;
}

const mockPet: Pet = {
  id: 'mock-pet',
  name: '초코',
  breed: '토이 푸들',
  birth: '2023-05-10',
  weight: 4.5,
  image: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" fill="%2314C3A3"/><text x="50" y="55" font-family="sans-serif" font-size="20" fill="white" text-anchor="middle" font-weight="bold">Choco</text></svg>',
  allergies: '만성 안구 건조증, 알레르기 피부염 주의',
  medications: '심장사상충 예방약 1개월 단위 반복 세팅',
  notes: '산책 설정: 오후 07:00 지정 / 30분 정기 목표 설정',
  walkTime: '오후 07:00 지정',
  walkGoal: '30분 정기 목표 설정'
};

const mockEvents: CalendarEvent[] = [
  {
    id: 'mock-evt-1',
    petId: 'mock-pet',
    date: new Date().toISOString().split('T')[0],
    type: 'diary',
    title: '동네 공원 산책 다녀왔어요!',
    content: '오늘 날씨가 화창해서 근처 공원으로 30분 동안 산책을 다녀왔습니다. 초코도 무척 즐거워하며 뛰어다녔네요.',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=250&auto=format&fit=crop'
  },
  {
    id: 'mock-evt-2',
    petId: 'mock-pet',
    date: new Date().toISOString().split('T')[0],
    type: 'hospital',
    title: '정기 종합 백신 및 광견병 접종 예약',
    content: '동물병원 예약일. 오전 10시에 방문하여 예방접종 진행 예정.'
  }
];

const loadFromLS = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return data as unknown as T;
  }
};

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  activePetId: null,
  events: [],
  loading: true,
  isGlobalTourActive: false,
  globalTourStep: 0,
  showSplash: true,
  setShowSplash: (show) => set({ showSplash: show }),

  // Custom Dialog State
  customDialog: {
    isOpen: false,
    type: 'alert',
    title: '알림',
    message: '',
    onConfirm: undefined,
    onCancel: undefined
  },
  showAlert: (message, title = '알림', onConfirm = undefined) => {
    set({
      customDialog: {
        isOpen: true,
        type: 'alert',
        title,
        message,
        onConfirm,
        onCancel: undefined
      }
    });
  },
  showConfirm: (message, title = '확인', onConfirm = undefined, onCancel = undefined) => {
    set({
      customDialog: {
        isOpen: true,
        type: 'confirm',
        title,
        message,
        onConfirm,
        onCancel
      }
    });
  },
  closeDialog: () => {
    set(state => ({
      customDialog: { ...state.customDialog, isOpen: false }
    }));
  },

  // Themes
  activeThemeId: loadFromLS('activeThemeId', 'light'),
  customThemes: loadFromLS('customThemes', []),
  setThemeId: (id) => {
    localStorage.setItem('activeThemeId', id);
    set({ activeThemeId: id });
  },
  addCustomTheme: (themeData) => {
    const newId = 'theme-' + Date.now();
    const newTheme = { ...themeData, id: newId };
    const updated = [...get().customThemes, newTheme];
    localStorage.setItem('customThemes', JSON.stringify(updated));
    set({ customThemes: updated });
  },
  updateCustomTheme: (theme) => {
    const updated = get().customThemes.map(t => t.id === theme.id ? theme : t);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    set({ customThemes: updated });
  },
  deleteCustomTheme: (id) => {
    const updated = get().customThemes.filter(t => t.id !== id);
    localStorage.setItem('customThemes', JSON.stringify(updated));
    set({ customThemes: updated });
    if (get().activeThemeId === id) {
      get().setThemeId('light');
    }
  },

  // Reminders
  customReminders: loadFromLS('customReminders', []),
  addCustomReminder: (reminderData) => {
    const newId = 'rem-' + Date.now();
    const newReminder = { ...reminderData, id: newId, enabled: true };
    const updated = [...get().customReminders, newReminder];
    localStorage.setItem('customReminders', JSON.stringify(updated));
    set({ customReminders: updated });
  },
  updateCustomReminder: (reminder) => {
    const updated = get().customReminders.map(r => r.id === reminder.id ? reminder : r);
    localStorage.setItem('customReminders', JSON.stringify(updated));
    set({ customReminders: updated });
  },
  deleteCustomReminder: (id) => {
    const updated = get().customReminders.filter(r => r.id !== id);
    localStorage.setItem('customReminders', JSON.stringify(updated));
    set({ customReminders: updated });
  },

  // Snapshots
  backupSnapshots: loadFromLS('backupSnapshots', []),
  addBackupSnapshot: async (name) => {
    const newId = 'snap-' + Date.now();
    const pets = await db.pets.toArray();
    const calendarEvents = await db.calendarEvents.toArray();
    const newSnapshot = {
      id: newId,
      name,
      createdAt: new Date().toISOString(),
      pets,
      calendarEvents
    };
    const updated = [...get().backupSnapshots, newSnapshot];
    localStorage.setItem('backupSnapshots', JSON.stringify(updated));
    set({ backupSnapshots: updated });
  },
  updateBackupSnapshot: (id, name) => {
    const updated = get().backupSnapshots.map(s => s.id === id ? { ...s, name } : s);
    localStorage.setItem('backupSnapshots', JSON.stringify(updated));
    set({ backupSnapshots: updated });
  },
  deleteBackupSnapshot: (id) => {
    const updated = get().backupSnapshots.filter(s => s.id !== id);
    localStorage.setItem('backupSnapshots', JSON.stringify(updated));
    set({ backupSnapshots: updated });
  },
  restoreBackupSnapshot: async (id) => {
    const snapshot = get().backupSnapshots.find(s => s.id === id);
    if (!snapshot) return;
    await db.pets.clear();
    await db.calendarEvents.clear();
    if (snapshot.pets.length > 0) {
      await db.pets.bulkAdd(snapshot.pets);
    }
    if (snapshot.calendarEvents.length > 0) {
      await db.calendarEvents.bulkAdd(snapshot.calendarEvents);
    }
    if (snapshot.pets.length > 0) {
      localStorage.setItem('activePetId', snapshot.pets[0].id);
    } else {
      localStorage.removeItem('activePetId');
    }
    await get().loadAllData();
  },

  // Inquiries
  inquiries: loadFromLS('inquiries', []),
  addInquiry: (title, category, content) => {
    const newId = 'inq-' + Date.now();
    const newInquiry = {
      id: newId,
      title,
      category,
      content,
      createdAt: new Date().toISOString(),
      status: '답변대기' as const
    };
    const updated = [...get().inquiries, newInquiry];
    localStorage.setItem('inquiries', JSON.stringify(updated));
    set({ inquiries: updated });
  },
  updateInquiry: (inquiry) => {
    const updated = get().inquiries.map(i => i.id === inquiry.id ? inquiry : i);
    localStorage.setItem('inquiries', JSON.stringify(updated));
    set({ inquiries: updated });
  },
  deleteInquiry: (id) => {
    const updated = get().inquiries.filter(i => i.id !== id);
    localStorage.setItem('inquiries', JSON.stringify(updated));
    set({ inquiries: updated });
  },

  // Walk Tracker
  walkState: 'idle',
  walkElapsedSec: 0,
  walkTargetMin: 30,
  setWalkState: (state) => set({ walkState: state }),
  setWalkElapsedSec: (sec) => set((state) => ({ walkElapsedSec: typeof sec === 'function' ? sec(state.walkElapsedSec) : sec })),
  incrementWalkSec: () => set((state) => ({ walkElapsedSec: state.walkElapsedSec + 1 })),
  setWalkTargetMin: (min) => set({ walkTargetMin: min }),

  setGlobalTourActive: (active: boolean) => {
    if (active) {
      set({ 
        isGlobalTourActive: true, 
        pets: [mockPet], 
        activePetId: 'mock-pet', 
        events: mockEvents 
      });
    } else {
      set({ isGlobalTourActive: false });
      get().loadAllData();
    }
  },
  setGlobalTourStep: (step: number) => set({ globalTourStep: step }),

  loadAllData: async () => {
    set({ loading: true });
    try {
      // Seed first (empty now to allow onboarding)
      await seedDatabase();
      
      const pets = await db.pets.toArray();
      const events = await db.calendarEvents.toArray();
      
      // Determine activePetId from localStorage
      let activeId = localStorage.getItem('activePetId');
      if (!activeId && pets.length > 0) {
        activeId = pets[0].id;
        localStorage.setItem('activePetId', activeId);
      } else if (activeId && !pets.some(p => p.id === activeId) && pets.length > 0) {
        activeId = pets[0].id;
        localStorage.setItem('activePetId', activeId);
      }
      
      set({ pets, events, activePetId: activeId, loading: false });
    } catch (error) {
      console.error('Failed to load local database data:', error);
      set({ loading: false });
    }
  },

  setActivePetId: (id) => {
    if (id) {
      localStorage.setItem('activePetId', id);
    } else {
      localStorage.removeItem('activePetId');
    }
    set({ activePetId: id });
  },

  addPet: async (petData) => {
    const newId = 'pet-' + Date.now();
    const newPet: Pet = { ...petData, id: newId };
    await db.pets.add(newPet);
    
    // Reload
    const pets = await db.pets.toArray();
    set({ pets, activePetId: newId });
    localStorage.setItem('activePetId', newId);
    return newPet;
  },

  updatePet: async (pet) => {
    await db.pets.put(pet);
    const pets = await db.pets.toArray();
    set({ pets });
    if (get().activePetId === pet.id) {
      // Sync in case active pet details changed
      set({ activePetId: pet.id });
    }
  },

  addCalendarEvent: async (eventData) => {
    const newId = 'evt-' + Date.now();
    const newEvent: CalendarEvent = { ...eventData, id: newId };
    await db.calendarEvents.add(newEvent);
    
    // Reload
    const events = await db.calendarEvents.toArray();
    set({ events });
    return newEvent;
  },

  updateCalendarEvent: async (event) => {
    await db.calendarEvents.put(event);
    const events = await db.calendarEvents.toArray();
    set({ events });
  },

  deleteCalendarEvent: async (id) => {
    await db.calendarEvents.delete(id);
    const events = await db.calendarEvents.toArray();
    set({ events });
  },

  setPets: (pets) => set({ pets }),
  setEvents: (events) => set({ events }),
}));
export type { Pet, CalendarEvent };
