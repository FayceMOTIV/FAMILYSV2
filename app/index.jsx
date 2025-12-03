import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Afficher le splash pendant 2 secondes
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Rediriger directement vers le HomeScreen
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    tintColor: '#FFFFFF',
  },
});
