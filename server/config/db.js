
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      retryReads: true,
      retryWrites: true
    });

    console.log('MongoDB Atlas Connected Successfully!');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    console.log('Please check your internet connection and try again.');
    throw error;
  }
};

module.exports = connectDB;
