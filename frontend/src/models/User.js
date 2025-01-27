// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// const userSchema = new mongoose.Schema({
//     user_uuid: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     username:{
//         type: String,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     documents: [
//         {
//             document_uuid: String,
//             filename: String,
//             created_at: Date,
//             last_accessed: Date,
//         },
//     ],
//     created_at: {
//         type: Date,
//         default: Date.now,
//     },
//     last_login: {
//         type: Date,
//         default: Date.now,
//     },
// });

// // Hash password before saving
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

// // Compare password method
// userSchema.methods.comparePassword = async function (candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  user_uuid: {
    type: String,
    default: () => uuidv4(),
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 3,
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true,
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/micah/svg?seed=${this._id || uuidv4()}`;
    }
  },
  avatarSeed: {
    type: String,
    default: () => uuidv4()
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  documents: [{
    document_uuid: String,
    filename: String,
    created_at: Date,
    last_accessed: Date,
  }],
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update avatar
userSchema.methods.updateAvatar = function(seed) {
  this.avatarSeed = seed;
  this.avatar = `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`;
};

let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = mongoose.model('User', userSchema);
}

export default User;