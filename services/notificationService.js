import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';
import axios from 'axios';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Enregistrer pour les push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (!Device.isDevice) {
    console.log('Push notifications need a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Permission for push notifications denied');
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id'
  })).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C62828',
    });
  }

  return token;
}

// Sauvegarder le token push pour un client
export async function savePushToken(email, pushToken) {
  try {
    await axios.post(`${API_BASE_URL}/customers/push-token`, {
      email,
      push_token: pushToken
    });
    console.log('Push token saved');
    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

// Recuperer les notifications du client
export async function getCustomerNotifications(email) {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications/customer/${email}`);
    return response.data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Marquer une notification comme lue
export async function markNotificationAsRead(notificationId) {
  try {
    await axios.patch(`${API_BASE_URL}/notifications/${notificationId}/read`);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Ecouter les notifications
export function addNotificationListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

// Ecouter les reponses aux notifications (quand utilisateur clique)
export function addNotificationResponseListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
