import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { Button, Text, Rating } from 'react-native-elements';
import axios from 'axios';

const ReviewScreen = ({ route, navigation }) => {
  const { bookingId, providerId, providerName } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (review.length < 10) {
      Alert.alert('Error', 'Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/reviews', {
        bookingId,
        rating,
        review
      });

      Alert.alert(
        'Success',
        'Thank you for your review!',
        [{ text: 'OK', onPress: () => navigation.navigate('MyBookings') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h4 style={styles.title}>How was your experience with {providerName}?</Text>
      
      <View style={styles.ratingContainer}>
        <Rating
          showRating
          type="star"
          startingValue={rating}
          onFinishRating={setRating}
          style={styles.rating}
          imageSize={40}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Share your experience (minimum 10 characters)"
        multiline
        numberOfLines={4}
        value={review}
        onChangeText={setReview}
      />

      <Button
        title="Submit Review"
        onPress={handleSubmit}
        loading={isSubmitting}
        containerStyle={styles.buttonContainer}
        disabled={rating === 0 || review.length < 10 || isSubmitting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    textAlign: 'center',
    marginBottom: 20
  },
  ratingContainer: {
    alignItems: 'center',
    marginVertical: 20
  },
  rating: {
    paddingVertical: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginVertical: 20,
    textAlignVertical: 'top',
    minHeight: 100
  },
  buttonContainer: {
    marginTop: 20,
    paddingHorizontal: 20
  }
});

export default ReviewScreen;