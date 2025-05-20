import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from 'react-native';
import { Card, Button, Icon } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubscriptionScreen = ({ navigation }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);

  useEffect(() => {
    loadSubscriptions();
    loadUpcomingVisits();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('/api/subscriptions/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions');
    }
  };

  const loadUpcomingVisits = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get('/api/subscriptions/upcoming', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUpcomingVisits(response.data);
    } catch (error) {
      console.error('Error loading upcoming visits:', error);
      Alert.alert('Error', 'Failed to load upcoming visits');
    }
  };

  const handleSubscriptionAction = async (subscriptionId, action, date) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (action === 'reschedule') {
        await axios.put(`/api/subscriptions/${subscriptionId}/reschedule`, 
          { newDate: date },
          { headers: { Authorization: `Bearer ${token}` }}
        );
      } else {
        await axios.put(`/api/subscriptions/${subscriptionId}`,
          { status: action },
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }
      loadSubscriptions();
      loadUpcomingVisits();
    } catch (error) {
      console.error(`Error ${action} subscription:`, error);
      Alert.alert('Error', `Failed to ${action} subscription`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Active Subscriptions */}
      <Card containerStyle={styles.card}>
        <Card.Title>Active Subscriptions</Card.Title>
        {subscriptions.map((subscription) => (
          <View key={subscription._id} style={styles.subscriptionItem}>
            <Text style={styles.serviceName}>{subscription.service.name}</Text>
            <Text>Frequency: {subscription.frequency}</Text>
            <Text>Amount: ₹{subscription.totalAmount}</Text>
            <View style={styles.actionButtons}>
              {subscription.status === 'active' ? (
                <Button
                  title="Pause"
                  type="outline"
                  onPress={() => handleSubscriptionAction(subscription._id, 'paused')}
                  buttonStyle={styles.actionButton}
                />
              ) : (
                <Button
                  title="Resume"
                  type="outline"
                  onPress={() => handleSubscriptionAction(subscription._id, 'active')}
                  buttonStyle={styles.actionButton}
                />
              )}
              <Button
                title="Cancel"
                type="outline"
                onPress={() => handleSubscriptionAction(subscription._id, 'cancelled')}
                buttonStyle={[styles.actionButton, styles.cancelButton]}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Upcoming Visits */}
      <Card containerStyle={styles.card}>
        <Card.Title>Upcoming Visits</Card.Title>
        {upcomingVisits.map((visit) => (
          <View key={visit._id} style={styles.visitItem}>
            <Text style={styles.serviceName}>{visit.service}</Text>
            <Text>Date: {new Date(visit.nextServiceDate).toLocaleDateString()}</Text>
            <Text>Time: {visit.timeSlot}</Text>
            {visit.provider && <Text>Provider: {visit.provider}</Text>}
            <Button
              title="Reschedule"
              type="outline"
              onPress={() => navigation.navigate('RescheduleVisit', { visitId: visit._id })}
              buttonStyle={styles.actionButton}
            />
          </View>
        ))}
      </Card>
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
    marginBottom: 10
  },
  subscriptionItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    marginBottom: 10
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10
  },
  actionButton: {
    marginLeft: 10,
    borderRadius: 5
  },
  cancelButton: {
    borderColor: '#ff6b6b'
  },
  visitItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    marginBottom: 10
  }
});

export default SubscriptionScreen;