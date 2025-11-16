import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme'

const OptionSelector = ({ optionGroup, selectedOptions, onOptionChange }) => {
  const isSingleChoice = optionGroup.type === 'single'
  
  const handleOptionPress = (choice) => {
    if (isSingleChoice) {
      onOptionChange(optionGroup.id, choice)
    } else {
      // Multi-select
      const currentSelections = selectedOptions[optionGroup.id] || []
      const isSelected = currentSelections.some(c => c.id === choice.id)
      
      if (isSelected) {
        // Remove
        const newSelections = currentSelections.filter(c => c.id !== choice.id)
        onOptionChange(optionGroup.id, newSelections)
      } else {
        // Add
        const newSelections = [...currentSelections, choice]
        onOptionChange(optionGroup.id, newSelections)
      }
    }
  }
  
  const isChoiceSelected = (choice) => {
    if (isSingleChoice) {
      return selectedOptions[optionGroup.id]?.id === choice.id
    } else {
      const selections = selectedOptions[optionGroup.id] || []
      return selections.some(c => c.id === choice.id)
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{optionGroup.name}</Text>
        {optionGroup.required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Requis</Text>
          </View>
        )}
      </View>
      
      {optionGroup.description && (
        <Text style={styles.description}>{optionGroup.description}</Text>
      )}
      
      <View style={styles.choicesContainer}>
        {optionGroup.choices?.map((choice) => {
          const isSelected = isChoiceSelected(choice)
          
          return (
            <Pressable
              key={choice.id}
              onPress={() => handleOptionPress(choice)}
              style={({ pressed }) => [
                styles.choiceItem,
                isSelected && styles.choiceItemSelected,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <View style={styles.choiceContent}>
                <View style={styles.choiceLeft}>
                  {/* Checkbox/Radio */}
                  <View style={[
                    styles.checkbox,
                    isSingleChoice && styles.radio,
                    isSelected && styles.checkboxSelected
                  ]}>
                    {isSelected && (
                      <Ionicons 
                        name={isSingleChoice ? "radio-button-on" : "checkmark"} 
                        size={16} 
                        color={Colors.white} 
                      />
                    )}
                  </View>
                  
                  <View style={styles.choiceInfo}>
                    <Text style={styles.choiceName}>{choice.name}</Text>
                    {choice.description && (
                      <Text style={styles.choiceDescription}>{choice.description}</Text>
                    )}
                  </View>
                </View>
                
                {/* Price */}
                {choice.delta_price && choice.delta_price > 0 && (
                  <Text style={styles.choicePrice}>+{choice.delta_price.toFixed(2)}€</Text>
                )}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  title: {
    fontSize: Typography.l,
    fontWeight: Typography.bold,
    color: Colors.gray900,
  },
  requiredBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.s,
  },
  requiredText: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontWeight: Typography.semibold,
  },
  description: {
    fontSize: Typography.s,
    color: Colors.gray600,
    marginBottom: Spacing.m,
  },
  choicesContainer: {
    gap: Spacing.m,
  },
  choiceItem: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.m,
    padding: Spacing.m,
  },
  choiceItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  choiceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.m,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    borderRadius: 12,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  choiceInfo: {
    flex: 1,
  },
  choiceName: {
    fontSize: Typography.m,
    fontWeight: Typography.semibold,
    color: Colors.gray900,
  },
  choiceDescription: {
    fontSize: Typography.s,
    color: Colors.gray600,
    marginTop: Spacing.xs,
  },
  choicePrice: {
    fontSize: Typography.m,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
})

export default OptionSelector
