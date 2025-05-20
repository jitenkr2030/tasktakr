import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card } from 'react-native-elements';
import axios from 'axios';
import { API_URL } from '../config';

const categories = [
  { id: 1, name: 'Home Cleaning', icon: '🧹' },
  { id: 2, name: 'Plumbing', icon: '🔧' },
  { id: 3, name: 'Electrical', icon: '⚡' },
  { id: 4, name: 'Painting', icon: '🎨' },
  { id: 5, name: 'Carpentry', icon: '🔨' },
  { id: 6, name: 'Gardening', icon: '🌱' },
];

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCategoryPress = (category) => {
    navigation.navigate('Services', { categoryId: category.id, categoryName: category.name });
  };

  const retryConnection = async () => {
    setError(null);
    setLoading(true);
    try {
      await axios.get(`${API_URL}/api/health-check`);
      setLoading(false);
    } catch (err) {
      console.error('Connection error:', err);
      setError('Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    retryConnection();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text h3 style={styles.header}>Welcome to TaskTakr</Text>
      <Text style={styles.subheader}>Find the perfect service for your needs</Text>
      
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} onPress={() => handleCategoryPress(category)}>
          <Card containerStyle={styles.categoryCard}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  retryButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 5,
    color: '#2c3e50',
  },
  subheader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    color: '#7f8c8d',
    fontSize: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  categoryCard: {
    width: '45%',
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
  },
  categoryIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 10,
  },
  categoryName: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
});

export default HomeScreen;