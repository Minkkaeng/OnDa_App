import Dexie, { type Table } from 'dexie';

export interface Pet {
  id: string;
  name: string;
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
}

export type EventType = 'diary' | 'hospital' | 'schedule';

export interface CalendarEvent {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  type: EventType;
  title: string;
  content: string;
  imageUrl?: string;
}

export interface AppSettings {
  key: string;
  isGlobalTourSeen?: boolean;
  isCoachMarkSeen?: boolean;
  isWalkGuideSeen?: boolean;
  isDiaryLimitSeen: boolean;
  isSettingsWarnSeen: boolean;
}

export class OnDaDatabase extends Dexie {
  pets!: Table<Pet>;
  calendarEvents!: Table<CalendarEvent>;
  app_settings!: Table<AppSettings>;

  constructor() {
    super('OnDaDatabase');
    this.version(2).stores({
      pets: 'id, name, breed, birth',
      calendarEvents: 'id, petId, date, type',
      app_settings: 'key'
    });
  }
}

export const db = new OnDaDatabase();

// Seed function intentionally left empty to start in a 'Empty' state for onboarding
export const seedDatabase = async () => {
  // No demo data is seeded automatically.
};
