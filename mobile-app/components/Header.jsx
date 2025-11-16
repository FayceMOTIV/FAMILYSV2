import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography, Shadows } from '../constants/theme'

const Header = ({ title, showBack = false, onBackPress, rightAction }) => {
  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.header}>
        {showBack && (
          <Pressable onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray900} />
          </Pressable>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        {rightAction || <View style={styles.placeholder} />}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    ...Shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.gray900,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
})

export default Header
