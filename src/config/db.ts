import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

const connectToDB = async (): Promise<void> => {
    try {
        const { connection } = await mongoose.connect(
            process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms'
        );

        if (connection) {
            console.log(`Connected to MongoDB: ${connection.host}`);
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export default connectToDB;
