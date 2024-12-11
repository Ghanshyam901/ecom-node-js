import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    images: [{
        type: String,
        required: true // Array of image URLs
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ProductModel = mongoose.model("Product", productSchema);
export default ProductModel;