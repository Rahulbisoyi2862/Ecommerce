import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    phone: {
        type: String,
        required: true,

    },

    password: {
        type: String,
        required: true,

    },

    storeName: {
        type: String,
        required: true,
    },

    businessType: {
        type: String,
        required: true,
    },

    gstNumber: {
        type: String,
        required: true,

    },

    address: {
        type: String,
        required: true,
    },

    accountStatus: {
        type: String,
        required: true,
        enum: ["pending", "rejected", "active", "deactive"],
        default: "pending"
    },
},

    {
        timestamps: true
    }
)

export const sellerModel = mongoose.model("seller", sellerSchema)