const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Kết nối MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Đã kết nối với MongoDB"))
    .catch((error) => console.error("Không thể kết nối MongoDB:", error));

    
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: String,
    role: { type: String, enum: ['admin', 'user'], default: 'user' } ,
    avatar: { type: String, default: '' },
});

// Hàm so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password); // So sánh mật khẩu người dùng nhập với mật khẩu băm lưu trong cơ sở dữ liệu
};

// Trước khi lưu người dùng, băm mật khẩu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Nếu mật khẩu không thay đổi thì không cần băm lại
    }

    const salt = await bcrypt.genSalt(10); // Tạo salt với độ dài 10 vòng
    this.password = await bcrypt.hash(this.password, salt); // Băm mật khẩu
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;