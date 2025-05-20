import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, Avatar, Rating, Button, Divider } from 'react-native-elements';
import axios from 'axios';
import { API_URL } from '../../apis/config';

const ProviderDetailScreen = ({ route, navigation }) => {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const { providerId } = route.params;

  useEffect(() => {
    fetchProviderDetails();
  }, []);

  const fetchProviderDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/providers/${providerId}`);
      setProvider(response.data);
    } catch (error) {
      console.error('Error fetching provider details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.centered}>
        <Text>Provider not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <View style={styles.header}>
          <Avatar
            rounded
            size="xlarge"
            source={{ uri: provider.profile_image_url || 'https://via.placeholder.com/150' }}
            containerStyle={styles.avatar}
          />
          <Text h3 style={styles.name}>{provider.name}</Text>
          <View style={styles.ratingContainer}>
            <Rating
              readonly
              startingValue={provider.rating}
              imageSize={24}
              style={styles.rating}
            />
            <Text style={styles.ratingText}>
              {provider.rating.toFixed(1)} ({provider.total_ratings} reviews)
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>📍 Location:</Text>
            <Text style={styles.value}>{provider.city}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>💼 Experience:</Text>
            <Text style={styles.value}>{provider.experience} years</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>📱 Contact:</Text>
            <Text style={styles.value}>{provider.phone}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          {provider.services_offered.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceText}>• {service}</Text>
            </View>
          ))}
        </View>

        <Button
          title="Book Now"
          onPress={() => navigation.navigate('BookingConfirmation', { provider })}
          buttonStyle={styles.bookButton}
          titleStyle={styles.bookButtonText}
        />
      </Card>
    </ScrollView>
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
  card: {
    borderRadius: 15,
    margin: 10,
    padding: 15
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatar: {
    marginBottom: 10
  },
  name: {
    marginBottom: 5
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rating: {
    marginRight: 10
  },
  ratingText: {
    fontSize: 16,
    color: '#666'
  },
  divider: {
    marginVertical: 15
  },
  infoSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#666'
  },
  value: {
    flex: 2,
    fontSize: 16
  },
  servicesSection: {
    marginBottom: 20
  },
  serviceItem: {
    marginVertical: 5
  },
  serviceText: {
    fontSize: 16
  },
  bookButton: {
    backgroundColor: '#2089dc',
    borderRadius: 25,
    height: 50,
    marginTop: 10
  },
  bookButtonText: {
    fontSize: 18
  }
});

export default ProviderDetailScreen;