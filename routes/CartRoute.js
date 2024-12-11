import express from "express";
const router = express.Router();
import CartContoller from "../controllers/CartController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

// route level middleware - to protect route (always int the top)
router.use('/addToCart', checkUserAuth)
router.use("/updateCart", checkUserAuth);
router.use("/remove/:productId", checkUserAuth)
router.use("/getCart", checkUserAuth)
router.use("/getProductById/:productId", checkUserAuth)
router.use("/category/:category", checkUserAuth)
router.use("/AddProductToFavourate", checkUserAuth)


//private route
router.post("/addToCart", CartContoller.AddProductToCart)
router.put("/updateCart", CartContoller.UpdateCart);
router.delete("/remove/:productId", CartContoller.RemoveProductFromCart);
router.get("/getCart", CartContoller.getCart)
router.get("/getProductById/:productId", CartContoller.getProductById)
router.get("/category/:category", CartContoller.getProductsByCategory)
router.post("/AddProductToFavourate", CartContoller.AddProductToFavourate)

export default router;