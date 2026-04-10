import mongoose, { ConnectOptions, Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Store the cached connection on globalThis so it survives module reloads in development.
const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalForMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalForMongoose.mongooseCache = cached;

export async function connectToDatabase(): Promise<Mongoose> {
  // Return the existing connection immediately if already connected.
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options: ConnectOptions = {
      // Disable command buffering so connection issues fail fast.
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, options);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise so future retries are possible after a failure.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
