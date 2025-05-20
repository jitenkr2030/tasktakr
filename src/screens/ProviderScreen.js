import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Card, Text, Avatar, Rating, Button } from 'react-native-elements';
import axios from 'axios';
import { API_URL } from '../config';

const ProviderScreen = ({ route, navigation }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categoryId } = route.params;

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/providers/category?category_id=${categoryId}`);
      setProviders(response.data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProvider = ({ item }) => (
    <Card containerStyle={styles.card}>
      <View style={styles.cardHeader}>
        <Avatar
          rounded
          size="medium"
          source={{ uri: item.profile_image_url || 'https://via.placeholder.com/150' }}
        />
        <View style={styles.headerInfo}>
          <Text h4>{item.name}</Text>
          <Rating
            readonly
            startingValue={item.rating}
            imageSize={20}
            style={styles.rating}
          />
          <Text>({item.total_ratings} reviews)</Text>
        </View>
      </View>

      <Card.Divider />

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>📍 {item.city}</Text>
        <Text style={styles.detailText}>💼 {item.experience} years experience</Text>
        <Text style={styles.detailText}>🛠 Services:</Text>
        <View style={styles.servicesList}>
          {item.services_offered.map((service, index) => (
            <Text key={index} style={styles.serviceItem}>• {service}</Text>
          ))}
        </View>
      </View>

      <Button
        title="View Details"
        onPress={() => navigation.navigate('ProviderDetail', { providerId: item._id })}
        buttonStyle={styles.button}
      />
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={providers}
        renderItem={renderProvider}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  list: {
    padding: 10
  },
  card: {
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  headerInfo: {
    marginLeft: 15,
    flex: 1
  },
  rating: {
    marginVertical: 5
  },
  detailsContainer: {
    marginVertical: 10
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5
  },
  servicesList: {
    marginLeft: 10
  },
  serviceItem: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2
  },
  button: {
    backgroundColor: '#2089dc',
    borderRadius: 25,
    marginTop: 10
  }
});

export default ProviderScreen;