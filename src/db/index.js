import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`\n Connected to MongoDB. \n`,connectionInstance.connection.host,connectionInstance.connection.port);
  } catch (error) {
    console.error("Error connecting to MongoDB: ",error)    
  }
}

export default connectDB;