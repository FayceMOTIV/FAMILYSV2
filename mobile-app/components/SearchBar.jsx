import { View, TextInput, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme'

const SearchBar = ({ value, onChangeText, placeholder = 'Rechercher...' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={Colors.gray400} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray400}
        style={styles.input}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.m,
    ...Shadows.small,
  },
  icon: {
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: Typography.m,
    color: Colors.gray900,
  },
})

export default SearchBar
