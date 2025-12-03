import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../constants/config';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function PopupModal() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [popupQueue, setPopupQueue] = useState([]);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/popups/active`);
      const popups = response.data.popups || [];
      
      if (popups.length === 0) return;

      // Filtrer selon la frequence d affichage
      const popupsToShow = [];
      
      for (const popup of popups) {
        const shouldShow = await checkDisplayFrequency(popup);
        if (shouldShow) {
          popupsToShow.push(popup);
        }
      }

      if (popupsToShow.length > 0) {
        setPopupQueue(popupsToShow);
        setCurrentPopup(popupsToShow[0]);
        setVisible(true);
      }
    } catch (error) {
      console.log('Erreur chargement popups:', error);
    }
  };

  const checkDisplayFrequency = async (popup) => {
    const key = `popup_shown_${popup.id}`;
    const lastShown = await AsyncStorage.getItem(key);

    switch (popup.display_frequency) {
      case 'once':
        return !lastShown;
      case 'every_day':
        if (!lastShown) return true;
        const lastDate = new Date(lastShown).toDateString();
        const today = new Date().toDateString();
        return lastDate !== today;
      case 'every_session':
      default:
        return true;
    }
  };

  const markAsShown = async (popup) => {
    const key = `popup_shown_${popup.id}`;
    await AsyncStorage.setItem(key, new Date().toISOString());
  };

  const handleClose = async () => {
    if (currentPopup) {
      await markAsShown(currentPopup);
    }

    // Passer au popup suivant
    const remaining = popupQueue.slice(1);
    if (remaining.length > 0) {
      setPopupQueue(remaining);
      setCurrentPopup(remaining[0]);
    } else {
      setVisible(false);
      setCurrentPopup(null);
    }
  };

  const handlePress = async () => {
    if (!currentPopup) return;

    if (currentPopup.link_type === 'internal' && currentPopup.link_url) {
      await handleClose();
      router.push(currentPopup.link_url);
    } else if (currentPopup.link_type === 'external' && currentPopup.link_url) {
      Linking.openURL(currentPopup.link_url);
      await handleClose();
    } else {
      await handleClose();
    }
  };

  if (!visible || !currentPopup) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={currentPopup.link_url ? 0.9 : 1}
            onPress={handlePress}
          >
            <Image
              source={{ uri: currentPopup.image_url }}
              style={styles.image}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 10,
    padding: 10,
  },
  image: {
    width: '100%',
    height: height * 0.6,
    borderRadius: 20,
  },
});
