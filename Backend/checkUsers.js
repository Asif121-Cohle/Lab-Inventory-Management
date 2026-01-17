require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return User.countDocuments();
  })
  .then(count => {
    console.log(`\nTotal users in database: ${count}\n`);
    return User.find().select('username email role createdAt').sort({ createdAt: -1 });
  })
  .then(users => {
    console.log('📋 User List:');
    console.log('─'.repeat(80));
    users.forEach(u => {
      const date = new Date(u.createdAt);
      const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      console.log(`  ${u.username.padEnd(20)} | ${u.email.padEnd(30)} | ${u.role.padEnd(15)} | ${dateStr}`);
    });
    console.log('─'.repeat(80));
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
