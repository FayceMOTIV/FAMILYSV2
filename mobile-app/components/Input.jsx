import { View, Text, TextInput, StyleSheet } from 'react-native'
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme'

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray400}
        style={[
          styles.input,
          error && styles.inputError
        ]}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.l,
  },
  label: {
    fontSize: Typography.s,
    fontWeight: Typography.medium,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.m,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    fontSize: Typography.m,
    color: Colors.gray900,
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
})

export default Input
