import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { TextInput, Button, HelperText, useTheme, ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBloodPressureStore } from '../store/bloodPressureStore';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentScanner from 'react-native-document-scanner-plugin';
import { OCRService } from '@/services/ocr/OCRService';

const RecordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const addRecord = useBloodPressureStore(state => state.addRecord);

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [note, setNote] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);

  const [errors, setErrors] = useState({
    systolic: '',
    diastolic: '',
    pulse: '',
  });

  const validate = () => {
    let isValid = true;
    const newErrors = { systolic: '', diastolic: '', pulse: '' };

    if (!systolic || isNaN(Number(systolic)) || Number(systolic) < 50 || Number(systolic) > 300) {
      newErrors.systolic = '请输入有效的收缩压 (50-300)';
      isValid = false;
    }
    if (!diastolic || isNaN(Number(diastolic)) || Number(diastolic) < 30 || Number(diastolic) > 200) {
      newErrors.diastolic = '请输入有效的舒张压 (30-200)';
      isValid = false;
    }
    if (!pulse || isNaN(Number(pulse)) || Number(pulse) < 30 || Number(pulse) > 250) {
      newErrors.pulse = '请输入有效的脉搏 (30-250)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (validate()) {
      await addRecord({
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        timestamp: Date.now(),
        note: note,
      });
      navigation.goBack();
    }
  };

  const handleScan = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        maxNumDocuments: 1
      });
      
      if (scannedImages && scannedImages.length > 0) {
        processImage(scannedImages[0]);
      }
    } catch (error) {
      console.error('Scan Error:', error);
      Alert.alert('扫描失败', '启动扫描仪失败，请检查相机权限');
    }
  };

  const handleGallery = async () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
    };
    
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets[0]?.uri) {
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setIsRecognizing(true);
    const ocrResult = await OCRService.recognizeBloodPressure(uri);
    setIsRecognizing(false);

    if (ocrResult.success && ocrResult.data) {
      const { systolic, diastolic, pulse } = ocrResult.data;
      
      // 检测是否是常见的示例数据 (屏幕保护膜或包装盒)
      if (systolic === 140 && diastolic === 85 && pulse === 90) {
        Alert.alert(
          '检测到示例数据',
          '识别结果 (140/85/90) 看起来像是血压计屏幕保护膜或包装盒上的示例数值。\n\n请确认您是否已撕掉保护膜，并拍摄真实的测量结果。',
          [
            { text: '重新扫描', onPress: handleScan },
            { text: '强制填入', onPress: () => fillData(systolic, diastolic, pulse) }
          ]
        );
      } else {
        fillData(systolic, diastolic, pulse);
        Alert.alert('识别成功', '请核对数据是否准确');
      }
    } else {
      Alert.alert('识别失败', ocrResult.error || '无法识别图片中的数值');
    }
  };

  const fillData = (s: number, d: number, p: number) => {
    setSystolic(s.toString());
    setDiastolic(d.toString());
    setPulse(p.toString());
    setNote('OCR 自动识别数据');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* OCR Buttons */}
        <View style={styles.ocrContainer}>
          <Button 
            icon="crop-free" 
            mode="contained" 
            onPress={handleScan}
            style={[styles.ocrButton, { flex: 0.55 }]}
            disabled={isRecognizing}
          >
            扫描屏幕
          </Button>
          <Button 
            icon="image" 
            mode="outlined" 
            onPress={handleGallery}
            style={[styles.ocrButton, { flex: 0.40 }]}
            disabled={isRecognizing}
          >
            相册
          </Button>
        </View>

        {isRecognizing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating={true} color={theme.colors.primary} />
            <Text style={{ marginTop: 8 }}>正在识别中...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            label="收缩压 (mmHg)"
            value={systolic}
            onChangeText={setSystolic}
            keyboardType="numeric"
            mode="outlined"
            error={!!errors.systolic}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.systolic}>
            {errors.systolic}
          </HelperText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="舒张压 (mmHg)"
            value={diastolic}
            onChangeText={setDiastolic}
            keyboardType="numeric"
            mode="outlined"
            error={!!errors.diastolic}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.diastolic}>
            {errors.diastolic}
          </HelperText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="脉搏 (次/分)"
            value={pulse}
            onChangeText={setPulse}
            keyboardType="numeric"
            mode="outlined"
            error={!!errors.pulse}
            style={styles.input}
          />
          <HelperText type="error" visible={!!errors.pulse}>
            {errors.pulse}
          </HelperText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="备注 (可选)"
            value={note}
            onChangeText={setNote}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
        </View>

        <Button 
          mode="contained" 
          onPress={handleSave} 
          style={styles.button}
          contentStyle={{ height: 50 }}
          disabled={isRecognizing}
        >
          保存记录
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  ocrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ocrButton: {
    flex: 0.48,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
});

export default RecordScreen;