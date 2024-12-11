import FavourateModel from "../models/Favourate.js";
import ProductModel from "../models/Product.js";

class FavourateController {
    static AddProductToFavourate = async (req, res) => {
        const { productId } = req.body;

        try {
            const product = await ProductModel.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            let favourate = await FavourateModel.findOne({ user: req.user._id });
            if (!favourate) {
                favourate = new FavourateModel({ user: req.user._id, products: [] });
            }

            const existingProductIndex = favourate.products.findIndex(item => item.product.toString() === productId);

            if (existingProductIndex !== -1) {
                return res.status(400).json({ message: 'Product already in favourites' });
            }

            favourate.products.push({ product: productId });



            await favourate.save();
            res.status(200).json(favourate);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add product to favourate' });
        }
    }
    static GetAllFavourateOfProduct = async (req, res) => {
        try {
            // Find the favourites list for the user
            let favourate = await FavourateModel.findOne({ user: req.user._id }).populate('products.product');

            // If no favourites list is found, return a message
            if (!favourate || favourate.products.length === 0) {
                return res.status(404).json({ message: 'No favourite products found' });
            }

            // Return the list of favourite products
            res.status(200).json(favourate.products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch favourite products' });
        }
    }

    static RemoveFromFavourate = async (req, res) => {
        const { productId } = req.body;

        try {
            // Check if the user has a favorites list
            let favourate = await FavourateModel.findOne({ user: req.user._id });
            if (!favourate) {
                return res.status(404).json({ message: 'Favourites list not found' });
            }

            // Find the index of the product in the favourites list
            const productIndex = favourate.products.findIndex(item => item.product.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in favourites' });
            }

            // Remove the product from the favourites list
            favourate.products.splice(productIndex, 1);

            // Save the updated favourites list
            await favourate.save();

            res.status(200).json({ message: 'Product removed from favourites', favourate });
        } catch (error) {
            res.status(500).json({ error: 'Failed to remove product from favourites' });
        }
    }
}


export default FavourateController;