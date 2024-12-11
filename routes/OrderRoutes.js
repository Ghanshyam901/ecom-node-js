
import express from "express";
const router = express.Router();
import OrderController from "../controllers/OrderContoller.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

// route level middleware - to protect route (always int the top)
router.use('/placeOrder', checkUserAuth)
router.use("/myorders", checkUserAuth);




//private route
router.post("/placeOrder", OrderController.PlaceOrder)
router.get("/myorders", OrderController.GetUserOrders);


export default router;