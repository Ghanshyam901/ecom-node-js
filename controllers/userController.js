import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import crypto from 'crypto';
import UserModal from "../models/User.js";

//all static function
class UserController {
    static userRegistraction = async (req, res) => {
        const { name, email, password, password_conf, tc, isAdmin, mobile } = req.body;

        // cheking email shoud not same
        const user = await UserModel.findOne({ email: email });
        if (user) {
            res.send({ "status": "failed", "message": "Email already exist" })
        } else {
            if (name && email && password && password_conf && tc) {
                if (password === password_conf) {

                    try {
                        const saltPassword = await bcrypt.genSalt(12);
                        const hashPassword = await bcrypt.hash(password, saltPassword);

                        const data = new UserModel({
                            name: name,
                            email: email,
                            password: hashPassword,
                            tc: tc,
                            otp: "",
                            isVerified: false,
                            isAdmin: isAdmin,
                            mobile: mobile
                        })

                        await data.save();

                        const saved_user = await UserModel.findOne({ email: email });
                        // generate jwt token
                        const token = jwt.sign({ userID: saved_user._id, name: saved_user.name }, process.env.JWT_SECRET_KEY, { expiresIn: "20m" })



                        res.status(201).send({ "status": "success", "message": "user registraction success", "token": token })
                    } catch (error) {
                        res.send({ "status": "failed", "message": "something went wrong.." })
                    }

                } else {
                    res.send({ "status": "failed", "message": "password and cnf password does't match" })
                }
            } else {
                res.send({ "status": "failed", "message": "all fields are required" })
            }
        }


    }
    static UpdateProfile = async (req, res) => {
        const { name } = req.body
        try {
            // const updatedProfile = await UserModal.findByIdAndUpdate(req.params.id, req.body, { new: true });
            const updatedProfileData = await UserModel.findByIdAndUpdate(req.user._id, {
                $set: {
                    name: name,

                }
            }, { new: true, select: 'name email' }
            )
            res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfileData });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    static userLogin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (email && password) {
                const user = await UserModel.findOne({ email: email });
                if (user != null) {
                    const isMatchPassword = await bcrypt.compare(password, user.password);
                    if ((user.email == email) && isMatchPassword) {
                        // generate jwt token
                        const token = jwt.sign({ userID: user._id, name: user.name }, process.env.JWT_SECRET_KEY, { expiresIn: "20m" })

                        res.send({ "status": "success", "message": "login success", "token": token })


                    } else {
                        res.send({ "status": "failed", "message": "user not found" })
                    }

                } else {
                    res.send({ "status": "failed", "message": "user not found" })

                }
            } else {
                res.send({ "status": "failed", "message": "all fields are required" })

            }
        } catch (error) {

        }
    }

    static changeUserPassword = async (req, res) => {
        const { password, password_conf } = req.body
        if (password && password_conf) {

            if (password !== password_conf) {
                res.send({ "status": "failed", "message": "password and confirm password does't match" })

            } else {
                const saltPassword = await bcrypt.genSalt(12);
                const newHashPassword = await bcrypt.hash(password, saltPassword);
                console.log(req.user._id)
                await UserModel.findByIdAndUpdate(req.user._id, {
                    $set: {
                        password: newHashPassword
                    }
                })
                res.send({ "status": "success", "message": "password chnage success" })

            }

        } else {
            res.send({ "status": "failed", "message": "all fields are required" })

        }
    }

    static loggedUser = async (req, res) => {
        try {
            const user = req.user; // This is already fetched by the middleware
            if (!user) {
                return res.status(404).send({ "status": "failed", "message": "User not found" });
            }
            res.send({ "status": "success", "user": user });
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "Server error" });
        }
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body;

        if (email) {
            const user = await UserModel.findOne({ email: email });

            if (user) {
                const secretKey = user._id + process.env.JWT_SECRET_KEY;
                const token = jwt.sign({ userID: user._id }, secretKey, {
                    expiresIn: "15m"
                })
                const link = `http://localhost:3000/api/user/resetpassword/${user._id}/${token}`
                console.log(link)

                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "password reset link",
                    html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
                        <div style="text-align: center;">
                            <img src="https://via.placeholder.com/150" alt="Logo" style="margin-bottom: 20px;">
                        </div>
                        <h2 style="color: #4CAF50; text-align: center;">Password Reset Request</h2>
                        <p>Hi <strong>${user.name || 'User'}</strong>,</p>
                        <p>It seems you have requested to reset your password. If this was you, click the button below to proceed. If you did not make this request, you can safely ignore this email.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        </div>
    
                        <p>This password reset link will expire in <strong>15 minutes</strong>. If it expires, you can request a new one.</p>
                        <p style="font-size: 12px; color: #888;">If the button above doesn't work, you can also click on the following link:</p>
                        <a href="${link}" style="color: #4CAF50;">${link}</a>
    
                        <div style="margin-top: 40px; text-align: center;">
                            <img src="https://via.placeholder.com/500x300" alt="Reset Illustration" style="max-width: 100%; border-radius: 10px;">
                        </div>
                        
                        <p style="text-align: center; font-size: 14px; color: #888; margin-top: 20px;">Thank you, <br> The Support Team</p>
                    </div>
                    `
                })
                res.send({ "status": "success", "message": "email sent", info })
            } else {
                res.send({ "status": "failed", "message": "email does't exist" })

            }
        } else {
            res.send({ "status": "failed", "message": "email field is required" })

        }
    }


    static userPasswordReset = async (req, res) => {
        const { password, password_conf } = req.body;
        const { id, token } = req.params;

        const user = await UserModel.findById(id);
        const new_secretKey = user._id + process.env.JWT_SECRET_KEY;

        try {
            const decoded = jwt.verify(token, new_secretKey);

            if (password && password_conf) {
                if (password !== password_conf) {
                    res.send({ "status": "failed", "message": "password and confirm password doesn't match" });
                } else {
                    const saltPassword = await bcrypt.genSalt(12);
                    const newHashPassword = await bcrypt.hash(password, saltPassword);
                    await UserModel.findByIdAndUpdate(decoded.userID, {
                        $set: {
                            password: newHashPassword
                        }
                    });
                    res.send({ "status": "success", "message": "password reset success" });
                }
            } else {
                res.send({ "status": "failed", "message": "all fields are required" });
            }
        } catch (error) {
            res.send({ "status": "failed", "message": "invalid token" });
        }
    }


    //// veryfy email

    static verifyEmail = async (req, res) => {
        const { email } = req.body;

        if (email) {
            try {
                const user = await UserModel.findOne({ email: email });
                if (user) {
                    if (user.isVerified) {
                        res.send({ "status": "success", "message": "Email is already verified." });
                    } else {
                        // Generate a 6-digit OTP
                        const otp = crypto.randomInt(100000, 999999);

                        // Update the user's OTP and timestamp in the database
                        await UserModel.updateOne({ email: email }, {
                            $set: {
                                otp: otp,
                                otpCreatedAt: new Date() // Set the current timestamp
                            }
                        });

                        // Send the OTP via email
                        let info = await transporter.sendMail({
                            from: process.env.EMAIL_FROM,
                            to: email,
                            subject: "Email Verification OTP",
                            text: `Your OTP is: ${otp}`
                        });

                        res.send({ "status": "success", "message": "OTP sent", otp });
                    }
                } else {
                    res.send({ "status": "failed", "message": "Email is not valid." });
                }
            } catch (error) {
                res.status(500).send({ "status": "error", "message": "Server error", error });
            }
        } else {
            res.send({ "status": "failed", "message": "Email field is required." });
        }
    }

    // Assuming this is part of a controller
    static verifyOTP = async (req, res) => {
        const { email, otp } = req.body;

        if (email && otp) {
            try {
                // Find the user by email
                const user = await UserModel.findOne({ email: email });

                if (user) {
                    if (user.isVerified === true) {
                        res.send({ "status": "success", "message": "Email is already verified." });
                    } else {
                        // Check if OTP matches
                        if (user.otp === otp) {
                            // Check if OTP is still valid (within 5 minutes)
                            const otpAge = Date.now() - new Date(user.otpCreatedAt).getTime();
                            const otpExpiryLimit = 1 * 60 * 1000; // 1 minutes in milliseconds

                            if (otpAge <= otpExpiryLimit) {
                                // Update the user's isVerified field and clear the OTP
                                await UserModel.updateOne(
                                    { email: email },
                                    { $set: { isVerified: true, otp: null, otpCreatedAt: null } }
                                );

                                // Send email confirmation
                                let info = await transporter.sendMail({
                                    from: process.env.EMAIL_FROM,
                                    to: email,
                                    subject: "Email Verification",
                                    text: `Your email has been successfully verified.`
                                });

                                // Respond with success
                                res.send({ "status": "success", "message": "Email verified successfully." });
                            } else {
                                // OTP expired
                                res.send({ "status": "failed", "message": "OTP has expired." });
                            }
                        } else {
                            // Respond with failure if OTP doesn't match
                            res.send({ "status": "failed", "message": "Invalid OTP." });
                        }
                    }
                } else {
                    res.send({ "status": "failed", "message": "Email is not valid." });
                }
            } catch (error) {
                res.status(500).send({ "status": "error", "message": "Server error", error });
            }
        } else {
            res.send({ "status": "failed", "message": "Email and OTP fields are required." });
        }
    }
}


export default UserController