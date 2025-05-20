import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Input, Overlay } from 'react-native-elements';
import axios from 'axios';
import { API_URL } from '../../apis/config';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { provider } = route.params;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);

  const handleBooking = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/bookings`, {
        provider_id: provider._id,
        service_id: provider.category_id,
        date,
        time,
        notes
      });
      setBookingStatus(response.data);
      setShowConfirmation(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderConfirmationOverlay = () => (
    <Overlay
      isVisible={showConfirmation}
      onBackdropPress={() => navigation.navigate('MyBookings')}
      overlayStyle={styles.overlay}
    >
      <View style={styles.confirmationContent}>
        <Text h4 style={styles.confirmationTitle}>Booking Confirmed!</Text>
        <Text style={styles.confirmationText}>
          Your booking has been successfully created and is pending confirmation.
        </Text>
        <Text style={styles.bookingDetails}>
          Provider: {provider.name}\n
          Date: {date}\n
          Time: {time}
        </Text>
        <Button
          title="View My Bookings"
          onPress={() => navigation.navigate('MyBookings')}
          buttonStyle={styles.viewBookingsButton}
        />
      </View>
    </Overlay>
  );

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Card.Title>Booking Details</Card.Title>
        <Card.Divider />

        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>{provider.name}</Text>
          <Text style={styles.providerService}>{provider.category_id.name}</Text>
        </View>

        <Input
          label="Date"
          placeholder="Select date"
          value={date}
          onChangeText={setDate}
          leftIcon={{ type: 'font-awesome', name: 'calendar' }}
        />

        <Input
          label="Time"
          placeholder="Select time"
          value={time}
          onChangeText={setTime}
          leftIcon={{ type: 'font-awesome', name: 'clock-o' }}
        />

        <Input
          label="Additional Notes"
          placeholder="Any special requirements?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          title="Confirm Booking"
          onPress={handleBooking}
          loading={loading}
          buttonStyle={styles.confirmButton}
        />
      </Card>

      {renderConfirmationOverlay()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  card: {
    borderRadius: 10,
    margin: 15,
    padding: 15
  },
  providerInfo: {
    marginBottom: 20,
    alignItems: 'center'
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  providerService: {
    fontSize: 16,
    color: '#666'
  },
  confirmButton: {
    backgroundColor: '#2089dc',
    borderRadius: 25,
    height: 50,
    marginTop: 20
  },
  overlay: {
    width: '80%',
    borderRadius: 10,
    padding: 20
  },
  confirmationContent: {
    alignItems: 'center'
  },
  confirmationTitle: {
    marginBottom: 15,
    textAlign: 'center'
  },
  confirmationText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666'
  },
  bookingDetails: {
    marginBottom: 20,
    lineHeight: 24
  },
  viewBookingsButton: {
    width: 200,
    borderRadius: 25
  }
});

export default BookingConfirmationScreen;