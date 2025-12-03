import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RewardCardProps {
  emoji: string;
  title: string;
  value?: string;
  expiration?: string;
  status?: 'active' | 'used' | 'expired';
  onPress?: () => void;
  showButton?: boolean;
  buttonText?: string;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  emoji,
  title,
  value,
  expiration,
  status = 'active',
  onPress,
  showButton = false,
  buttonText = 'Utiliser'
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return '#10B981';
      case 'used': return '#6B7280';
      case 'expired': return '#EF4444';
      default: return '#10B981';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active': return 'Active';
      case 'used': return 'Utilisée';
      case 'expired': return 'Expirée';
      default: return '';
    }
  };

  return (
    <View style={[styles.card, status === 'used' && styles.cardUsed]}>
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      {value && <Text style={styles.value}>{value}</Text>}
      
      {expiration && (
        <Text style={styles.expiration}>
          ⏰ Expire le {expiration}
        </Text>
      )}
      
      {showButton && status === 'active' && onPress && (
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardUsed: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 40,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  expiration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RewardCard;
