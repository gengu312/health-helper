export interface BloodPressureRecord {
  id: string;
  systolic: number;      // 收缩压
  diastolic: number;     // 舒张压
  pulse: number;         // 脉搏
  timestamp: number;     // 测量时间戳
  note?: string;         // 备注
  createdAt: number;     // 创建时间
  updatedAt?: number;    // 更新时间
}

export enum BloodPressureCategory {
  NORMAL = 'normal',
  ELEVATED = 'elevated',
  HIGH_STAGE_1 = 'high_stage_1',
  HIGH_STAGE_2 = 'high_stage_2',
  HYPERTENSIVE_CRISIS = 'hypertensive_crisis'
}