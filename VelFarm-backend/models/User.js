const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Step 1: User Info
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: false, // Make password optional for updates
    minLength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  communication: {
    type: String,
    enum: ['SMS', 'Email', 'Phone Call', 'WhatsApp'],
    default: 'Email'
  },
  language: {
    type: String,
    // Support languages shown in the Angular form plus previous options
    enum: ['English', 'Hindi', 'Other', 'Spanish', 'French', 'Portuguese', 'हिंदी', 'தமிழ்', 'తెలుగు'],
    default: 'English'
  },

  // Step 2: Farm Info
  farmName: {
    type: String,
    trim: true,
    maxLength: [100, 'Farm name cannot exceed 100 characters']
  },
  farmLocation: {
    type: String,
    trim: true,
    maxLength: [200, 'Farm location cannot exceed 200 characters']
  },
  farmSize: {
    type: Number,
    min: [0, 'Farm size cannot be negative']
  },

  // Step 3: Crop Info
  primaryCrops: [{
    type: String,
    trim: true
  }],
  secondaryCrops: [{
    type: String,
    trim: true
  }],

  // Step 4: Equipment Info
  sprayerType: {
    type: String,
    // Allow both legacy values and those used by the Angular form
    enum: [
      'Manual', 'Battery-powered', 'Fuel-powered', 'Tractor-mounted', 'Drone',
      'Knapsack Sprayer', 'Backpack Sprayer', 'Handheld Sprayer', 'Pump Sprayer', 'Compression Sprayer', 'None',
      'Boom Sprayer', 'Airblast Sprayer', 'Drone Sprayer'
    ]
  },
  iotDevices: [{
    type: String,
    trim: true
  }],
  machinery: [{
    type: String,
    trim: true
  }],

  // Step 5: Pesticide Info
  pesticides: [{
    name: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Seasonal', 'As needed']
    }
  }],
  fertilizerPreference: {
    type: String,
    // Support options used by the Angular form and legacy ones
    enum: ['Organic', 'Chemical', 'Both', 'Synthetic', 'Mixed', 'None', 'Conventional']
  },
  monthlyExpenditure: {
    type: Number,
    min: [0, 'Monthly expenditure cannot be negative']
  },

  // Additional Profile Fields
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150x150/28a745/ffffff?text=AG'
  },
  farmingExperience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },

  // Farm Details
  soilType: {
    type: String,
    enum: ['Loam', 'Clay', 'Sandy', 'Silt', 'Peat'],
    default: 'Loam'
  },
  irrigationType: {
    type: String,
    enum: ['Drip', 'Sprinkler', 'Flood', 'Manual'],
    default: 'Drip'
  },
  lastHarvest: {
    type: Date
  },
  nextPlanting: {
    type: Date
  },

  // Equipment Details
  maintenanceSchedule: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Quarterly', 'As Needed'],
    default: 'Monthly'
  },
  lastService: {
    type: Date
  },
  nextService: {
    type: Date
  },

  // Pesticide Details
  lastApplication: {
    type: Date
  },
  nextApplication: {
    type: Date
  },
  applicationMethod: {
    type: String,
    enum: ['Spray', 'Granular', 'Liquid', 'Foliar'],
    default: 'Spray'
  },

  // Subscription Info
  subscription: {
    plan: {
      type: String,
      enum: ['Free Plan', 'Basic Plan', 'Pro Plan', 'Premium Plan'],
      default: 'Free Plan'
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled', 'Paused', 'Expired'],
      default: 'Active'
    },
    price: {
      type: Number,
      default: 0
    },
    billingCycle: {
      type: String,
      enum: ['Monthly', 'Yearly'],
      default: 'Monthly'
    },
    renewsOn: {
      type: Date
    },
    features: [{
      type: String
    }]
  },

  // Payment Details
  paymentDetails: {
    cardType: {
      type: String,
      enum: ['Visa', 'Mastercard', 'American Express', 'Discover']
    },
    lastFour: {
      type: String,
      maxLength: 4
    },
    expires: {
      type: String
    },
    billingAddress: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'],
      default: 'Credit Card'
    }
  },

  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      inApp: {
        type: Boolean,
        default: true
      },
      weather: {
        type: Boolean,
        default: true
      },
      crop: {
        type: Boolean,
        default: true
      },
      system: {
        type: Boolean,
        default: true
      }
    },
    measurementUnits: {
      type: String,
      enum: ['Imperial (acres, lbs)', 'Metric (hectares, kg)'],
      default: 'Imperial (acres, lbs)'
    },
    timezone: {
      type: String,
      default: 'UTC-5'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    }
  },

  // Security Settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      min: 5,
      max: 480,
      default: 30
    },
    passwordLastChanged: {
      type: Date
    },
    lastLogin: {
      type: Date
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    securityQuestions: [{
      question: String,
      answer: String
    }]
  },

  // System Settings
  systemSettings: {
    dataRetention: {
      type: Number,
      default: 365
    },
    backupFrequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      default: 'Weekly'
    },
    lastBackup: {
      type: Date
    },
    systemVersion: {
      type: String,
      default: '1.0.0'
    },
    storageUsed: {
      type: String,
      default: '0 GB'
    },
    apiCallsToday: {
      type: Number,
      default: 0
    }
  },

  // Integrations
  integrations: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Connected', 'Not Connected', 'Pending', 'Error'],
      default: 'Not Connected'
    },
    lastSync: {
      type: Date
    },
    config: {
      type: mongoose.Schema.Types.Mixed
    }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});


// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);