import express from "express";
const router = express.Router();
import FavourateController from "../controllers/FavourateController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";


///auth route
router.use("/AddProductToFavourate", checkUserAuth)
router.use("/RemoveFromFavourate", checkUserAuth)
router.use("/GetAllFavourateOfProduct", checkUserAuth)

//private route


router.post("/AddProductToFavourate", FavourateController.AddProductToFavourate)
router.post("/RemoveFromFavourate", FavourateController.RemoveFromFavourate)
router.get("/GetAllFavourateOfProduct", FavourateController.GetAllFavourateOfProduct)

export default router;