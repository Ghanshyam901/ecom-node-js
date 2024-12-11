import mongoose from "mongoose";

const connectDb = async(DATABASE_URL)=>{
    try {
       const DB_OPTIONS={
        dbName:"jsonweb"
       } 
       await mongoose.connect(DATABASE_URL,DB_OPTIONS);
       console.log("db connected....")
    } catch (error) {
        console.log(error);
    }
}


export default connectDb;
