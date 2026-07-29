import Dexie, { type Table } from 'dexie';

export interface Pet {
  id: string;
  name: string;
  species?: string;
  breed: string;
  birth: string;
  weight: number;
  image: string;
  hospitalName?: string;
  allergies?: string;
  medications?: string;
  notes?: string;
  walkTime?: string;
  walkGoal?: string;
  medicationName?: string;
  medicationTime?: string;
  walkDepartTime?: string;
  walkDuration?: string;
  medicationRepeat?: boolean;
  walkRepeat?: boolean;
}

export type EventType = 'diary' | 'hospital' | 'schedule' | 'poop' | 'walk';

export interface CalendarEvent {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  content: string;
  imageUrl?: string;
  poopStatus?: 'good' | 'loose' | 'hard' | 'bloody';
  category?: string;
  time?: string;
  hasAlarm?: boolean;
}

export interface AppSettings {
  key: string;
  isGlobalTourSeen?: boolean;
  isCoachMarkSeen?: boolean;
  isWalkGuideSeen?: boolean;
  isDiaryLimitSeen: boolean;
  isSettingsWarnSeen: boolean;
}

export interface HospitalCache {
  queryKey: string; // e.g. "hospital:city:district" or "pharmacy:city:district"
  data: any[];      // Cached items list
  updatedAt: number; // Timestamp (epoch ms)
}

export class OnDaDatabase extends Dexie {
  pets!: Table<Pet>;
  calendarEvents!: Table<CalendarEvent>;
  app_settings!: Table<AppSettings>;
  hospital_cache!: Table<HospitalCache>;

  constructor() {
    super('OnDaDatabase');
    this.version(3).stores({
      pets: 'id, name, breed, birth',
      calendarEvents: 'id, petId, date, type',
      app_settings: 'key',
      hospital_cache: 'queryKey'
    });
  }
}

export const db = new OnDaDatabase();

// Seed function intentionally left empty to start in a 'Empty' state for onboarding
export const seedDatabase = async () => {
  // No demo data is seeded automatically.
};
