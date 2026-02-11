import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { BloodPressureRecord } from '@/types/models';
import { format } from 'date-fns';

export class ExportService {
  static async generateAndSharePDF(records: BloodPressureRecord[]) {
    try {
      const html = this.generateHTML(records);
      const options = {
        html,
        fileName: `BloodPressure_Report_${format(new Date(), 'yyyyMMdd')}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      
      if (file.filePath) {
        await Share.open({
          url: `file://${file.filePath}`,
          type: 'application/pdf',
          title: '分享健康报告'
        });
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw error;
    }
  }

  static async shareImage(imageUri: string) {
    const url = imageUri.startsWith('file://') ? imageUri : `file://${imageUri}`;

    await Share.open({
      url,
      type: 'image/png',
      title: '分享健康报告',
    });
  }

  private static generateHTML(records: BloodPressureRecord[]): string {
    const rows = records.map(r => `
      <tr>
        <td>${format(new Date(r.timestamp), 'yyyy-MM-dd HH:mm')}</td>
        <td>${r.systolic}</td>
        <td>${r.diastolic}</td>
        <td>${r.pulse}</td>
        <td>${r.note || '-'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; }
          h1 { text-align: center; color: #1976D2; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; color: #333; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>血压健康报告</h1>
        <p>生成日期: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>收缩压 (mmHg)</th>
              <th>舒张压 (mmHg)</th>
              <th>脉搏 (bpm)</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}
