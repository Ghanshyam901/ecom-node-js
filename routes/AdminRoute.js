import express from "express";
const router = express.Router();
import AdminController from "../controllers/AdminController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";
import checkAdmin from "../middlewares/adminMiddleware.js";



// route level middleware - to protect route (always int the top)
router.use('/addproduct', checkUserAuth)
router.use("/update/:id", checkUserAuth);
router.use("/delete/:id", checkUserAuth)
router.use("/getallorders", checkUserAuth)
router.use("/GetAllProducts", checkUserAuth)
router.use("/GetAllProductsPage", checkUserAuth)




//private route

router.post("/addproduct", checkAdmin, AdminController.AddProduct)
router.put("/update/:id", checkAdmin, AdminController.UpdateProduct);
router.delete("/delete/:id", checkAdmin, AdminController.DeleteProduct);
router.get("/getallorders", checkAdmin, AdminController.GetAllOrders)
router.get("/GetAllProducts", AdminController.GetAllProducts);
router.get("/GetAllProductsPage", AdminController.GetAllProductsPagination);
export default router;