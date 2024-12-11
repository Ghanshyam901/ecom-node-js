import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const WishlistModel = mongoose.model("Wishlist", wishlistSchema);
export default WishlistModel;