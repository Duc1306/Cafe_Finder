// Script để generate JWT secret mạnh
// Chạy: node scripts/generate-jwt-secret.js

const crypto = require('crypto');

const generateSecret = () => {
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('\n🔐 JWT Secret đã được tạo:\n');
  console.log(secret);
  console.log('\n📋 Copy secret này và thêm vào Environment Variables:');
  console.log('JWT_SECRET=' + secret);
  console.log('\n✅ Lưu ý: Giữ secret này bảo mật!\n');
};

generateSecret();
