import { create } from 'zustand';
import { db, seedDatabase, type Pet, type CalendarEvent } from '../db';

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
  deleteCalendarEvent: (id: string) => Promise<void>;
  setPets: (pets: Pet[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
  
  isGlobalTourActive: boolean;
  setGlobalTourActive: (active: boolean) => void;
  globalTourStep: number;
  setGlobalTourStep: (step: number) => void;
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

export const usePetStore = create<PetState>((set, get) => ({
  pets: [],
  activePetId: null,
  events: [],
  loading: true,
  isGlobalTourActive: false,
  globalTourStep: 0,

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

  deleteCalendarEvent: async (id) => {
    await db.calendarEvents.delete(id);
    const events = await db.calendarEvents.toArray();
    set({ events });
  },

  setPets: (pets) => set({ pets }),
  setEvents: (events) => set({ events }),
}));
export type { Pet, CalendarEvent };
