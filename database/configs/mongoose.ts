import mongoose from 'mongoose';
import { winstonLogger } from '../../utils/winstonLogger.js';

/**
 * Mongoose strictQuery setting.
 * (from old dbConn.js)
 */
mongoose.set('strictQuery', false);

const connectToDB = async () => {
  try {
    const dbUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms';
    if (!dbUrl) {
      winstonLogger.error('MONGO_URI not found in environment variables');
      process.exit(1);
    }
    
    const { connection } = await mongoose.connect(dbUrl);

    if (connection) {
      winstonLogger.info(`Connected to MongoDB: ${connection.host}`);
    }
  } catch (error) {
    winstonLogger.error(`MongoDB Connection Error: ${error}`);
    process.exit(1);
  }
};

export default connectToDB;