import mongoose from 'mongoose';

// Global variable to track connection status
let isConnected = false;

// Check if we're running on the server side
const isServer = typeof window === 'undefined';

export async function connectToDatabase() {
  // Only run on the server side
  if (!isServer) {
    console.log('=> MongoDB connection skipped on client side');
    return null;
  }

  // If already connected, return the existing connection
  if (isConnected) {
    console.log('=> Using existing database connection');
    return mongoose.connection.db;
  }

  try {
    console.log('=> Creating new database connection');
    
    // Set strictQuery to false to prepare for Mongoose 7 changes
    mongoose.set('strictQuery', false);
    
    // Get connection string from environment variables
    const connectionString = process.env.MONGO_CONNECTION_STRING;
    
    if (!connectionString) {
      throw new Error('MONGO_CONNECTION_STRING is not defined in environment variables');
    }
    
    // Connect to MongoDB
    await mongoose.connect(connectionString);
    
    isConnected = true;
    console.log('=> Connected to MongoDB');
    
    // Set up event listeners after connection is established
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      if (mongoose.connection) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
      }
      process.exit(0);
    });
    
    return mongoose.connection.db;
  } catch (error) {
    console.error('=> Error connecting to MongoDB:', error);
    throw error;
  }
}