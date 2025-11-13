// middleware/auth.js
const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];  // Lấy token từ header

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied, admin only' });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = isAdmin;
