
import mongoose from "mongoose"

const registerSchema = new mongoose.Schema({
    userID:String,
    name:String,
    emailId:String,
    mobNo:String,
    password:String,
    shopName:String,
    shopMobNo:String,
    shopAddress:String,
    color:String,
    dbName:String,
    planExpiryDate:Date,
    suspendUser:Boolean,
    maxCustomerCount:Number,
    maxOrderCount:Number,
    maxEmployeeCount:Number,
    plan:String,
    shopCode:String
});
const registrationDetails = mongoose.model("registrationDetails", registerSchema);

export default registrationDetails

