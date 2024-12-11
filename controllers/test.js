import CartModel from "../models/Cart.js";
import OrderModel from "../models/Order.js";
import axios from 'axios';  // Assuming you're using axios for API calls

class OrderController2 {
    static PlaceOrder = async (req, res) => {
        const { addressId, quickCheckout, customerId, sessionId, deviceId } = req.body;

        try {
            // Fetch the cart
            const cart = await CartModel.findOne({ user: req.user._id }).populate('products.product');
            if (!cart || cart.products.length === 0) {
                return res.status(400).json({ message: 'Cart is empty' });
            }

            // Check stock availability
            for (let cartItem of cart.products) {
                const product = cartItem.product;
                if (product.stock < cartItem.quantity) {
                    return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                }
            }

            // Register for quick checkout if applicable
            let fedId, token;
            if (quickCheckout) {
                const quickCheckoutResponse = await axios.post('https://shopping.icicibank.com/corp/BANKAWAY?IWQRYTASKOBJNAME=bay_mc_login&BAY_BANKID=ICI&MD=P&AMT=&PID=000000000212&SPID=100000001620&ITC=00000016&PRN=12&CRN=INR&RU=http://www.google.co.in&CG=Y&USER_LANG_ID=001&UserType=1&AppType=corporate&QC=Y&REG=N&CUSTID=RETAIL1&SESID=1353GVHFEWGE8768&DEVID=JHKHI667', {
                    QC: 'Y', REG: 'N', CUSTID: customerId, SESID: sessionId, DEVID: deviceId, // Additional fields
                    amount: cart.totalPrice, /* Add other required fields */
                });

                if (quickCheckoutResponse.data.QCSTATUS === 'Y') {
                    fedId = quickCheckoutResponse.data.FEDID;
                    token = quickCheckoutResponse.data.TOKEN;
                } else {
                    return res.status(400).json({ message: 'Quick checkout registration failed' });
                }
            }

            // Proceed with payment (including OTP if quick checkout is used)
            if (quickCheckout) {
                // Generate OTP and validate payment via quick checkout
                const otpResponse = await axios.post('https://quickcheckout.icicibank.com/api/otp-generate', {
                    QC: 'Y', REG: 'Y', CUSTID: customerId, SESID: sessionId, DEVID: deviceId, FEDID: fedId, TOKEN: token,
                });

                // Handle OTP validation and final payment
                const paymentResponse = await axios.post('https://quickcheckout.icicibank.com/api/otp-validate', {
                    OTP: req.body.otp, TRANID: otpResponse.data.TRANID, // Add other fields
                });

                if (paymentResponse.data.STATUS !== 'SUCCESS') {
                    return res.status(400).json({ message: 'Payment failed' });
                }
            }

            // Decrease stock for each product
            for (let cartItem of cart.products) {
                const product = cartItem.product;
                product.stock -= cartItem.quantity;
                await product.save();  // Update stock
            }

            // Create the order
            const order = new OrderModel({
                user: req.user._id,
                items: cart.products,
                totalAmount: cart.totalPrice,
                address: addressId,
            });
            await order.save();

            // Empty the cart
            cart.products = [];
            cart.totalPrice = 0;
            await cart.save();

            res.status(200).json({ message: 'Order placed successfully', order });
        } catch (error) {
            res.status(500).json({ error: 'Failed to place order' });
        }
    }
}

export default OrderController2;
