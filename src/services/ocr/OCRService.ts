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

interface NumberCandidate {
  value: number;
  y: number;
  x: number;
  source: string;
}

export class OCRService {
  static async recognizeBloodPressure(imagePath: string): Promise<OCRResult> {
    try {
      const result = await MlkitOcr.detectFromUri(imagePath);
      
      if (!result || result.length === 0) {
        return { success: false, error: '未识别到文字' };
      }

      // 1. 提取所有数字候选者和文本锚点
      const candidates: NumberCandidate[] = [];
      const anchors: { text: string, y: number, x: number, type: 'SYS' | 'DIA' | 'PUL' }[] = [];

      const sysKeywords = ['sys', 'systolic', '收缩压', '高压'];
      const diaKeywords = ['dia', 'diastolic', '舒张压', '低压'];
      const pulKeywords = ['pul', 'pulse', 'min', '脉搏', '心率'];

      result.forEach(block => {
        block.lines.forEach(line => {
          // 检查锚点
          const lowerText = line.text.toLowerCase();
          if (sysKeywords.some(k => lowerText.includes(k))) {
            anchors.push({ text: line.text, y: line.bounding.top, x: line.bounding.left, type: 'SYS' });
          } else if (diaKeywords.some(k => lowerText.includes(k))) {
            anchors.push({ text: line.text, y: line.bounding.top, x: line.bounding.left, type: 'DIA' });
          } else if (pulKeywords.some(k => lowerText.includes(k))) {
            anchors.push({ text: line.text, y: line.bounding.top, x: line.bounding.left, type: 'PUL' });
          }

          const numbers = this.extractNumbers(line.text);
          if (numbers.length > 0) {
            numbers.forEach((num, index) => {
              candidates.push({
                value: num,
                y: line.bounding.top,
                x: line.bounding.left + (index * 100), 
                source: line.text
              });
            });
          }
        });
      });

      if (candidates.length < 3) {
         return { success: false, error: '未识别到足够的数值 (需包含收缩压、舒张压、脉搏)' };
      }

      // 2. 策略 A: 基于锚点匹配 (如果存在锚点)
      if (anchors.length > 0) {
        console.log('Using Anchor Strategy', anchors);
        // 寻找距离锚点最近的数字
        const findClosest = (anchorType: 'SYS' | 'DIA' | 'PUL') => {
          const typeAnchors = anchors.filter(a => a.type === anchorType);
          if (typeAnchors.length === 0) return null;

          let best: NumberCandidate | null = null;
          let minDist = Infinity;

          typeAnchors.forEach(anchor => {
            candidates.forEach(cand => {
              // 计算欧几里得距离，但在 Y 轴上权重更大 (因为通常标签在数字旁边或上方)
              const dy = Math.abs(cand.y - anchor.y);
              const dx = Math.abs(cand.x - anchor.x);
              
              // 过滤掉太远的
              if (dy > 300 || dx > 500) return;

              const dist = dy * 2 + dx; // Y 轴差异惩罚加倍
              if (dist < minDist) {
                // 简单的数值范围校验
                if (anchorType === 'SYS' && (cand.value < 90 || cand.value > 220)) return;
                if (anchorType === 'DIA' && (cand.value < 40 || cand.value > 140)) return;
                if (anchorType === 'PUL' && (cand.value < 40 || cand.value > 200)) return;
                
                minDist = dist;
                best = cand;
              }
            });
          });
          return best;
        };

        const s = findClosest('SYS');
        const d = findClosest('DIA');
        const p = findClosest('PUL');

        // 如果三个都找到了，直接返回
        if (s && d && p) {
           return { success: true, data: { systolic: s.value, diastolic: d.value, pulse: p.value } };
        }
        // 如果找到部分，可以结合几何策略补全 (暂略，为保持简单，回退到纯几何)
      }

      // 3. 策略 B: 纯几何 + 评分 (原有逻辑)
      // 排序：主要按 Y (从上到下)，次要按 X (从左到右)
      candidates.sort((a, b) => {
        const yDiff = Math.abs(a.y - b.y);
        if (yDiff < 20) { // 视为同一行
          return a.x - b.x;
        }
        return a.y - b.y;
      });

      console.log('OCR Candidates:', candidates);

      // 3. 智能匹配
      // 常见布局 1: 垂直排列 (S -> D -> P)
      // 常见布局 2: 两列 (S, D 并排 -> P 在下) 或 (S -> D/P 并排)
      
      // 策略：寻找最佳的 (S, D, P) 组合
      // 约束 1: S > D
      // 约束 2: S 范围 [90, 200], D 范围 [50, 130], P 范围 [40, 150]
      // 约束 3: 几何顺序。S 通常在 D 上面或左边。P 通常在最下面。
      
      let bestMatch: { s: NumberCandidate, d: NumberCandidate, p: NumberCandidate } | null = null;
      let minPenalty = Infinity;

      // 暴力搜索所有组合 (因为数字通常很少，< 10 个，所以性能没问题)
      for (let i = 0; i < candidates.length; i++) {
        const s = candidates[i];
        if (s.value < 90 || s.value > 220) continue; // 放宽一点上限

        for (let j = 0; j < candidates.length; j++) {
          if (i === j) continue;
          const d = candidates[j];
          if (d.value < 40 || d.value > 140) continue; // 放宽下限
          if (d.value >= s.value) continue; // 收缩压必须大于舒张压

          for (let k = 0; k < candidates.length; k++) {
            if (k === i || k === j) continue;
            const p = candidates[k];
            if (p.value < 40 || p.value > 160) continue;

            // 计算“惩罚分”来评估这个组合的合理性
            // 惩罚越低越好
            let penalty = 0;

            // 几何位置惩罚
            // 我们期望 S 在 D 上面 (yS < yD) 或者 同行左边 (yS ≈ yD && xS < xD)
            const s_d_y_diff = d.y - s.y;
            if (s_d_y_diff < -20) penalty += 1000; // D 在 S 上面很多，不太可能
            else if (s_d_y_diff < 20) {
                // 同行
                if (d.x < s.x) penalty += 500; // D 在 S 左边，不太可能
            }

            // 我们期望 P 在 D 下面
            const d_p_y_diff = p.y - d.y;
            if (d_p_y_diff < -20) penalty += 1000; // P 在 D 上面，不太可能
            
            // 如果 P 在 S 上面，更不可能
            const s_p_y_diff = p.y - s.y;
            if (s_p_y_diff < -20) penalty += 2000;

            // 数值合理性优化
            // 正常的脉压差 (S - D) 通常在 20-60 之间
            const pulsePressure = s.value - d.value;
            if (pulsePressure < 20 || pulsePressure > 100) penalty += 100;

            if (penalty < minPenalty) {
              minPenalty = penalty;
              bestMatch = { s, d, p };
            }
          }
        }
      }

      if (bestMatch) {
         return {
          success: true,
          data: {
            systolic: bestMatch.s.value,
            diastolic: bestMatch.d.value,
            pulse: bestMatch.p.value
          }
        };
      }

      // 如果找不到完美组合，回退到简单排序提取
      // 取前三个符合大概范围的
      const simpleCandidates = candidates.filter(c => c.value > 40 && c.value < 200);
      if (simpleCandidates.length >= 3) {
          // 假设排序后的前三个就是 S, D, P (基于 Y 轴排序)
          // 并且满足 S > D
          let s = simpleCandidates[0];
          let d = simpleCandidates[1];
          const p = simpleCandidates[2];

          // 简单的交换逻辑
          if (d.value > s.value) {
            const temp = s;
            s = d;
            d = temp;
          }
          
          return {
              success: true,
              data: { systolic: s.value, diastolic: d.value, pulse: p.value }
          };
      }

      return { success: false, error: '无法识别有效的血压数据' };

    } catch (error) {
      console.error('OCR Error:', error);
      return { success: false, error: '识别服务出错' };
    }
  }

  private static extractNumbers(text: string): number[] {
    // 匹配 2-3 位数字
    // 过滤掉类似日期 (2023) 或时间 (12:30) 的干扰，虽然 \b\d{2,3}\b 已经过滤了 4 位数
    // 但像 10:23 这样的会被拆成 10, 23。需要小心。
    // 暂时保持简单，依赖后续的逻辑组合过滤
    const regex = /\b\d{2,3}\b/g;
    const matches = text.match(regex);
    return matches ? matches.map(Number) : [];
  }
}
