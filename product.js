const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String },  // Bạn có thể thêm các trường khác như hình ảnh sản phẩm
    category: { type: String },
    quantity: { type: Number, required: true, default: 1 }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
