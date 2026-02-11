import { OCRService } from '../OCRService';
import MlkitOcr from 'react-native-mlkit-ocr';

// Mock MlkitOcr
jest.mock('react-native-mlkit-ocr', () => ({
  detectFromUri: jest.fn(),
}));

describe('OCRService', () => {
  const mockDetectFromUri = MlkitOcr.detectFromUri as jest.Mock;

  beforeEach(() => {
    mockDetectFromUri.mockClear();
  });

  it('should correctly identify standard vertical layout', async () => {
    // Mock return value for standard layout
    // Systolic: 120 (Top), Diastolic: 80 (Middle), Pulse: 70 (Bottom)
    mockDetectFromUri.mockResolvedValue([
      {
        text: '120',
        lines: [{ 
            text: '120', 
            bounding: { top: 100, left: 50, width: 100, height: 50 },
            elements: []
        }],
      },
      {
        text: '80',
        lines: [{ 
            text: '80', 
            bounding: { top: 200, left: 50, width: 100, height: 50 },
            elements: []
        }],
      },
      {
        text: '70',
        lines: [{ 
            text: '70', 
            bounding: { top: 300, left: 50, width: 100, height: 50 },
            elements: []
        }],
      },
    ]);

    const result = await OCRService.recognizeBloodPressure('dummy-path');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      systolic: 120,
      diastolic: 80,
      pulse: 70,
    });
  });

  it('should handle noise and identify correct values', async () => {
    // Noise at top: "2023" (Year), "10:30" (Time)
    // S: 130, D: 85, P: 75
    mockDetectFromUri.mockResolvedValue([
      {
        text: '2023',
        lines: [{ text: '2023', bounding: { top: 10, left: 10, width: 50, height: 20 }, elements: [] }],
      },
      {
        text: '10:30',
        lines: [{ text: '10:30', bounding: { top: 10, left: 100, width: 50, height: 20 }, elements: [] }],
      },
      {
        text: '130',
        lines: [{ text: '130', bounding: { top: 150, left: 50, width: 100, height: 50 }, elements: [] }],
      },
      {
        text: '85',
        lines: [{ text: '85', bounding: { top: 250, left: 50, width: 100, height: 50 }, elements: [] }],
      },
      {
        text: '75',
        lines: [{ text: '75', bounding: { top: 350, left: 50, width: 100, height: 50 }, elements: [] }],
      },
    ]);

    const result = await OCRService.recognizeBloodPressure('dummy-path');
    
    // 2023 filtered by regex (only 2-3 digits) or range
    // 10:30 -> 10, 30 filtered by range (<40)
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      systolic: 130,
      diastolic: 85,
      pulse: 75,
    });
  });

  it('should handle side-by-side layout (same line)', async () => {
    // "118 / 78" on same line
    // Pulse 72 below
    mockDetectFromUri.mockResolvedValue([
      {
        text: '118 / 78',
        lines: [{ 
            text: '118 / 78', 
            bounding: { top: 100, left: 50, width: 200, height: 50 },
            elements: []
        }],
      },
      {
        text: '72',
        lines: [{ 
            text: '72', 
            bounding: { top: 200, left: 50, width: 100, height: 50 },
            elements: []
        }],
      },
    ]);

    const result = await OCRService.recognizeBloodPressure('dummy-path');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      systolic: 118,
      diastolic: 78,
      pulse: 72,
    });
  });
});
