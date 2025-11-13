document.addEventListener('DOMContentLoaded', function () {
    const userLink = document.getElementById('userLink');
    const userAvatar = document.getElementById('userAvatar');
    const avatarImage = document.getElementById('avatarImage');
    const userName = document.getElementById('userName');
    const profileLink = document.getElementById('profileLink');
    const avatarLink = document.getElementById('avatarLink');
    const avatarDropdownMenu = document.getElementById('avatarDropdownMenu');

    // Lấy thông tin người dùng từ localStorage
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error('Lỗi khi lấy thông tin người dùng từ localStorage', e);
    }

    if (user) {
        // Hiển thị avatar người dùng nếu đã đăng nhập
        avatarImage.src = user.avatar || 'default-avatar.jpg'; // Avatar mặc định nếu không có
        userAvatar.style.display = 'flex'; // Hiển thị avatar
        userLink.style.display = 'none'; // Ẩn nút đăng nhập

        const viewOrdersLink = document.getElementById('viewOrdersLink');
if (user.role === 'admin') {
    cartIcon.style.display = 'none'; // Ẩn giỏ hàng cho admin
    adminMenu.style.display = 'block'; // Hiển thị mục quản lý cho admin
    if (viewOrdersLink) viewOrdersLink.style.display = 'none'; // Ẩn "Xem đơn hàng" cho admin
} else {
    cartIcon.style.display = 'block'; // Hiển thị giỏ hàng cho người dùng bình thường
    adminMenu.style.display = 'none'; // Ẩn mục quản lý cho người dùng bình thường
    if (viewOrdersLink) viewOrdersLink.style.display = 'block'; // Hiển thị "Xem đơn hàng" cho user
}

    } else {
        // Nếu chưa đăng nhập, chỉ hiển thị nút đăng nhập
        userAvatar.style.display = 'none';
        userLink.style.display = 'block';
    }

    // Thêm sự kiện cho avatar để mở/đóng dropdown khi nhấn vào avatar
    avatarLink.addEventListener('click', function (e) {
        e.preventDefault(); // Ngừng hành động mặc định (ngừng chuyển đến pf.html)
        
        // Kiểm tra xem menu có đang hiển thị không, nếu có thì ẩn, nếu không thì hiển thị
        avatarDropdownMenu.style.display = avatarDropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Đóng menu nếu người dùng nhấn ra ngoài
    document.addEventListener('click', function (e) {
        if (!userAvatar.contains(e.target)) {
            avatarDropdownMenu.style.display = 'none'; // Ẩn menu nếu người dùng nhấn ra ngoài
        }
    });
});

logoutLink.addEventListener('click', () => {
    localStorage.clear();
    alert('Đã đăng xuất thành công!');
    window.location.href = './index.html';
});



async function updateCartIconMain() {
    try {
        const response = await fetch('http://localhost:3004/cart', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();

        const count = data.cart ? data.cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

        // Cập nhật số lượng vào biểu tượng giỏ hàng
        const basketCountElem = document.querySelector('.basket-count');
        if (basketCountElem) {
            basketCountElem.textContent = count;
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật biểu tượng giỏ hàng:', error);
    }
}

// Gọi hàm ngay khi trang được tải
if (localStorage.getItem('token')) {
    updateCartIconMain();
}






