require('dotenv').config();
const mongoose = require('mongoose');

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  retryWrites: true,
  w: 'majority',
  autoIndex: false,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  },
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 1000,
  retryReads: true,
  dbName: 'tasktakr'
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const environment = process.env.NODE_ENV || 'development';
      const uri = environment === 'production'
        ? process.env.MONGODB_PROD_URI || process.env.MONGODB_URI
        : process.env.MONGODB_URI || 'mongodb://localhost:27017/tasktakr';

      if (!uri) {
        throw new Error('MongoDB URI is not defined. Please set MONGODB_URI or MONGODB_PROD_URI in environment variables.');
      }
      
      await mongoose.connect(uri, mongoOptions);
      console.log(`Connected to MongoDB (${environment} environment)`);

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (err.name === 'MongoNetworkError') {
          console.error('Network connectivity issue detected');
        } else if (err.name === 'MongoServerSelectionError') {
          console.error('Unable to reach MongoDB servers');
        }
        mongoose.disconnect();
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(connectDB, 5000);
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });
    }
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    let errorMessage = 'Database connection error';
    let errorCode = 'DB_CONNECTION_ERROR';

    if (err.name === 'MongoNetworkError') {
      errorMessage = 'Network connectivity issue. Please check your internet connection';
      errorCode = 'DB_NETWORK_ERROR';
    } else if (err.name === 'MongoServerSelectionError') {
      errorMessage = 'Unable to reach MongoDB servers. Please check your connection string';
      errorCode = 'DB_SERVER_SELECTION_ERROR';
    } else if (err.name === 'MongoParseError') {
      errorMessage = 'Invalid MongoDB connection string';
      errorCode = 'DB_PARSE_ERROR';
    }

    throw {
      message: errorMessage,
      code: errorCode,
      originalError: err
    };
  }
};

module.exports = connectDB;