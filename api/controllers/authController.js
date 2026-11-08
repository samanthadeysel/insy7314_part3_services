const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 
const logger = require('../utils/logger');
const { logSecurityEvent } = require('../middleware/loggerMiddleware');

const createToken = (user) => { 
  return jwt.sign( 
    { 
      id: user._id, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } 
  ); 
}; 

const register = async (req, res, next) => { 
  try { 
    const { fullName, email, password, role } = req.body; 

    if (!fullName || !email || !password) { 
      return res.status(400).json({ error: 'Full name, email, and password are required' }); 
    } 

    if (typeof fullName !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof role !== 'string') { 
      return res.status(400).json({ error: 'Full name, email, and password must be text values' }); 
    } 

    if (password.length < 8) { 
      return res.status(400).json({ error: 'Password must be at least 8 characters' }); 
    } 

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() }); 
    if (existingUser) { 
      return res.status(409).json({ error: 'User already exists' }); 
    } 

    const passwordHash = await bcrypt.hash(password, 12); 

    const user = await User.create({ 
      fullName: fullName.trim(), 
      email: email.toLowerCase().trim(), 
      passwordHash,
      role: role || 'freelancer'
    }); 

    logSecurityEvent('USER_REGISTER_SUCCESS', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({ 
      message: 'User registered', 
      data: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role 
      } 
    }); 
  } catch (error) { 
    if (error.name === 'ValidationError') { 
      return res.status(400).json({ error: error.message }); 
    } 
    next(error); 
  } 
}; 

const login = async (req, res, next) => { 
  try { 
    const { email, password } = req.body; 

    if (!email || !password) { 
      return res.status(400).json({ error: 'Email and password are required' }); 
    } 

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash'); 
    if (!user) { 
      logSecurityEvent('USER_LOGIN_FAILED', { email, reason: 'User not found' });
      return res.status(401).json({ error: 'Invalid credentials' }); 
    } 

    const passwordMatches = await bcrypt.compare(password, user.passwordHash); 
    if (!passwordMatches) { 
      logSecurityEvent('USER_LOGIN_FAILED', { email, reason: 'Invalid password' });
      return res.status(401).json({ error: 'Invalid credentials' }); 
    } 

    const token = createToken(user); 

    logSecurityEvent('USER_LOGIN_SUCCESS', {
      userId: user._id,
      role: user.role
    });

    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email, 
        role: user.role 
      } 
    }); 
  } catch (error) { 
    next(error); 
  } 
}; 

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('fullName email role createdAt');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  register, 
  login, 
  getProfile
};