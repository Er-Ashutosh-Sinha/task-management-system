const User = require('../models/User');
const { generateToken } = require('../config/jwt');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    console.log('Register body:', req.body); // <-- debug log

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    console.log('Register ste 1'); // <-- debug log

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.log('Register ste 2'); // <-- debug log

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member', // Default to member if no role specified
    });
    console.log('Register ste 3'); // <-- debug log

    // Generate token
    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    console.log('Register ste 4'); // <-- debug log

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Register error:', error); // <-- log the full error
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    // Generate token
    const token = generateToken({
      id: user._id,
      role: user.role,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  logout,
};
