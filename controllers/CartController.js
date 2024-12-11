import CartModel from "../models/Cart.js";
import FavourateModel from "../models/Favourate.js";
import ProductModel from "../models/Product.js";




class CartContoller {
    static AddProductToCart = async (req, res) => {
        const { productId, quantity } = req.body;

        try {
            const product = await ProductModel.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            let cart = await CartModel.findOne({ user: req.user._id });
            if (!cart) {
                cart = new CartModel({ user: req.user._id, products: [], totalPrice: 0 });
            }

            const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productId);

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;

            } else {
                cart.products.push({ product: productId, quantity });
            }

            cart.totalPrice += product.price * quantity;
            await cart.save();
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add product to cart' });
        }
    }

    // Update Cart (Change Quantity)
    static UpdateCart = async (req, res) => {
        const { productId, quantity } = req.body;
        try {
            const cart = await CartModel.findOne({ user: req.user._id }).populate('products.product');
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Find the index of the product in the cart
            const productIndex = cart.products.findIndex(item => item.product._id.toString() === productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            // Update the product quantity
            cart.products[productIndex].quantity = quantity;

            // Recalculate total price
            cart.totalPrice = cart.products.reduce((total, item) => total + (item.quantity * item.product.price), 0);

            // Save the updated cart
            await cart.save();  // Use save() to persist changes to the database

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update cart' });
        }
    }

    // Remove Product from Cart

    static RemoveProductFromCart = async (req, res) => {
        try {
            const cart = await CartModel.findOne({ user: req.user._id }).populate('products.product');
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Find the index of the product in the cart
            const productIndex = cart.products.findIndex(item => item.product._id.toString() === req.params.productId);
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            // Adjust total price by removing the product's price times its quantity
            const productPrice = cart.products[productIndex].product.price;
            cart.totalPrice -= productPrice * cart.products[productIndex].quantity;

            // Remove the product from the cart
            cart.products.splice(productIndex, 1);

            // Save the updated cart (without the deleted product)
            await cart.save();  // Use save() to persist the updated cart

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: 'Failed to remove product from cart' });
        }
    }

    static getCart = async (req, res) => {
        try {
            // Find the cart for the logged-in user and populate the product details
            const cart = await CartModel.findOne({ user: req.user._id }).populate('products.product');

            // Check if the cart exists for the user
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Return the cart to the client
            res.status(200).json(cart);
        } catch (error) {
            // Handle errors
            res.status(500).json({ error: 'Failed to retrieve cart' });
        }
    }


    // http://localhost:8002/api/cart/getproduct
    static getProductById = async (req, res) => {
        try {
            // Fetch the product ID from the request parameters
            const productId = req.params.productId;

            // Find the product by ID
            const product = await ProductModel.findById(productId);

            // If the product is not found, return a 404 error
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Return the found product to the client
            res.status(200).json(product);
        } catch (error) {
            // Handle errors, such as invalid product ID format
            res.status(500).json({ error: 'Failed to retrieve product' });
        }
    }
    static getProductsByCategory = async (req, res) => {
        try {
            // Fetch the category from the request parameters and convert it to lowercase
            const category = req.params.category.toLowerCase();

            // Find all products where the category matches, case-insensitive
            const products = await ProductModel.find({ category: { $regex: new RegExp(category, 'i') } });

            // If no products are found, return a 404 error
            if (products.length === 0) {
                return res.status(404).json({ message: 'No products found in this category' });
            }

            // Return the products found in the category
            res.status(200).json(products);
        } catch (error) {
            // Handle errors
            res.status(500).json({ error: 'Failed to retrieve products' });
        }
    }


    /// favourate 
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

}

export default CartContoller;