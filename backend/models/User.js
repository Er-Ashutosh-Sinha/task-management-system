const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for password hashing
userSchema.pre('save', async function (next) {
  console.log('presave 1 ');
  if (!this.isModified('password')) return next();
  console.log('presave 2 ');

  if (!this.password) return next(new Error('Password is missing'));
  console.log('presave 3 ');

  try {
    const salt = await bcrypt.genSalt(10);
    console.log('presave 4 ');

    this.password = await bcrypt.hash(this.password, salt);
    console.log('presave 5 ');

    next();
  } catch (err) {
    console.log('errrrrrrrrrrr ', err);
    next(err); // Pass error to Mongoose
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
