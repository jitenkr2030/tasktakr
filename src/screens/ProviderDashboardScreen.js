import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-elements';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProviderDashboardScreen = ({ navigation }) => {
  const [dashboardData, setDashboardData] = useState({
    monthlyEarnings: 0,
    totalBookings: 0,
    averageRating: 0,
    upcomingBookings: []
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarBookings, setCalendarBookings] = useState({});

  useEffect(() => {
    loadDashboardData();
    loadCalendarData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const providerId = await AsyncStorage.getItem('userId');
      
      const response = await axios.get(`/api/providers/${providerId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadCalendarData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const providerId = await AsyncStorage.getItem('userId');
      
      const response = await axios.get(`/api/providers/${providerId}/calendar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Format bookings for calendar
      const markedDates = {};
      response.data.forEach(booking => {
        const date = booking.date.split('T')[0];
        markedDates[date] = {
          marked: true,
          dotColor: getStatusColor(booking.status)
        };
      });
      
      setCalendarBookings(markedDates);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FFC107';
      case 'completed': return '#2196F3';
      default: return '#757575';
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    // Load bookings for selected date
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      await axios.put(`/api/bookings/${bookingId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh data
      loadDashboardData();
      loadCalendarData();
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card containerStyle={styles.statsCard}>
          <Card.Title>This Month's Earnings</Card.Title>
          <Text style={styles.statsValue}>₹{dashboardData.monthlyEarnings}</Text>
        </Card>
        
        <Card containerStyle={styles.statsCard}>
          <Card.Title>Total Bookings</Card.Title>
          <Text style={styles.statsValue}>{dashboardData.totalBookings}</Text>
        </Card>
        
        <Card containerStyle={styles.statsCard}>
          <Card.Title>Average Rating</Card.Title>
          <Text style={styles.statsValue}>⭐ {dashboardData.averageRating}</Text>
        </Card>
      </View>

      {/* Calendar View */}
      <Card containerStyle={styles.calendarCard}>
        <Card.Title>Booking Calendar</Card.Title>
        <Calendar
          markedDates={calendarBookings}
          onDayPress={handleDateSelect}
          theme={{
            todayTextColor: '#2196F3',
            selectedDayBackgroundColor: '#2196F3',
            arrowColor: '#2196F3',
          }}
        />
      </Card>

      {/* Upcoming Bookings */}
      <Card containerStyle={styles.bookingsCard}>
        <Card.Title>Upcoming Bookings</Card.Title>
        {dashboardData.upcomingBookings.map((booking) => (
          <View key={booking._id} style={styles.bookingItem}>
            <Text style={styles.bookingTitle}>{booking.service}</Text>
            <Text>{booking.client_name} • {booking.time}</Text>
            <View style={styles.actionButtons}>
              {booking.status === 'pending' && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => handleBookingAction(booking._id, 'confirm')}
                  >
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleBookingAction(booking._id, 'reject')}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              {booking.status === 'confirmed' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => handleBookingAction(booking._id, 'complete')}
                >
                  <Text style={styles.buttonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  statsCard: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  calendarCard: {
    borderRadius: 10,
    marginHorizontal: 10,
  },
  bookingsCard: {
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  bookingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProviderDashboardScreen;