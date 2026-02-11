import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const TableName = {
  BLOOD_PRESSURES: 'blood_pressures',
};

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: TableName.BLOOD_PRESSURES,
      columns: [
        { name: 'systolic', type: 'number' },
        { name: 'diastolic', type: 'number' },
        { name: 'pulse', type: 'number' },
        { name: 'timestamp', type: 'number' },
        { name: 'note', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});