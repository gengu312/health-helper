import MlkitOcr from 'react-native-mlkit-ocr';

export interface OCRResult {
  success: boolean;
  data?: {
    systolic: number;
    diastolic: number;
    pulse: number;
  };
  error?: string;
}

export class OCRService {
  static async recognizeBloodPressure(imagePath: string): Promise<OCRResult> {
    try {
      const result = await MlkitOcr.detectFromUri(imagePath);
      
      if (!result || result.length === 0) {
        return { success: false, error: '未识别到文字' };
      }

      // Concatenate all detected text
      const allText = result.map(block => block.text).join(' ');
      
      // Extract numbers from the text
      const numbers = this.extractNumbers(allText);
      
      if (numbers.length < 3) {
        return { success: false, error: '未识别到足够的数值 (需包含收缩压、舒张压、脉搏)' };
      }

      // Simple heuristic: 
      // 1. Sort numbers descending
      // 2. Assume largest is Systolic
      // 3. Second largest is Diastolic (if < Systolic)
      // 4. Pulse is usually between 40-120
      
      // Better heuristic based on medical ranges:
      // Systolic: 90-180
      // Diastolic: 60-120
      // Pulse: 40-120
      
      // Let's try to map them intelligently
      const potentialSystolic = numbers.filter(n => n >= 90 && n <= 200);
      const potentialDiastolic = numbers.filter(n => n >= 50 && n <= 130);
      const potentialPulse = numbers.filter(n => n >= 40 && n <= 150);

      // This is a simplified logic. In real world, we might need coordinate analysis (y-axis).
      // For now, let's take the first matching set.
      
      const systolic = potentialSystolic[0] || numbers[0];
      const diastolic = potentialDiastolic.find(n => n < systolic) || numbers[1];
      const pulse = potentialPulse.find(n => n !== systolic && n !== diastolic) || numbers[2];

      return {
        success: true,
        data: {
          systolic,
          diastolic,
          pulse
        }
      };

    } catch (error) {
      console.error('OCR Error:', error);
      return { success: false, error: '识别服务出错' };
    }
  }

  private static extractNumbers(text: string): number[] {
    // Match numbers with 2 or 3 digits
    const regex = /\b\d{2,3}\b/g;
    const matches = text.match(regex);
    return matches ? matches.map(Number) : [];
  }
}