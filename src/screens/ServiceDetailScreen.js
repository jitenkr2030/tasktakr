import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, TextInput, Snackbar, ActivityIndicator } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ServiceDetailScreen = ({ route, navigation }) => {
  const { serviceId } = route.params;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`http://localhost:5099/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setService(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Failed to load service details');
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleBooking = async () => {
    if (!address.trim()) {
      setSnackbarMessage('Please enter your address');
      setSnackbarVisible(true);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post('http://localhost:5099/api/bookings', {
        service_id: serviceId,
        date: date.toISOString().split('T')[0],
        time,
        address,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbarMessage('Booking successful!');
      setSnackbarVisible(true);
      navigation.navigate('MyBookings');
    } catch (err) {
      console.error('Booking error:', err);
      setSnackbarMessage(err.response?.data?.message || 'Failed to create booking');
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Paragraph style={styles.error}>{error}</Paragraph>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{service?.name}</Title>
          <Paragraph>{service?.description}</Paragraph>
          <Paragraph style={styles.price}>
            Price Range: ₹{service?.priceRange.min} - ₹{service?.priceRange.max}
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.bookingCard}>
        <Card.Content>
          <Title>Book Service</Title>
          
          <Button 
            mode="outlined" 
            onPress={() => setShowDatePicker(true)} 
            style={styles.input}
          >
            {date.toLocaleDateString()}
          </Button>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <TextInput
            label="Preferred Time"
            value={time}
            onChangeText={setTime}
            style={styles.input}
            placeholder="e.g. 10:00 AM"
          />

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            multiline
            numberOfLines={3}
          />

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            style={styles.input}
            multiline
            numberOfLines={2}
          />

          <Button 
            mode="contained" 
            onPress={handleBooking}
            style={styles.bookButton}
            labelStyle={styles.buttonLabel}
          >
            Book Now
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 10,
    elevation: 4,
  },
  bookingCard: {
    margin: 10,
    elevation: 4,
    backgroundColor: '#fff',
  },
  input: {
    marginVertical: 8,
  },
  price: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: '#2ecc71',
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  snackbar: {
    backgroundColor: '#333',
  },
});

export default ServiceDetailScreen;