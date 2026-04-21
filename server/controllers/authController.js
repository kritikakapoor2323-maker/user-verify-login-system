const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, mobile, gender, state, pinCode } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            mobile,
            gender,
            state,
            pinCode,
            otp,
            otpExpires
        });

        // Send Email
        try {
            await sendEmail(user.email, otp);
            res.status(201).json({ success: true, message: 'OTP sent to email. Please verify to activate account.' });
        } catch (error) {
            console.error(error);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Account verified successfully',
            token: generateToken(user._id)
        });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
             return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
             return res.status(401).json({ success: false, message: 'Please verify your email first' });
        }

        res.status(200).json({
            success: true,
            token: generateToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                gender: user.gender,
                state: user.state,
                pinCode: user.pinCode
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
             return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        try {
            await sendEmail(user.email, otp);
            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (err) {
            console.error(err);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }

    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successful' });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};
