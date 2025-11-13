// Hàm hiển thị các sản phẩm trong giỏ hàng
function displayBasketItems() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedBasketItems'));
    const basketContainer = document.getElementById('basket-container');
    
    basketContainer.innerHTML = ''; // Xóa nội dung cũ

    if (selectedItems && selectedItems.length > 0) {
        selectedItems.forEach(item => {
            const productCard = `
                <div class="d-flex align-items-center mb-3 border-bottom pb-3">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;" class="rounded me-3">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.name}</h6>
                        <p class="text-primary mb-1">${item.price.toLocaleString()} VND</p>
                        <p>Số lượng: ${item.quantity}</p>
                    </div>
                </div>
            `;
            basketContainer.innerHTML += productCard;
        });
    } else {
        basketContainer.innerHTML = '<p>Giỏ hàng của bạn trống.</p>';
    }
}

// Hàm gọi khi trang được tải để hiển thị form thanh toán
document.addEventListener('DOMContentLoaded', function () {
    displayBasketItems();  // Hiển thị giỏ hàng
    fillPaymentForm();  // Điền thông tin người dùng vào form thanh toán

    const paymentForm = document.getElementById('paymentForm');
    paymentForm.style.display = 'block'; // Hiển thị form thanh toán
});

// Giải mã JWT
function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Điền thông tin người dùng từ token
function fillPaymentForm() {
    const token = localStorage.getItem('authToken'); // Lấy token từ localStorage

    if (token) {
        try {
            const userData = decodeJWT(token); // Giải mã token để lấy thông tin người dùng

            // Điền thông tin vào các trường trong form
            document.getElementById('fullName').value = userData.fullName || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('address').value = userData.address || '';
        } catch (error) {
            console.error('Lỗi khi giải mã token:', error);
        }
    }
}

async function submitPayment() {
    // Lấy thông tin sản phẩm trong giỏ hàng
    const selectedItems = JSON.parse(localStorage.getItem('selectedBasketItems') || '[]');

    if (selectedItems.length === 0) {
        alert('Không có sản phẩm nào để thanh toán.');
        return;
    }

    // Lấy thông tin người dùng từ form thanh toán
    const fullName = document.getElementById('fullName').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Lấy phương thức thanh toán
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;

    if (!paymentMethod) {
        alert('Vui lòng chọn phương thức thanh toán.');
        return;
    }

    if (!fullName || !address || !email || !phone) {
        alert('Vui lòng nhập đầy đủ thông tin.');
        return;
    }

    // Tính tổng số tiền thanh toán
    const totalAmount = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Lấy userId từ localStorage
    const userId = localStorage.getItem('userId');

    // Tạo đối tượng đơn hàng cần gửi cho admin
    const orderData = {
        fullName: fullName,
        address: address,
        email: email,
        phone: phone,
        items: selectedItems, // Thông tin sản phẩm trong giỏ hàng
        totalAmount: totalAmount, // Tổng số tiền
        userId: userId, // ID người dùng
        paymentMethod: paymentMethod, // Phương thức thanh toán
    };

    try {
        // Gửi yêu cầu thanh toán đến server (admin)
        const response = await fetch('http://localhost:3004/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Thêm token vào header
            },
            body: JSON.stringify(orderData), // Gửi thông tin đơn hàng
        });

        const result = await response.json();

        if (response.ok) {
            alert('Thanh toán thành công!');
            localStorage.removeItem('selectedBasketItems'); // Xóa giỏ hàng sau khi thanh toán
            window.location.href = 'od.html'; // Chuyển hướng đến trang đơn hàng
        } else {
            alert(`Lỗi: ${result.message}`);
        }
    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu thanh toán:', error);
        alert('Đã xảy ra lỗi khi thanh toán.');
    }
}
