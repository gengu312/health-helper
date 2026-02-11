import { create } from 'zustand';
import { BloodPressureRecord } from '@/types/models';
import { generateId } from '@/utils/helpers'; // We need to create this helper

interface BloodPressureState {
  records: BloodPressureRecord[];
  addRecord: (record: Omit<BloodPressureRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteRecord: (id: string) => void;
  getRecentRecords: (limit?: number) => BloodPressureRecord[];
}

export const useBloodPressureStore = create<BloodPressureState>((set, get) => ({
  records: [],
  
  addRecord: (recordData) => {
    const now = Date.now();
    const newRecord: BloodPressureRecord = {
      id: Math.random().toString(36).substr(2, 9), // Simple ID for now
      ...recordData,
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => ({
      records: [newRecord, ...state.records].sort((a, b) => b.timestamp - a.timestamp)
    }));
  },

  deleteRecord: (id) => {
    set((state) => ({
      records: state.records.filter(r => r.id !== id)
    }));
  },

  getRecentRecords: (limit = 5) => {
    return get().records.slice(0, limit);
  }
}));