import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Input, Button } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post('http://192.168.1.5:5099/api/auth/login', {
          email,
          password
        });

        if (response.data.token && response.data.user) {
          await AsyncStorage.setItem('userToken', response.data.token);
          await AsyncStorage.setItem('userRole', response.data.user.role);
          
          // Navigate based on user role
          if (response.data.user.role === 'admin') {
            navigation.replace('AdminDashboard');
          } else if (response.data.user.role === 'provider') {
            navigation.replace('ProviderDashboard');
          } else {
            navigation.replace('Home');
          }
        } else {
          Alert.alert('Error', 'Invalid login response');
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert(
          'Login Failed',
          error.response?.data?.message || 'An error occurred during login'
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.header}>Welcome Back</Text>
      <Text style={styles.subheader}>Login to manage your bookings</Text>

      <View style={styles.form}>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          errorMessage={errors.email}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          errorMessage={errors.password}
        />

        <Button
          title="Login"
          onPress={handleLogin}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
        />

        <TouchableOpacity 
          onPress={() => navigation.navigate('Signup')}
          style={styles.linkContainer}
        >
          <Text style={styles.link}>Don't have an account? Sign up</Text>
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

export default LoginScreen;