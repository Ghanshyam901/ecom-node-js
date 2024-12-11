import OrderModel from "../models/Order.js";
import ProductModel from "../models/Product.js";
import UserModal from "../models/User.js";

import cloudinary from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class AdminController {

    static AddProduct = async (req, res) => {
        try {
            const { name, description, price, category, stock, images } = req.body; // Expecting an array of image URLs

            // Create a new product
            const newProduct = new ProductModel({
                name,
                description,
                price,
                category,
                stock,
                images, // Save the array of image URLs
            });

            await newProduct.save();
            res.status(201).json({ message: 'Product added successfully', product: newProduct });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to add product' });
        }
    };



    static UpdateProduct = async (req, res) => {
        try {
            const updatedProduct = await ProductModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update product' });
        }
    }

    static DeleteProduct = async (req, res) => {
        try {
            await ProductModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete product' });
        }
    }

    static GetAllProducts = async (req, res) => {
        try {
            const user = await UserModal.findById(req.user._id);
            if (!user) {
                return res.status(403).json({ error: 'Access denied. Admins only.' });
            }
            const product = await ProductModel.find();
            if (!product) {
                return res.status(404).json({ error: 'No product found' });
            }

            res.status(200).json(product)

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch all products' });
        }
    }
    // static GetAllProductsPagination = async (req, res) => {
    //     try {
    //         const user = await UserModal.findById(req.user._id); // Fetch user data to verify admin
    //         if (!user || !user.isAdmin) {
    //             return res.status(403).json({ error: 'Access denied. Admins only.' });
    //         }

    //         // Get page number from query params (defaults to 1 if not provided)
    //         const page = parseInt(req.query.page) || 1;
    //         const limit = 10; // Products per page
    //         const skip = (page - 1) * limit; // Number of products to skip for pagination

    //         // Total product count for reference
    //         const totalProducts = await ProductModel.countDocuments();
    //         const totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

    //         // Check if the requested page exceeds the total number of pages
    //         if (page > totalPages) {
    //             return res.status(404).json({
    //                 error: `Page ${page} not found. There are only ${totalPages} pages available.`
    //             });
    //         }

    //         // Find products with pagination
    //         const products = await ProductModel.find()
    //             .skip(skip)
    //             .limit(limit);

    //         if (!products.length) {
    //             return res.status(404).json({ error: 'No products found' });
    //         }

    //         res.status(200).json({
    //             products,
    //             totalProducts,
    //             currentPage: page,
    //             totalPages // Return the total pages
    //         });

    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ error: 'Failed to fetch products' });
    //     }
    // }
    static GetAllProductsPagination = async (req, res) => {
        try {
            const user = await UserModal.findById(req.user._id); // Fetch user data to verify admin
            if (!user || !user.isAdmin) {
                return res.status(403).json({ error: 'Access denied. Admins only.' });
            }

            // Get page number from query params (defaults to 1 if not provided)
            const page = parseInt(req.query.page) || 1;
            const limit = 10; // Products per page
            const skip = (page - 1) * limit; // Number of products to skip for pagination

            // Get category from query params (optional)
            const category = req.query.category;

            // Build query object
            const query = {};
            if (category) {
                query.category = category; // Filter by category if provided
            }

            // Total product count for reference
            const totalProducts = await ProductModel.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / limit); // Calculate total pages

            // Check if the requested page exceeds the total number of pages
            if (page > totalPages) {
                return res.status(404).json({
                    error: `Page ${page} not found. There are only ${totalPages} pages available.`
                });
            }

            // Find products with pagination and category filtering
            const products = await ProductModel.find(query)
                .skip(skip)
                .limit(limit);

            if (!products.length) {
                return res.status(404).json({ error: 'No products found' });
            }

            res.status(200).json({
                products,
                totalProducts,
                currentPage: page,
                totalPages // Return the total pages
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }



    static GetAllOrders = async (req, res) => {
        try {
            // Check if the logged-in user is admin
            const user = await UserModal.findById(req.user._id);
            if (!user || !user.isAdmin) {
                return res.status(403).json({ error: 'Access denied. Admins only.' });
            }

            // Fetch all orders if the user is an admin
            const orders = await OrderModel.find();
            if (!orders) {
                return res.status(404).json({ error: 'No orders found' });
            }

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch all orders' });
        }
    };



}

export default AdminController;