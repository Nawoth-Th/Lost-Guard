const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendEmail, templates } = require('../utils/emailService');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            console.log(`Login successful: ${email}`);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            console.log(`Login failed (invalid credentials): ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: 'Server Error during Login' });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`Register attempt: ${email}`);

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            console.log(`User created: ${email}`);
            // Send welcome email (non-blocking)
            sendEmail({
                email: user.email,
                subject: 'Welcome to Lost Guard! 🛡️',
                message: templates.welcome(user.name),
            }).catch(err => console.error('Email Error:', err));

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server Error during Registration' });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ message: 'Server Error fetching profile' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: 'Server Error updating profile' });
    }
};

module.exports = { authUser, registerUser, getUserProfile, updateUserProfile };
