import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5099/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        if (response.data.token) {
          await AsyncStorage.setItem('userToken', response.data.token);
          navigation.replace('Home');
        } else {
          Alert.alert('Error', 'Invalid registration response');
        }
      } catch (error) {
        console.error('Signup error:', error);
        Alert.alert(
          'Signup Failed',
          error.response?.data?.message || 'An error occurred during registration'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.header}>Create Account</Text>
      <Text style={styles.subheader}>Sign up to get started</Text>

      <View style={styles.form}>
        <Input
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          errorMessage={errors.name}
        />

        <Input
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={errors.email}
        />

        <Input
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          errorMessage={errors.password}
        />

        <Input
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          errorMessage={errors.confirmPassword}
        />

        <Button
          title="Sign Up"
          onPress={handleSignup}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={styles.linkContainer}
        >
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 50,
    marginBottom: 10,
    color: '#2c3e50',
  },
  subheader: {
    color: '#7f8c8d',
    fontSize: 16,
    marginBottom: 30,
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 5,
  },
  linkContainer: {
    alignItems: 'center',
  },
  link: {
    color: '#3498db',
    fontSize: 14,
  },
});

export default SignupScreen;