import { create } from 'zustand';
import { BloodPressureRecord } from '@/types/models';
import { database, bloodPressuresCollection } from '@/services/database';
import { Q } from '@nozbe/watermelondb';

interface BloodPressureState {
  records: BloodPressureRecord[];
  isLoading: boolean;
  loadRecords: () => Promise<void>;
  addRecord: (record: Omit<BloodPressureRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecentRecords: (limit?: number) => BloodPressureRecord[];
}

export const useBloodPressureStore = create<BloodPressureState>((set, get) => ({
  records: [],
  isLoading: false,

  loadRecords: async () => {
    set({ isLoading: true });
    try {
      const records = await bloodPressuresCollection.query(
        Q.sortBy('timestamp', Q.desc)
      ).fetch();
      
      const formattedRecords: BloodPressureRecord[] = records.map(r => ({
        id: r.id,
        systolic: r.systolic,
        diastolic: r.diastolic,
        pulse: r.pulse,
        timestamp: r.timestamp,
        note: r.note,
        createdAt: r.createdAt.getTime(),
        updatedAt: r.updatedAt.getTime(),
      }));

      set({ records: formattedRecords, isLoading: false });
    } catch (error) {
      console.error('Failed to load records', error);
      set({ isLoading: false });
    }
  },

  addRecord: async (recordData) => {
    try {
      await database.write(async () => {
        await bloodPressuresCollection.create(record => {
          record.systolic = recordData.systolic;
          record.diastolic = recordData.diastolic;
          record.pulse = recordData.pulse;
          record.timestamp = recordData.timestamp;
          record.note = recordData.note;
        });
      });
      // Reload records after adding
      get().loadRecords();
    } catch (error) {
      console.error('Failed to add record', error);
    }
  },

  deleteRecord: async (id) => {
    try {
      const record = await bloodPressuresCollection.find(id);
      await database.write(async () => {
        await record.markAsDeleted(); // Syncable delete
        await record.destroyPermanently(); // Permanent delete
      });
      // Reload records after deletion
      get().loadRecords();
    } catch (error) {
      console.error('Failed to delete record', error);
    }
  },

  getRecentRecords: (limit = 5) => {
    return get().records.slice(0, limit);
  }
}));