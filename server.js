const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./database'); // Đảm bảo đường dẫn chính xác
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3004;
const router = express.Router();
const cors = require('cors');
app.use(cors());
// Cấu hình Express để phục vụ các tệp tĩnh
app.use(express.static('project'));
const Product = require('./product');
const Basket = require('./basket'); 
const Order = require('./order'); 
// Cấu hình body-parser để nhận dữ liệu từ form
app.use(express.json({ limit: '10mb' }));  // Tăng giới hạn lên 10MB
// Tăng giới hạn cho URL-encoded form (nếu có sử dụng)
app.use(express.urlencoded({ limit: '10mb', extended: true }));




// API đăng ký
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }
        // Tạo một người dùng mới
        const user = new User({
            name,
            email,
            password // Mật khẩu sẽ được băm tự động nhờ vào phương thức pre('save')
        });
        // Lưu người dùng vào cơ sở dữ liệu
        await user.save();
        res.status(201).json({ message: 'Đăng ký thành công', user });

    } catch (error) {
        console.error('Lỗi đăng ký:', error.message);
        res.status(500).json({ message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
    }
});


// Middleware kiểm tra token
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = user; // Đính kèm thông tin người dùng vào request
        next();
    });
};


// Định tuyến proxy để chuyển tiếp yêu cầu
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập' });
    }

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
        req.user = user; // Đính kèm thông tin người dùng vào request
        next();
    });
};

//API đăng nhập:
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }

        // Sử dụng phương thức matchPassword để so sánh mật khẩu người dùng nhập vào với mật khẩu đã băm trong cơ sở dữ liệu
        const isMatch = await user.matchPassword(password);  // Sử dụng matchPassword từ user

        if (isMatch) {
            // Tạo token
            const token = jwt.sign(
                { id: user._id, email: user.email, name: user.name, role: user.role }, // Thêm role vào payload
                'secret_key',
                { expiresIn: '1h' }
            );
            
            // Trả token và thông tin người dùng về client
            res.json({
                message: 'Đăng nhập thành công',
                token,  // Trả token
                user: { 
                    id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    avatar: user.avatar, // Trả avatar
                    address: user.address, // Trả địa chỉ
                    role: user.role // Trả role để xác định quyền admin
                }
            });
        } else {
            res.status(400).json({ message: 'Mật khẩu không đúng' });
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error.message);
        res.status(500).json({ message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
    }
});


// API cập nhật thông tin người dùng
// API cập nhật thông tin người dùng
app.post('/updateuser', authenticate, async (req, res) => {
    // Lấy thông tin người dùng từ token
    const userId = req.user.id;  // `req.user` được gán trong middleware authenticate

    const { name, email, address, avatar } = req.body;

    try {
        // Tìm người dùng theo id (lấy từ token)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tìm thấy!' });
        }

        // Cập nhật các thông tin người dùng
        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        user.avatar = avatar || user.avatar;

        // Lưu thay đổi vào cơ sở dữ liệu
        await user.save();

        // Trả về thông báo thành công
        res.status(200).json({ message: 'Cập nhật thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server: ' + error.message });
    }
});

// Thêm sản phẩm mới
app.post('/products', async (req, res) => {
    // Kiểm tra nếu người dùng có vai trò admin
    const user = JSON.parse(req.headers['user']); // Giả sử user đã được lưu trong headers hoặc trong session
    if (user && user.role === 'admin') {
        const { name, description, price, image, category } = req.body;
        try {
            const newProduct = new Product({
                name,
                description,
                price,
                image,
                category                
            });
            await newProduct.save();
            res.status(201).json({ message: 'Sản phẩm đã được thêm thành công!', product: newProduct });
        } catch (error) {
            console.error('Lỗi thêm sản phẩm:', error.message);
            res.status(500).json({ message: 'Lỗi khi thêm sản phẩm. Vui lòng thử lại!' });
        }
    } else {
        res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này.' });
    }
});
// API trả về danh sách sản phẩm
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find(); // Lấy tất cả sản phẩm từ MongoDB
        res.json(products);  // Trả về danh sách sản phẩm
    } catch (error) {
        res.status(500).json({ message: "Không thể lấy sản phẩm" });
    }
});

app.post('/addproduct', async (req, res) => {
    const { name, price, description, image, category } = req.body;

    // Kiểm tra nếu có thiếu thông tin
    if (!name || !price || !description || !image || !category) {
        return res.status(400).json({ message: "Thiếu thông tin sản phẩm!" });
    }


// API sửa sản phẩm
// API sửa sản phẩm
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;  // Lấy ID sản phẩm từ URL
    const { name, description, price, image, category, quantity } = req.body;  // Lấy các thông tin sửa từ request body

    // Kiểm tra nếu các trường cần thiết đều có
    if (!name || !description || !price || !image || !category || quantity === undefined) {
        return res.status(400).json({ message: "Thiếu thông tin cần thiết để sửa sản phẩm!" });
    }

    try {
        // Tìm sản phẩm theo ID và cập nhật thông tin mới
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            image,
            category,
            quantity
        }, { new: true });  // `new: true` để trả về sản phẩm đã được cập nhật

        // Kiểm tra nếu không tìm thấy sản phẩm
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
        }

        // Trả về sản phẩm đã được cập nhật
        res.status(200).json({ message: 'Sản phẩm đã được cập nhật thành công!', product: updatedProduct });
    } catch (error) {
        console.error('Lỗi khi cập nhật sản phẩm:', error.message);
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm. Vui lòng thử lại!' });
    }
});




// Xóa sản phẩm
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy!' });
        }

        res.status(200).json({ message: 'Sản phẩm đã được xóa thành công!' });
    } catch (error) {
        console.error('Lỗi xóa sản phẩm:', error.message);
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm. Vui lòng thử lại!' });
    }
});
    // Tạo một sản phẩm mới
    const newProduct = new Product({
        name,
        price,
        description,
        image,
        category
    });

    try {
        // Lưu sản phẩm vào MongoDB
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);  // Trả về sản phẩm vừa thêm, bao gồm cả _id
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ message: "Không thể thêm sản phẩm" });
    }
});





// API Thêm Sản Phẩm Vào Giỏ Hàng

// Hàm tìm sản phẩm theo ID
const findProductById = async (id) => {
    try {
        const product = await Product.findById(id);  // Sử dụng Mongoose để tìm sản phẩm
        return product;
    } catch (error) {
        throw new Error('Không thể tìm thấy sản phẩm');
    }
};

//Thêm vào giỏ hàng
app.post('/cart', authenticate, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body; // Gán mặc định quantity = 1

        // Kiểm tra dữ liệu đầu vào
        if (!productId || typeof productId !== 'string' || quantity <= 0) {
            return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
        }

        let basket = await Basket.findOne({ userId: req.user.id });
        if (!basket) {
            basket = new Basket({ userId: req.user.id, items: [{ productId, quantity }] });
            await basket.save();
            return res.status(201).json({ message: 'Giỏ hàng đã được tạo và sản phẩm đã được thêm' });
        }

        const existingItem = basket.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            basket.items.push({ productId, quantity });
        }

        await basket.save();
        res.status(200).json({ message: 'Sản phẩm đã được thêm hoặc cập nhật trong giỏ hàng' });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi trên server' });
    }
})
//Lấy giỏ hàng
// Lấy giỏ hàng của người dùng
app.get('/cart', authenticate, async (req, res) => {
    try {
        // Truy vấn giỏ hàng của người dùng và populate thông tin sản phẩm
        const cart = await Basket.findOne({ userId: req.user.id }).populate('items.productId');


        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(404).json({ message: 'Giỏ hàng trống' });
        }

        res.status(200).json({ cart });
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi trên server' });
    }
});




// API cập nhật số lượng sản phẩm trong giỏ hàng
app.post('/updateQuantity', async (req, res) => {
    const { productId, quantity } = req.body;

    if (quantity <= 0) {
        return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
    }

    try {
        // Tìm giỏ hàng của người dùng
        const basket = await Basket.findOne({ "items.productId": productId }); // Sửa key đúng là productId

        if (!basket) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Tìm sản phẩm trong giỏ hàng và cập nhật số lượng
        const item = basket.items.find(item => item.productId.toString() === productId); // Sửa từ item.product to item.productId
        if (item) {
            item.quantity = quantity; // Cập nhật số lượng
        } else {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
        }

        await basket.save();  // Lưu giỏ hàng đã cập nhật
        res.status(200).json({ message: 'Số lượng sản phẩm đã được cập nhật' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật số lượng' });
    }
});


// Xóa sản phẩm khỏi giỏ hàng
app.delete('/cart', authenticate, async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
        }

        let basket = await Basket.findOne({ userId: req.user.id });
        if (!basket) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        basket.items = basket.items.filter(item => item.productId.toString() !== productId);
        await basket.save();
        res.status(200).json({ message: 'Sản phẩm đã được xóa khỏi giỏ hàng' });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi trên server' });
    }
});

// API tạo đơn hàng
app.post('/create-order', authenticate, async (req, res) => {
    const { address, paymentMethod, phone } = req.body;  // Các thông tin thanh toán

    try {
        // Lấy giỏ hàng của người dùng
        const basket = await Basket.findOne({ userId: req.user.id }).populate('items.productId');
        if (!basket || basket.items.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng trống, không thể tạo đơn hàng' });
        }

        // Tính tổng tiền đơn hàng
        const totalAmount = basket.items.reduce((total, item) => {
            return total + item.productId.price * item.quantity;
        }, 0);

        // Tạo đơn hàng mới
        const newOrder = new Order({
            userId: req.user.id,
            items: basket.items,
            address,
            phone,
            paymentMethod,
            totalAmount,
            status: 'Pending', // Trạng thái đơn hàng ban đầu
            createdAt: new Date()
        });

        await newOrder.save();

        // Xóa giỏ hàng sau khi tạo đơn hàng
        basket.items = [];
        await basket.save();

        res.status(201).json({ message: 'Đơn hàng đã được tạo thành công', order: newOrder });
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});
app.post('/orders', authenticate, async (req, res) => {
    try {
        const { fullName, email, phone, address, paymentMethod, items, totalAmount } = req.body;

        // Sử dụng Order để tạo đơn hàng
        const newOrder = new Order({
            userId: req.user.id,
            items,
            fullName,
            email,
            phone,
            address,
            paymentMethod,
            totalAmount,
            status: 'Pending',
            createdAt: new Date()
        });

        await newOrder.save();  // Lưu đơn hàng vào MongoDB
        res.status(201).json({ message: 'Đơn hàng đã được tạo thành công', order: newOrder });
    } catch (error) {
        console.error('Lỗi khi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

 

// Node.js API cho người dùng
app.get('/orders/user/:userId', async (req, res) => {
    const { userId } = req.params;

    // Kiểm tra xem userId có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'userId không hợp lệ.' });
    }

    try {
        // Tìm tất cả các đơn hàng của người dùng theo userId
        const orders = await Order.find({ userId })
            .populate('items.productId', 'name')  // Populate thông tin sản phẩm trong đơn hàng
            .exec();

        // Kiểm tra nếu không có đơn hàng nào
        if (!orders.length) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng nào.' });
        }

        // Trả về danh sách đơn hàng của người dùng
        res.json(orders);
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error.message);
        res.status(500).json({ message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.' });
    }
});


// API cho admin lấy thông tin đơn hàng
// API cho admin lấy thông tin đơn hàng với sản phẩm
app.get('/orders/admin', async (req, res) => {
    try {
        // Lấy danh sách đơn hàng và nối thông tin sản phẩm
        const orders = await Order.find()
            .populate('items.productId'); // Nối thông tin sản phẩm vào trường items.productId

        res.json(orders);  // Trả về danh sách đơn hàng
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng cho admin:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách đơn hàng' });
    }
});


app.patch('/orders/admin/:id',  async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body; // Lấy trạng thái từ request body

    try {
        // Tìm đơn hàng theo ID
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
        }

        // Cập nhật trạng thái của đơn hàng
        order.status = status;
        await order.save();

        // Gửi thông báo về trạng thái mới cho người dùng
        // Ví dụ có thể gửi email hoặc thông báo qua hệ thống

        // Gửi thông tin cho admin
        res.json({ message: 'Cập nhật trạng thái thành công', order });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


// API hủy đơn hàng
app.patch('/orders/admin/cancel/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        // Tìm đơn hàng theo ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
        }

        // Kiểm tra nếu đơn hàng đã bị hủy
        if (order.status === 'Cancelled') {
            return res.status(400).json({ message: 'Đơn hàng đã bị hủy rồi.' });
        }

        // Xóa đơn hàng khỏi cơ sở dữ liệu
        await Order.findByIdAndDelete(orderId);

        res.json({ message: 'Đơn hàng đã bị hủy và xóa khỏi hệ thống' });
    } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API cho người dùng lấy thông tin đơn hàng của mình
app.get('/orders/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId }).populate('items.productId'); // Nối thông tin sản phẩm
        res.json(orders); // Trả về danh sách đơn hàng của người dùng
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng của người dùng:', error);
        res.status(500).json({ message: 'Lỗi khi lấy đơn hàng' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});
app.set('view engine', 'ejs');
