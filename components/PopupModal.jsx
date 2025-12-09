import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  ActivityIndicator,
  Text,
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/popups/active`);
      const popups = response.data.popups || [];
      
      console.log('📢 Popups actifs:', popups.length);
      
      if (popups.length === 0) return;

      // Filtrer selon la frequence d affichage
      const popupsToShow = [];
      
      for (const popup of popups) {
        // Vérifier que le popup a une image
        if (!popup.image_url) {
          console.log('⚠️ Popup sans image ignoré:', popup.id);
          continue;
        }
        
        const shouldShow = await checkDisplayFrequency(popup);
        if (shouldShow) {
          popupsToShow.push(popup);
        }
      }

      console.log('📢 Popups à afficher:', popupsToShow.length);

      if (popupsToShow.length > 0) {
        setPopupQueue(popupsToShow);
        setCurrentPopup(popupsToShow[0]);
        setImageLoading(true);
        setImageError(false);
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
      setImageLoading(true);
      setImageError(false);
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
          {/* Bouton fermer */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <View style={styles.closeBtnBg}>
              <Ionicons name="close" size={24} color="#333" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={currentPopup.link_url ? 0.9 : 1}
            onPress={handlePress}
            style={styles.imageContainer}
          >
            {/* Loading indicator */}
            {imageLoading && !imageError && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#C62828" />
              </View>
            )}
            
            {/* Error state */}
            {imageError && (
              <View style={styles.errorContainer}>
                <Ionicons name="image-outline" size={48} color="#ccc" />
                <Text style={styles.errorText}>Image non disponible</Text>
              </View>
            )}
            
            {/* Image */}
            <Image
              source={{ uri: currentPopup.image_url }}
              style={[
                styles.image,
                (imageLoading || imageError) && styles.imageHidden
              ]}
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                console.log('❌ Erreur chargement image popup:', currentPopup.image_url);
                setImageLoading(false);
                setImageError(true);
              }}
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
    maxHeight: height * 0.75,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  closeBtnBg: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    minHeight: height * 0.4,
  },
  image: {
    width: '100%',
    height: height * 0.6,
  },
  imageHidden: {
    opacity: 0,
    position: 'absolute',
  },
  loadingContainer: {
    width: '100%',
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    width: '100%',
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
});
