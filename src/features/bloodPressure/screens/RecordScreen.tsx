import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, HelperText, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBloodPressureStore } from '../store/bloodPressureStore';
import { useNavigation } from '@react-navigation/native';

const RecordScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const addRecord = useBloodPressureStore(state => state.addRecord);

  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [note, setNote] = useState('');

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

  const handleSave = () => {
    if (validate()) {
      addRecord({
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        timestamp: Date.now(),
        note: note,
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
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