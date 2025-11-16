import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native'
import { useState } from 'react'
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme'

const NotesInput = ({ value, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const quickSuggestions = [
    'Sans oignons',
    'Sans cornichons', 
    'Bien cuit',
    'Peu cuit',
    'Sans sauce',
    'Supplément sauce'
  ]
  
  const handleSuggestionPress = (suggestion) => {
    const currentNotes = value || ''
    const newNotes = currentNotes ? `${currentNotes}, ${suggestion}` : suggestion
    onChange(newNotes)
  }
  
  return (
    <View style={styles.container}>
      <Pressable 
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
      >
        <Text style={styles.title}>Instructions spéciales</Text>
        <Text style={styles.toggle}>{isExpanded ? '▲' : '▼'}</Text>
      </Pressable>
      
      {isExpanded && (
        <View style={styles.content}>
          {/* Quick suggestions */}
          <View style={styles.suggestionsContainer}>
            {quickSuggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                onPress={() => handleSuggestionPress(suggestion)}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
          
          {/* Text input */}
          <TextInput
            style={styles.input}
            placeholder="Ex: Sans oignons, bien cuit..."
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={3}
            placeholderTextColor={Colors.gray400}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.m,
    overflow: 'hidden',
    marginBottom: Spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.m,
  },
  title: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  toggle: {
    fontSize: Typography.m,
    color: Colors.gray600,
  },
  content: {
    padding: Spacing.m,
    paddingTop: 0,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.s,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  suggestionText: {
    fontSize: Typography.s,
    color: Colors.gray700,
    fontWeight: Typography.medium,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
    fontSize: Typography.m,
    color: Colors.gray900,
    borderWidth: 1,
    borderColor: Colors.gray200,
    minHeight: 80,
    textAlignVertical: 'top',
  },
})

export default NotesInput
