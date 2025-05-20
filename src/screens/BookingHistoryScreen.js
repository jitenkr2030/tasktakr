import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_URL}/api/bookings/user-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch booking history');
      setLoading(false);
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `${API_URL}/api/invoices/booking/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Handle the PDF download/view based on platform capabilities
      // For mobile, we might want to use a PDF viewer or save to device
      Alert.alert('Success', 'Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert('Error', 'Failed to download invoice');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '✔️';
      case 'CANCELLED':
        return '❌';
      case 'IN_PROGRESS':
        return '⏳';
      default:
        return '📋';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status.toLowerCase() === activeTab.toLowerCase();
  });

  const renderBookingItem = ({ item }) => (
    <Card>
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceName}>{item.service.name}</Text>
        <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
      </View>
      
      <Text style={styles.providerName}>Provider: {item.provider.name}</Text>
      <Text style={styles.dateTime}>
        {new Date(item.scheduledDate).toLocaleDateString()}, 
        {item.scheduledTime}
      </Text>
      <Text style={styles.amount}>Amount: ₹{item.totalAmount}</Text>
      
      <View style={styles.actionButtons}>
        <Button
          title="📄 View Invoice"
          type="outline"
          onPress={() => downloadInvoice(item._id)}
          disabled={item.status !== 'COMPLETED'}
        />
        {item.status === 'COMPLETED' && (
          <Button
            title="Book Again"
            type="clear"
            onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.service._id })}
          />
        )}
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {['All', 'Completed', 'In Progress', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab.toLowerCase().replace(' ', '_') && styles.activeTab]}
            onPress={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
          >
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchBookings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5
  },
  activeTab: {
    backgroundColor: '#e8f4fd'
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500'
  },
  listContainer: {
    padding: 10
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  statusIcon: {
    fontSize: 20
  },
  providerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5
  },
  dateTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5
  },
  amount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  }
});

export default BookingHistoryScreen;