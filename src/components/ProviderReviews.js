import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Avatar, Rating, Divider } from 'react-native-elements';
import axios from 'axios';

const ProviderReviews = ({ providerId, language = 'en' }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    reviewCount: 0,
    currentPage: 1,
    totalPages: 1
  });

  const fetchReviews = async (page = 1) => {
    try {
      const response = await axios.get(`/api/providers/${providerId}/reviews?page=${page}`);
      setReviews(page === 1 ? response.data.reviews : [...reviews, ...response.data.reviews]);
      setStats({
        averageRating: response.data.averageRating,
        reviewCount: response.data.reviewCount,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [providerId]);

  const loadMoreReviews = () => {
    if (stats.currentPage < stats.totalPages) {
      fetchReviews(stats.currentPage + 1);
    }
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Avatar
          rounded
          size="small"
          source={item.user.profile_image_url ? { uri: item.user.profile_image_url } : null}
          title={item.user.name.charAt(0)}
        />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
          </Text>
        </View>
      </View>
      <Rating
        readonly
        startingValue={item.rating}
        imageSize={16}
        style={styles.rating}
      />
      <Text style={styles.reviewText}>{item.review_text}</Text>
      <Divider style={styles.divider} />
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text h4 style={styles.averageRating}>{stats.averageRating.toFixed(1)}</Text>
        <Rating
          readonly
          startingValue={stats.averageRating}
          imageSize={20}
          style={styles.averageStars}
        />
        <Text style={styles.totalReviews}>
          {language === 'hi' ? `${stats.reviewCount} समीक्षाएँ` : `${stats.reviewCount} reviews`}
        </Text>
      </View>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item._id}
        onEndReached={loadMoreReviews}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  averageStars: {
    marginVertical: 5
  },
  totalReviews: {
    color: '#7f8c8d',
    marginTop: 5
  },
  reviewItem: {
    marginBottom: 15
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  reviewHeaderText: {
    marginLeft: 10
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  reviewDate: {
    color: '#7f8c8d',
    fontSize: 12
  },
  rating: {
    alignItems: 'flex-start',
    marginBottom: 5
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2c3e50'
  },
  divider: {
    marginTop: 15
  }
});

export default ProviderReviews;