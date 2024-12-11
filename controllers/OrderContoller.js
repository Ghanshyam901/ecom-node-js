import crypto from 'crypto';
import axios from 'axios';
import CartModel from "../models/Cart.js";
import OrderModel from "../models/Order.js";

class OrderController {

    // Place Order
    static PlaceOrder = async (req, res) => {
        const { addressId } = req.body;
        const AES_KEY = 1234567891234567;
        const MERCHANT_ID = 110301;

        try {
            // Fetch the cart associated with the user and populate the product details
            const cart = await CartModel.findOne({ user: req.user._id }).populate('products.product');
            if (!cart || cart.products.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Check stock availability for each product in the cart
            for (let cartItem of cart.products) {
                const product = cartItem.product;
                if (product.stock < cartItem.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                }
            }

            // Prepare the EazyPay payment request payload
            const referenceNo = `REF${Date.now()}`; // Unique transaction reference
            const payload = {
                merchantid: MERCHANT_ID,
                ReferenceNo: referenceNo,
                transaction_amount: cart.totalPrice,
                returnurl: 'https://yourdomain.com/payment/callback',
                paymode: 3 // Net Banking as an example
            };

            // Encrypt the payload
            const encryptedData = OrderController.encryptAES(JSON.stringify(payload), AES_KEY);

            // Send payment request to EazyPay
            const paymentResponse = await axios.post('https://eazypay.icicibank.com/EazyPG', {
                MerchantId: MERCHANT_ID,
                EncryptedData: encryptedData
            });

            if (paymentResponse.data.Status !== 'Y') {
                return res.status(500).json({ error: 'Payment failed', details: paymentResponse.data });
            }

            // Decrease stock for each product in the cart
            for (let cartItem of cart.products) {
                const product = cartItem.product;
                product.stock -= cartItem.quantity;
                await product.save();
            }

            // Create a new order after successful payment
            const order = new OrderModel({
                user: req.user._id,
                items: cart.products,
                totalAmount: cart.totalPrice,
                address: addressId,
                paymentReference: referenceNo
            });
            await order.save();

            // Empty the cart after placing the order
            cart.products = [];
            cart.totalPrice = 0;
            await cart.save();

            res.status(200).json({ message: 'Order placed successfully', order });
        } catch (error) {
            res.status(500).json({ error: 'Failed to place order' });
        }
    }

    // AES encryption function for EazyPay
    static encryptAES(text, key) {
        const cipher = crypto.createCipheriv('aes-128-ecb', Buffer.from(key), null);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    // Get User Orders
    static GetUserOrders = async (req, res) => {
        try {
            const orders = await OrderModel.find({ user: req.user._id });
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }
}

export default OrderController;