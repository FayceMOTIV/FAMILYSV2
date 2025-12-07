import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Gift, Star, Trophy, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { getSurpriseStatus, playSurprise, claimReward, getMyRewards } from '../../services/surprise';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Loader from '../../components/Loader';

export default function Surprise() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [status, setStatus] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [wonReward, setWonReward] = useState(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);
  
  const loadData = async () => {
    try {
      const [statusRes, rewardsRes] = await Promise.all([
        getSurpriseStatus(),
        getMyRewards()
      ]);
      setStatus(statusRes);
      setRewards(rewardsRes.rewards || []);
    } catch (error) {
      console.error('Error loading surprise:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlay = async () => {
    if (!status?.can_play) {
      Alert.alert(
        'Déjà joué',
        'Vous avez déjà joué aujourd’hui. Revenez demain !'
      );
      return;
    }
    
    setPlaying(true);
    
    try {
      const response = await playSurprise();
      
      if (response.success && response.reward) {
        setWonReward(response.reward);
        
        // Show reward alert
        setTimeout(() => {
          Alert.alert(
            '🎉 Félicitations !',
            `Vous avez gagné: ${response.reward.reward_name}\n\nValeur: ${response.reward.reward_value || 'Gratuit'}`,
            [
              {
                text: 'Super !',
                onPress: () => {
                  setWonReward(null);
                  loadData();
                }
              }
            ]
          );
        }, 1500);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de jouer. Réessayez plus tard.');
      console.error('Play error:', error);
    } finally {
      setPlaying(false);
    }
  };
  
  const handleClaim = async (playId) => {
    try {
      await claimReward(playId);
      Alert.alert('Récompense réclamée !', 'Votre récompense a été appliquée.');
      loadData();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de réclamer la récompense.');
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (loading) {
    return <Loader />;
  }
  
  const unclaimedRewards = status?.unclaimed_rewards || [];
  
  return (
    <ScrollView className="flex-1 bg-[#f5f5f5]">
      {/* Header */}
      <View className="bg-gradient-to-br from-[#FFD54F] to-[#FFC107] px-6 pt-12 pb-8">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-3">
            <Gift size={40} color="#FFC107" />
          </View>
          <Text className="text-[#1a1a1a] text-3xl font-bold mb-2">
            Surprise du Jour
          </Text>
          <Text className="text-[#333333] text-center">
            Tentez votre chance une fois par jour !
          </Text>
        </View>
      </View>
      
      {/* Play Card */}
      <View className="px-6 -mt-6 mb-4">
        <Card className="p-6">
          {status?.can_play ? (
            <View className="items-center">
              <Sparkles size={48} color="#FFD54F" className="mb-3" />
              <Text className="text-2xl font-bold text-[#1a1a1a] mb-2 text-center">
                Vous pouvez jouer !
              </Text>
              <Text className="text-[#666666] text-center mb-6">
                Cliquez sur le bouton pour découvrir votre surprise
              </Text>
              <Button 
                onPress={handlePlay}
                loading={playing}
                size="lg"
                className="w-full"
              >
                {playing ? 'Tirage en cours...' : '🎲 Jouer maintenant'}
              </Button>
            </View>
          ) : (
            <View className="items-center">
              <Trophy size={48} color="#CCCCCC" className="mb-3" />
              <Text className="text-xl font-bold text-[#1a1a1a] mb-2">
                Déjà joué aujourd'hui
              </Text>
              <Text className="text-[#666666] text-center">
                Revenez demain pour tenter votre chance !
              </Text>
            </View>
          )}
        </Card>
      </View>
      
      {/* Unclaimed Rewards */}
      {unclaimedRewards.length > 0 && (
        <View className="px-6 mb-4">
          <Text className="text-xl font-bold text-[#1a1a1a] mb-3">
            Récompenses à réclamer
          </Text>
          {unclaimedRewards.map((reward) => (
            <Card key={reward.id} className="mb-3 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-bold text-[#1a1a1a] text-lg mb-1">
                    {reward.reward_name}
                  </Text>
                  <Text className="text-[#666666] text-sm">
                    Type: {reward.reward_type}
                  </Text>
                  {reward.reward_value && (
                    <Text className="text-[#C62828] font-semibold mt-1">
                      Valeur: {reward.reward_value}
                    </Text>
                  )}
                </View>
                <Button 
                  onPress={() => handleClaim(reward.id)}
                  size="sm"
                >
                  Réclamer
                </Button>
              </View>
            </Card>
          ))}
        </View>
      )}
      
      {/* Rewards History */}
      <View className="px-6 pb-8">
        <Text className="text-xl font-bold text-[#1a1a1a] mb-3">
          Historique
        </Text>
        
        {rewards.length === 0 ? (
          <Card className="p-6">
            <Text className="text-[#666666] text-center">
              Aucune récompense pour le moment
            </Text>
          </Card>
        ) : (
          rewards.slice(0, 10).map((reward) => (
            <Card key={reward.id} className="mb-3 p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-[#1a1a1a] mb-1">
                    {reward.reward_name}
                  </Text>
                  <Text className="text-[#666666] text-sm">
                    {new Date(reward.played_at).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Badge variant={reward.claimed ? 'success' : 'warning'}>
                  {reward.claimed ? 'Réclamé' : 'En attente'}
                </Badge>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}
