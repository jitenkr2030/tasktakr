const { Expo } = require('expo-server-sdk');
const expo = new Expo();

// Send push notification
exports.sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error('Invalid Expo push token');
      return;
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data
    };

    const chunks = expo.chunkPushNotifications([message]);

    for (let chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }
  } catch (error) {
    console.error('Push notification error:', error);
  }
};