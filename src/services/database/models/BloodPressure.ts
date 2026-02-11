import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, writer } from '@nozbe/watermelondb/decorators';
import { TableName } from '../schema';

export default class BloodPressure extends Model {
  static table = TableName.BLOOD_PRESSURES;

  @field('systolic') systolic!: number;
  @field('diastolic') diastolic!: number;
  @field('pulse') pulse!: number;
  @date('timestamp') timestamp!: number;
  @field('note') note?: string;
  
  @readonly @date('created_at') createdAt!: number;
  @readonly @date('updated_at') updatedAt!: number;

  @writer async updateRecord(updates: Partial<BloodPressure>) {
    await this.update(record => {
      if (updates.systolic) record.systolic = updates.systolic;
      if (updates.diastolic) record.diastolic = updates.diastolic;
      if (updates.pulse) record.pulse = updates.pulse;
      if (updates.timestamp) record.timestamp = updates.timestamp;
      if (updates.note !== undefined) record.note = updates.note;
    });
  }
}