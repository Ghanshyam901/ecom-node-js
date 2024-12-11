import mongoose from "mongoose";

const FavourateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
    }],

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const FavourateModel = mongoose.model("Favourate", FavourateSchema);
export default FavourateModel;