const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const demoAccounts = [
  {
    name: 'Riya Kapoor',
    email: 'student@college.edu',
    password: 'Student@123',
    role: 'student'
  },
  {
    name: 'Arjun Mehta',
    email: 'coding@college.edu',
    password: 'ClubAdmin@123',
    role: 'clubAdmin'
  },
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'Admin@123',
    role: 'superAdmin'
  }
];

async function createDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    for (const account of demoAccounts) {
      let user = await User.findOne({ email: account.email });

      if (user) {
        user.name = account.name;
        user.password = account.password;
        user.role = account.role;
        user.isActive = true;
        await user.save();

        console.log('Updated:', account.email);
      } else {
        await User.create(account);
        console.log('Created:', account.email);
      }
    }

    console.log('Demo accounts are ready!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDemoUsers();
