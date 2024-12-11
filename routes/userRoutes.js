
import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

// route level middleware - to protect route (always int the top)
router.use('/changepassword', checkUserAuth)
router.use("/loggeduser", checkUserAuth);
router.use("/veryfyemail", checkUserAuth)
router.use("/veryfyotp", checkUserAuth)

router.use("/UpdateProfile", checkUserAuth)

// public route

router.post("/register", UserController.userRegistraction)
router.post("/login", UserController.userLogin)
router.post("/resetpassword", UserController.sendUserPasswordResetEmail)

router.post("/reset-password/:id/:token", UserController.userPasswordReset)

router.post("/veryfyemail", UserController.verifyEmail)
router.post("/veryfyotp", UserController.verifyOTP)


//private route
router.post("/changepassword", UserController.changeUserPassword)
router.get("/loggeduser", UserController.loggedUser);
router.post("/UpdateProfile", UserController.UpdateProfile)



export default router;