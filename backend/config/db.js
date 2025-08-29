const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://mongo:27017/taskmanager';
  let retries = 10;

  while (retries) {
    try {
      const conn = await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      break;
    } catch (err) {
      console.error(
        `MongoDB connection failed. Retries left: ${retries}. Error: ${err.message}`
      );
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000)); // wait 5 seconds before retry
    }
  }

  if (retries === 0) {
    console.error('Could not connect to MongoDB. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
