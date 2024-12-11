import dotenv from "dotenv"
dotenv.config();
import express from "express";
import cors from "cors";
import connectDb from './config/connectDb.js';
import userRoutes from "./routes/userRoutes.js"
import AdminRoute from "./routes/AdminRoute.js"
import CartRoute from "./routes/CartRoute.js"
import OrderRoute from "./routes/OrderRoutes.js"
import AddressRoute from "./routes/AddressRoute.js"

import FavRoute from "./routes/FavourateRoute.js"


const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());
connectDb(DATABASE_URL)

//json
app.use(express.json())

//load routes
app.use("/api/user", userRoutes)
app.use("/api/admin", AdminRoute)
app.use("/api/cart", CartRoute);
app.use("/api/order", OrderRoute);
app.use("/api/favourate", FavRoute);
app.use("/api/address", AddressRoute)


app.listen(port, () => {
    console.log(`server is running at http://localhost:${port}`)
})