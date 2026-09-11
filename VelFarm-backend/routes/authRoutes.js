const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration data:', JSON.stringify(req.body, null, 2));
    const {
      // Step 1: User Info
      fullName,
      email,
      password,
      phone,
      communication,
      language,
      // Step 2: Farm Info
      farmName,
      farmLocation,
      farmSize,
      // Step 3: Crop Info
      primaryCrops,
      secondaryCrops,
      // Step 4: Equipment Info
      sprayerType,
      iotDevices,
      machinery,
      // Step 5: Pesticide Info
      pesticides,
      fertilizerPreference,
      monthlyExpenditure
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password, and phone are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      phone,
      communication,
      language,
      farmName,
      farmLocation,
      farmSize,
      primaryCrops,
      secondaryCrops,
      sprayerType,
      iotDevices,
      machinery,
      pesticides,
      fertilizerPreference,
      monthlyExpenditure
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Get all users (protected route)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Users fetched successfully',
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users'
    });
  }
});

// Get current user profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile fetched successfully',
      user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
});

// Admin route to view all user data (for development/testing)
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'All users fetched successfully',
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users'
    });
  }
});

// Update user profile (protected route)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;
    
    console.log('Profile update request for user:', userId);
    console.log('Update data received:', JSON.stringify(updateData, null, 2));

    // Remove password from update data if it's empty or not provided
    if (!updateData.password || updateData.password.trim() === '') {
      delete updateData.password;
    }
    
    console.log('Data after password removal:', JSON.stringify(updateData, null, 2));

    // Convert comma-separated strings to arrays for crops, devices, and machinery
    if (updateData.primaryCrops && typeof updateData.primaryCrops === 'string') {
      updateData.primaryCrops = updateData.primaryCrops.split(',').map(crop => crop.trim()).filter(crop => crop);
    }
    if (updateData.secondaryCrops && typeof updateData.secondaryCrops === 'string') {
      updateData.secondaryCrops = updateData.secondaryCrops.split(',').map(crop => crop.trim()).filter(crop => crop);
    }
    if (updateData.iotDevices && typeof updateData.iotDevices === 'string') {
      updateData.iotDevices = updateData.iotDevices.split(',').map(device => device.trim()).filter(device => device);
    }
    if (updateData.machinery && typeof updateData.machinery === 'string') {
      updateData.machinery = updateData.machinery.split(',').map(machine => machine.trim()).filter(machine => machine);
    }

    // Handle pesticides array - support both string and array formats
    if (updateData.pesticides) {
      if (typeof updateData.pesticides === 'string') {
        updateData.pesticides = updateData.pesticides.split(',').map(p => ({ name: p.trim(), frequency: 'Monthly' })).filter(p => p.name);
      } else if (Array.isArray(updateData.pesticides)) {
        updateData.pesticides = updateData.pesticides.map(p => {
          if (typeof p === 'string') {
            return { name: p.trim(), frequency: 'Monthly' };
          }
          return p;
        }).filter(p => p.name);
      }
    }

    // Convert numeric fields
    if (updateData.farmSize) {
      updateData.farmSize = parseFloat(updateData.farmSize);
    }
    if (updateData.monthlyExpenditure) {
      updateData.monthlyExpenditure = parseFloat(updateData.monthlyExpenditure);
    }

    // Handle date fields
    if (updateData.lastHarvest) {
      updateData.lastHarvest = new Date(updateData.lastHarvest);
    }
    if (updateData.nextPlanting) {
      updateData.nextPlanting = new Date(updateData.nextPlanting);
    }
    if (updateData.lastService) {
      updateData.lastService = new Date(updateData.lastService);
    }
    if (updateData.nextService) {
      updateData.nextService = new Date(updateData.nextService);
    }
    if (updateData.lastApplication) {
      updateData.lastApplication = new Date(updateData.lastApplication);
    }
    if (updateData.nextApplication) {
      updateData.nextApplication = new Date(updateData.nextApplication);
    }
    if (updateData.subscription?.renewsOn) {
      updateData.subscription.renewsOn = new Date(updateData.subscription.renewsOn);
    }
    if (updateData.security?.passwordLastChanged) {
      updateData.security.passwordLastChanged = new Date(updateData.security.passwordLastChanged);
    }
    if (updateData.security?.lastLogin) {
      updateData.security.lastLogin = new Date(updateData.security.lastLogin);
    }
    if (updateData.systemSettings?.lastBackup) {
      updateData.systemSettings.lastBackup = new Date(updateData.systemSettings.lastBackup);
    }

    // Handle nested objects - merge with existing data
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Merge nested objects to preserve existing data
    const mergedData = { ...updateData };
    
    // Merge preferences
    if (updateData.preferences) {
      mergedData.preferences = {
        ...existingUser.preferences,
        ...updateData.preferences,
        notifications: {
          ...existingUser.preferences?.notifications,
          ...updateData.preferences?.notifications
        }
      };
    }

    // Merge security settings
    if (updateData.security) {
      mergedData.security = {
        ...existingUser.security,
        ...updateData.security
      };
    }

    // Merge subscription info
    if (updateData.subscription) {
      mergedData.subscription = {
        ...existingUser.subscription,
        ...updateData.subscription
      };
    }

    // Merge payment details
    if (updateData.paymentDetails) {
      mergedData.paymentDetails = {
        ...existingUser.paymentDetails,
        ...updateData.paymentDetails
      };
    }

    // Merge system settings
    if (updateData.systemSettings) {
      mergedData.systemSettings = {
        ...existingUser.systemSettings,
        ...updateData.systemSettings
      };
    }

    // Handle integrations - replace array if provided
    if (updateData.integrations) {
      mergedData.integrations = updateData.integrations;
    }

    // Use findByIdAndUpdate with custom validation
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: mergedData },
      { 
        new: true, 
        runValidators: true,
        context: 'query' // This helps with validation context
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      const errorDetails = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      console.error('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        errorDetails
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during profile update'
    });
  }
});

// Update specific profile sections
router.put('/profile/subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscriptionData = req.body;

    // Handle date conversion
    if (subscriptionData.renewsOn) {
      subscriptionData.renewsOn = new Date(subscriptionData.renewsOn);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          subscription: subscriptionData,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: user.subscription
    });

  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during subscription update'
    });
  }
});

router.put('/profile/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferencesData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          preferences: preferencesData,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during preferences update'
    });
  }
});

router.put('/profile/security', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const securityData = req.body;

    // Handle date conversions
    if (securityData.passwordLastChanged) {
      securityData.passwordLastChanged = new Date(securityData.passwordLastChanged);
    }
    if (securityData.lastLogin) {
      securityData.lastLogin = new Date(securityData.lastLogin);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          security: securityData,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Security settings updated successfully',
      security: user.security
    });

  } catch (error) {
    console.error('Security update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during security update'
    });
  }
});

router.put('/profile/payment', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const paymentData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          paymentDetails: paymentData,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment details updated successfully',
      paymentDetails: user.paymentDetails
    });

  } catch (error) {
    console.error('Payment update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment update'
    });
  }
});

router.put('/profile/integrations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const integrationsData = req.body;

    // Handle date conversions for lastSync
    if (Array.isArray(integrationsData)) {
      integrationsData.forEach(integration => {
        if (integration.lastSync) {
          integration.lastSync = new Date(integration.lastSync);
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          integrations: integrationsData,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Integrations updated successfully',
      integrations: user.integrations
    });

  } catch (error) {
    console.error('Integrations update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during integrations update'
    });
  }
});

// Image upload endpoint
router.post('/profile/image', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          profileImage: imageUrl,
          updatedAt: new Date()
        } 
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });

  } catch (error) {
    console.error('Image update error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during image update'
    });
  }
});

// Comprehensive API endpoint - All App Data
router.get('/app-data', async (req, res) => {
  try {
    // Get all users
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalUsers = users.length;
    const recentUsers = users.filter(user => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(user.createdAt) > oneWeekAgo;
    }).length;

    // Farm statistics
    const farmSizes = users.map(user => user.farmSize).filter(size => size > 0);
    const averageFarmSize = farmSizes.length > 0 ? 
      (farmSizes.reduce((sum, size) => sum + size, 0) / farmSizes.length).toFixed(2) : 0;

    // Crop statistics
    const allPrimaryCrops = users.flatMap(user => user.primaryCrops || []);
    const cropCounts = {};
    allPrimaryCrops.forEach(crop => {
      cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    });

    // Sprayer type statistics
    const sprayerTypes = users.map(user => user.sprayerType).filter(type => type);
    const sprayerCounts = {};
    sprayerTypes.forEach(type => {
      sprayerCounts[type] = (sprayerCounts[type] || 0) + 1;
    });

    // Language statistics
    const languages = users.map(user => user.language).filter(lang => lang);
    const languageCounts = {};
    languages.forEach(lang => {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    // Communication preferences
    const communications = users.map(user => user.communication).filter(comm => comm);
    const communicationCounts = {};
    communications.forEach(comm => {
      communicationCounts[comm] = (communicationCounts[comm] || 0) + 1;
    });

    // Monthly expenditure statistics
    const expenditures = users.map(user => user.monthlyExpenditure).filter(exp => exp > 0);
    const averageExpenditure = expenditures.length > 0 ? 
      (expenditures.reduce((sum, exp) => sum + exp, 0) / expenditures.length).toFixed(2) : 0;

    // Response data
    const appData = {
      success: true,
      message: 'All app data fetched successfully',
      timestamp: new Date().toISOString(),
      statistics: {
        totalUsers,
        recentUsers,
        averageFarmSize: parseFloat(averageFarmSize),
        averageMonthlyExpenditure: parseFloat(averageExpenditure)
      },
      analytics: {
        cropDistribution: cropCounts,
        sprayerTypeDistribution: sprayerCounts,
        languageDistribution: languageCounts,
        communicationPreferenceDistribution: communicationCounts
      },
      users: users,
      summary: {
        totalRegistrations: totalUsers,
        activeUsers: users.length,
        mostPopularCrop: Object.keys(cropCounts).reduce((a, b) => cropCounts[a] > cropCounts[b] ? a : b, ''),
        mostUsedSprayerType: Object.keys(sprayerCounts).reduce((a, b) => sprayerCounts[a] > sprayerCounts[b] ? a : b, ''),
        mostCommonLanguage: Object.keys(languageCounts).reduce((a, b) => languageCounts[a] > languageCounts[b] ? a : b, '')
      }
    };

    res.json(appData);

  } catch (error) {
    console.error('App data fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching app data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Public lightweight stats for dashboards (no auth)
router.get('/public/stats', async (req, res) => {
  try {
    const users = await User.find({}).select('createdAt farmSize language sprayerType primaryCrops monthlyExpenditure');
    const totalUsers = users.length;
    const farmSizes = users.map(u => u.farmSize || 0).filter(n => n > 0);
    const avgFarmSize = farmSizes.length ? parseFloat((farmSizes.reduce((a,b)=>a+b,0)/farmSizes.length).toFixed(2)) : 0;
    const expenditures = users.map(u => u.monthlyExpenditure || 0).filter(n => n > 0);
    const avgMonthlyExpenditure = expenditures.length ? parseFloat((expenditures.reduce((a,b)=>a+b,0)/expenditures.length).toFixed(2)) : 0;
    res.json({ success: true, totalUsers, avgFarmSize, avgMonthlyExpenditure });
  } catch (error) {
    console.error('Public stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// Public recent users list (limited fields, no auth)
router.get('/public/recent-users', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const users = await User.find({})
      .select('fullName farmName language primaryCrops createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Public recent users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent users' });
  }
});

// Summary for header widgets (no auth)
router.get('/summary', async (req, res) => {
  try {
    const users = await User.find({}).select('createdAt farmSize language communication sprayerType');
    const totalUsers = users.length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = users.filter(u => new Date(u.createdAt) > oneWeekAgo).length;
    const avgFarmSize = (() => {
      const sizes = users.map(u => u.farmSize || 0).filter(n => n > 0);
      return sizes.length ? parseFloat((sizes.reduce((a,b)=>a+b,0)/sizes.length).toFixed(2)) : 0;
    })();
    res.json({ success: true, totalUsers, newThisWeek, avgFarmSize });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch summary' });
  }
});

// Get single user (protected)
router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Public config to help frontend discover environment
router.get('/public/config', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    time: new Date().toISOString()
  });
});

module.exports = router;