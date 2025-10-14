const { User, Profile, Student, Teacher } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

  const { email, password, role, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      role: role || 'student'
    });

    await user.save();

    // Create profile
    const profile = new Profile({
      user: user._id,
      fullName
    });

    await profile.save();

    // Update user with profile reference
    user.profile = profile._id;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          profile
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and populate profile
  const user = await User.findOne({ email }).populate('profile');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get additional profile data based on role
    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ account: user.profile._id })
        .populate('intake')
        .populate('section')
        .populate('department');
    } else if (user.role === 'teacher') {
      profileData = await Teacher.findOne({ account: user.profile._id })
        .populate('department');
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          profile: user.profile,
          profileData
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('profile')
      .select('-password');

    let profileData = null;
    if (user.role === 'student') {
      profileData = await Student.findOne({ account: user.profile._id })
        .populate('intake')
        .populate('section')
        .populate('department');
    } else if (user.role === 'teacher') {
      profileData = await Teacher.findOne({ account: user.profile._id })
        .populate('department');
    }

    const userObj = user ? user.toObject() : null;
    if (userObj) {
      userObj.id = userObj._id;
      delete userObj._id;
    }

    res.json({
      success: true,
      data: {
        user: userObj,
        profileData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Handle password change if provided
    if (updates.password && updates.currentPassword) {
      const user = await User.findById(userId);
      
      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(updates.currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Update password (will be hashed by pre-save middleware)
      user.password = updates.password;
      await user.save();
      
      // Remove password fields from updates object
      delete updates.password;
      delete updates.currentPassword;
      
      return res.json({
        success: true,
        message: 'Password updated successfully'
      });
    }

    // Update user basic info if provided
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Find user and profile
    const user = await User.findById(userId).populate('profile');

    // Update email on user if provided
    if (updates.email) {
      user.email = updates.email;
    }

    // Update profile fields
    if (user.profile) {
      if (typeof updates.fullName === 'string') user.profile.fullName = updates.fullName;
      if (typeof updates.bio === 'string') user.profile.bio = updates.bio;

      // Handle avatar upload
      const files = req.files || {};
      if (files.profileImage && files.profileImage[0]) {
        const file = files.profileImage[0];
        user.profile.avatarUrl = `/uploads/profiles/${file.filename}`;
      }
      await user.profile.save();
    }

    await user.save();

    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userObj }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};