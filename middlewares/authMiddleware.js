import jwt from "jsonwebtoken";
import UserModal from "../models/User.js";

var checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {
            token = authorization.split(' ')[1];
            //verify token

            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)
            // console.log(userID)

            req.user = await UserModal.findById(userID).select("-password")
            next();
        } catch (error) {

            res.status(401).send({ "status": "failed", "message": "Unauthorized User" });
        }
    }
    if (!token) {

        res.status(401).send({ "status": "failed", "message": "Unauthorized User no token" });

    }
}

export default checkUserAuth;