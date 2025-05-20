import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';

const LOCATION_TRACKING = 'location-tracking';
const LOCATION_UPDATE_INTERVAL = 15000; // 15 seconds

TaskManager.defineTask(LOCATION_TRACKING, async ({ data: { locations }, error }) => {
  if (error) {
    console.error('Location tracking error:', error);
    return;
  }

  const location = locations[0];
  if (location) {
    try {
      await axios.post('/api/locations/provider/update', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        booking_id: global.currentBookingId // Set this when accepting a booking
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  }
});

const LocationTracker = ({ bookingId, userLocation, providerLocation, isProvider }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io('http://localhost:5099', {
      query: {
        token: AsyncStorage.getItem('token')
      }
    });

    socket.current.on('provider_location_update', (data) => {
      if (data.provider_id === providerLocation?.provider_id) {
        setProviderLocation(data.location);
      }
    });

    socket.current.on('service_status_update', (data) => {
      if (data.provider_id === providerLocation?.provider_id) {
        setEta(data.eta);
      }
    });

    if (bookingId) {
      socket.current.emit('join_room', bookingId);
    }

    return () => {
      if (bookingId) {
        socket.current.emit('leave_room', bookingId);
      }
      socket.current.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      if (isProvider) {
        status = await Location.requestBackgroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Background location permission denied');
          return;
        }

        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 10, // minimum distance in meters
          foregroundService: {
            notificationTitle: 'TaskTakr Location Tracking',
            notificationBody: 'Tracking location for active booking'
          }
        });

        global.currentBookingId = bookingId;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    return () => {
      if (isProvider) {
        Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
        global.currentBookingId = null;
      }
    };
  }, [bookingId, isProvider]);

  const fitToMarkers = () => {
    if (mapRef.current && userLocation && providerLocation) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: providerLocation.lat, longitude: providerLocation.lng }
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        }
      );
    }
  };

  useEffect(() => {
    fitToMarkers();
  }, [userLocation, providerLocation]);

  if (errorMsg) {
    Alert.alert('Location Error', errorMsg);
    return null;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={isProvider}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng
            }}
            title="Service Location"
            pinColor="blue"
          />
        )}
        {providerLocation && (
          <Marker
            coordinate={{
              latitude: providerLocation.lat,
              longitude: providerLocation.lng
            }}
            title={`Service Provider ${eta ? `(ETA: ${eta} min)` : ''}`}
            pinColor="green"
          />
        )}
        {userLocation && providerLocation && (
          <Polyline
            coordinates={[
              { latitude: userLocation.lat, longitude: userLocation.lng },
              { latitude: providerLocation.lat, longitude: providerLocation.lng }
            ]}
            strokeColor="#000"
            strokeWidth={2}
          />
        )}
      </MapView>
      {eta && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>Estimated Time: {eta} minutes</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: '100%',
    height: '100%'
  },
  etaContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    elevation: 3
  },
  etaText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});

export default LocationTracker;