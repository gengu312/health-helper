import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import BloodPressure from './models/BloodPressure';

const adapter = new SQLiteAdapter({
  schema,
  // (You might want to comment out migrationEvents for production)
  // migrationEvents: true,
  onSetUpError: error => {
    // Database failed to load -- offer the user to reload the app or log out
    console.error('Database setup failed', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    BloodPressure,
  ],
});

export const bloodPressuresCollection = database.get<BloodPressure>('blood_pressures');
