import express from "express";
const router = express.Router();
import AddressController from "../controllers/AddressController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";


// route level middleware - to protect route (always int the top)
router.use('/addAddress', checkUserAuth)
router.use('/editAddress/:addressId', checkUserAuth)
router.use('/deleteAddress/:addressId', checkUserAuth)




//private route
router.post("/addAddress", AddressController.addAddress)
router.put("/editAddress/:addressId", AddressController.editAddress)
router.delete("/deleteAddress/:addressId", AddressController.deleteAddress)


export default router;
