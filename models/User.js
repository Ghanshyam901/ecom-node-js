import mongoose from "mongoose";

// structure of table

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true

    }, password: {
        type: String,
        required: true,
        trim: true
    },
    tc: {
        type: Boolean,
        required: true,

    },
    otp: {
        type: String,

    },
    otpCreatedAt: {
        type: Date // Store the timestamp when the OTP is created
    },
    isVerified: {
        type: Boolean,
        default: false // Default is false until the email is verified
    }, isAdmin: {
        type: Boolean,
        default: false // Default is false, you can set it true for admin users
    }

})

//modal create

const UserModal = mongoose.model("User", userSchema);
export default UserModal;