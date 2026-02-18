import mongoose from "mongoose";

const sellerOtpSchema = new mongoose.Schema({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    expiry: {
        type: Date,
        required: true,
    }
})

export default mongoose.model("SellerOtp", sellerOtpSchema);