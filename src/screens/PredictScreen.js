import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import api from '../api';
import AnimatedButton from '../components/AnimatedButton';

export default function PredictScreen({ route }) {
  const { user } = route.params;
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Allow access to your camera roll to select an image.");
      return;
    }

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
      setBase64Image(pickerResult.assets[0].base64);
      setText(''); // clear text when image is picked
    }
  };

  const clearSelection = () => {
    setImageUri(null);
    setBase64Image(null);
    setText('');
    setResult(null);
  };

  const handleMicPress = () => {
    Alert.alert(
      "Microphone Option", 
      "To use voice dictation, tap the text box and press the microphone icon on your mobile keyboard."
    );
  };

  const handlePredict = async () => {
    if (!text.trim() && !base64Image) {
      Alert.alert('Error', 'Please enter text or upload an image.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const response = await api.post('predict', {
        loginid: user.loginid,
        text: text,
        base64_image: base64Image
      });

      if (response.data.success) {
        setResult(response.data.score);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Prediction failed';
      Alert.alert('Analysis Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.Text style={[styles.title, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        Predict Score
      </Animated.Text>

      {result && (
        <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>
          <Text style={styles.resultTitle}>Estimated Score</Text>
          <Text style={styles.resultScore}>{result}</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.label}>Upload Essay Image (OCR)</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color={theme.colors.primary} style={styles.iconMargin} />
          <Text style={styles.imageButtonText}>Select Image from Gallery</Text>
        </TouchableOpacity>

        {imageUri && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity onPress={clearSelection} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              <Text style={styles.clearText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.orText}>— OR —</Text>

        <View style={styles.textInputWrapper}>
          <Text style={styles.label}>Paste Essay Text</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Start typing your essay here..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              numberOfLines={6}
              value={text}
              onChangeText={(val) => {
                setText(val);
                if (val.length > 0) {
                  setImageUri(null);
                  setBase64Image(null);
                }
              }}
            />
            {/* The visual Mic Button */}
            <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
              <Ionicons name="mic" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <AnimatedButton style={styles.submitButton} onPress={handlePredict} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Analyze Essay</Text>}
        </AnimatedButton>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.layout.padding,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.navy,
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: theme.layout.radius,
    ...theme.shadows.card,
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  iconMargin: {
    marginRight: 8,
  },
  imageButton: {
    backgroundColor: theme.colors.blue100,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
  },
  imageButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  clearText: {
    color: theme.colors.danger,
    marginLeft: 4,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginVertical: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  textInputWrapper: {
    marginBottom: 24,
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    backgroundColor: theme.colors.surface2,
    borderRadius: 12,
    padding: 16,
    paddingRight: 60, // make space for mic
    textAlignVertical: 'top',
    minHeight: 140,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  micButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: theme.colors.primaryHover,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.button,
  },
  submitButton: {
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: theme.colors.navy,
    padding: 24,
    borderRadius: theme.layout.radius,
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.card,
  },
  resultTitle: {
    color: theme.colors.blue100,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  resultScore: {
    color: theme.colors.success,
    fontSize: 56,
    fontWeight: '800',
    marginTop: 8,
  }
});
