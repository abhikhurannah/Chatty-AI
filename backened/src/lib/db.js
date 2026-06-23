import mongoose from 'mongoose';

export const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`mongodb connect:${conn.connection.host}`);

    }catch(e){
        console.error("Error connecting to MongoDB",e);
    }
}