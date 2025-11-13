const API_URL = 'http://localhost:3004'; // URL của server
const token = localStorage.getItem('token'); // Lấy token từ LocalStorage
let cachedCart = null; // Bộ nhớ đệm giỏ hàng
const basketContainer = document.getElementById('basket-container');
// Hàm cập nhật biểu tượng giỏ hàng
async function updateCartIcon() {
    try {
        // Nếu `cachedCart` chưa có hoặc không hợp lệ, gọi API để lấy dữ liệu
        if (!cachedCart) {
            const response = await fetch(`${API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            cachedCart = await response.json();
        }

        // Tính số lượng sản phẩm
        const count = cachedCart.cart
            ? cachedCart.cart.items.reduce((total, item) => total + item.quantity, 0)
            : 0;

        // Cập nhật biểu tượng giỏ hàng
        document.querySelector('.basket-count').textContent = count;
    } catch (error) {
        console.error('Lỗi khi cập nhật biểu tượng giỏ hàng:', error);
    }
}



// Hàm tính tổng tiền khi chọn sản phẩm
function calculateTotal() {
    let totalAmount = 0;
    const checkboxes = document.querySelectorAll('.product-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            const price = parseInt(checkbox.dataset.price, 10);
            const quantity = parseInt(checkbox.dataset.quantity, 10);
            totalAmount += price * quantity;
        }
    });

    // Cập nhật giao diện
    document.getElementById('total-price').textContent = `${totalAmount.toLocaleString()} VND`;
}


// Hiển thị sản phẩm trong giỏ hàng
async function displayBasket() {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        const basketContainer = document.getElementById('basket-container');
        const totalPriceElem = document.getElementById('total-price'); // Define totalPriceElem here
        const emptyMessage = document.getElementById('empty-message');

        basketContainer.innerHTML = ''; // Xóa nội dung cũ
        let totalPrice = 0;

        if (data.cart && data.cart.items.length > 0) {
            data.cart.items.forEach(item => {
                totalPrice += item.productId.price * item.quantity;

                const productCard = `
                    <div class="d-flex align-items-center mb-3 border-bottom pb-3" id="product-${item.productId._id}">
                        <img src="${item.productId.image}" alt="${item.productId.name}" style="width: 80px; height: 80px; object-fit: cover;" class="rounded me-3">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${item.productId.name}</h6>
                            <p class="text-primary mb-1">${item.productId.price.toLocaleString()} VND</p>
                            <div class="input-group" style="width: 120px;">
                                <button class="btn btn-outline-secondary decrease" data-id="${item.productId._id}">-</button>
                                <input type="number" class="form-control quantity-input text-center" value="${item.quantity}" min="1" data-id="${item.productId._id}">
                                <button class="btn btn-outline-secondary increase" data-id="${item.productId._id}">+</button>
                            </div>
                        </div>
                        <div class="text-end">
                            <button class="btn btn-danger btn-sm" onclick="removeFromBasket('${item.productId._id}')">Xóa</button>
                            <div class="form-check mt-2">
                                <input type="checkbox" class="form-check-input product-checkbox" data-id="${item.productId._id}" data-price="${item.productId.price}" data-quantity="${item.quantity}">
                                <label class="form-check-label">Chọn</label>
                            </div>
                        </div>
                    </div>
                `;

                basketContainer.innerHTML += productCard;
            });

            // Cập nhật tổng tiền
            totalPriceElem.textContent = `${totalPrice.toLocaleString()} VND`;
            emptyMessage.style.display = 'none';
        } else {
            emptyMessage.textContent = 'Giỏ hàng của bạn trống.';
            emptyMessage.style.display = 'block';
        }
        await updateCartIcon(); 
    } catch (error) {
        console.error('Lỗi khi hiển thị giỏ hàng:', error);
    }
}

    // Cập nhật sự kiện cho checkbox "Chọn tất cả"
document.getElementById('select-all').addEventListener('change', (event) => {
    const isChecked = event.target.checked;
    const productCheckboxes = document.querySelectorAll('.product-checkbox');

    productCheckboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });

    // Cập nhật tổng tiền khi thay đổi lựa chọn sản phẩm
    calculateTotal();
});

// Cập nhật sự kiện khi thay đổi trạng thái của checkbox sản phẩm
document.getElementById('basket-container').addEventListener('change', (event) => {
    if (event.target.classList.contains('product-checkbox')) {
        // Kiểm tra nếu tất cả sản phẩm được chọn thì chọn checkbox "Chọn tất cả"
        const allCheckboxes = document.querySelectorAll('.product-checkbox');
        const selectAllCheckbox = document.getElementById('select-all');

        selectAllCheckbox.checked = Array.from(allCheckboxes).every(checkbox => checkbox.checked);

        calculateTotal(); // Cập nhật tổng tiền khi thay đổi lựa chọn sản phẩm
    }
});


// Xóa sản phẩm khỏi giỏ hàng
async function removeFromBasket(productId) {
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });
        const data = await response.json();
        if (data.message) alert(data.message);

        // Cập nhật lại giỏ hàng và biểu tượng
        cachedCart = null; // Làm mới cache
        await displayBasket();
        await updateCartIcon();
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    }
}


// Xử lý thay đổi số lượng (tăng/giảm hoặc nhập trực tiếp)
document.getElementById('basket-container').addEventListener('click', async (event) => {
    const target = event.target;
    const productId = target.dataset.id;

    if (target.classList.contains('increase') || target.classList.contains('decrease')) {
        const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
        let newQuantity = parseInt(input.value);

        if (target.classList.contains('increase')) {
            newQuantity++;
        } else if (target.classList.contains('decrease') && newQuantity > 1) {
            newQuantity--;
        }

        input.value = newQuantity;

        // Gửi yêu cầu cập nhật số lượng đến server
        try {
            const response = await fetch(`${API_URL}/updateQuantity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: newQuantity }),
            });
            const data = await response.json();
            if (data.message) alert(data.message);
            await displayBasket();
            await updateCartIcon(); 
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
        }
    }
});

// Xử lý nhập số lượng trực tiếp
document.getElementById('basket-container').addEventListener('change', async (event) => {
    const target = event.target;
    if (target.classList.contains('quantity-input')) {
        const productId = target.dataset.id;
        const newQuantity = parseInt(target.value);

        if (newQuantity > 0) {
            try {
                const response = await fetch(`${API_URL}/updateQuantity`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ productId, quantity: newQuantity }),
                });
                const data = await response.json();
                if (data.message) alert(data.message);
                await displayBasket();
                await updateCartIcon(); 
            } catch (error) {
                console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
            }
        } else {
            alert('Số lượng không hợp lệ.');
            target.value = 1; // Gán lại số lượng tối thiểu
        }
    }
});

// Cập nhật tổng tiền khi chọn hoặc bỏ chọn sản phẩm
document.getElementById('basket-container').addEventListener('change', (event) => {
    if (event.target.classList.contains('product-checkbox')) {
        calculateTotal(); // Cập nhật tổng tiền khi thay đổi lựa chọn sản phẩm
    }
});

// Kiểm tra đăng nhập và hiển thị giỏ hàng
if (!token) {
    alert('Vui lòng đăng nhập để xem giỏ hàng.');
    window.location.href = './login.html';
} else {
    displayBasket();
    updateCartIcon();
}


function getAllSelectedBasketItems() {
    const selectedBasketItems = [];
    const productElements = document.querySelectorAll('#basket-container .d-flex'); // Lấy tất cả sản phẩm trong giỏ hàng

    productElements.forEach(item => {
        const checkbox = item.querySelector('.product-checkbox'); // Lấy checkbox của sản phẩm
        if (checkbox && checkbox.checked) { // Kiểm tra nếu checkbox được chọn
            const productId = checkbox.dataset.id;
            const productName = item.querySelector('h6').textContent;
            const productPrice = parseInt(item.querySelector('.text-primary').textContent.replace(/\D/g, ''), 10);
            const productQuantity = parseInt(item.querySelector('.quantity-input').value, 10);
            const productImage = item.querySelector('img').src;

            if (productQuantity > 0) {
                const product = {
                    productId,
                    name: productName,
                    price: productPrice,
                    quantity: productQuantity,
                    image: productImage
                };

                selectedBasketItems.push(product); // Thêm sản phẩm đã chọn vào mảng
            }
        }
    });

    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('selectedBasketItems', JSON.stringify(selectedBasketItems));
    return selectedBasketItems;
}


// Xử lý sự kiện checkout
// Xử lý sự kiện checkout
document.getElementById('checkout-btn').addEventListener('click', () => {
    const selectedItems = getAllSelectedBasketItems(); // Lấy các sản phẩm đã chọn

    if (selectedItems.length > 0) {
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems)); // Lưu thông tin các sản phẩm đã chọn
        window.location.href = 'pay.html';  // Chuyển đến trang thanh toán
    } else {
        alert('Vui lòng chọn sản phẩm để thanh toán.');
    }
});


// Đặt hàng
async function placeOrder() {
    const selectedItems = getSelectedItems();  // Lấy danh sách sản phẩm đã chọn

    if (selectedItems.length === 0) {
        alert('Vui lòng chọn sản phẩm để đặt hàng.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items: selectedItems }), // Gửi các sản phẩm đã chọn
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message || 'Đặt hàng thành công!');
            await removeSelectedItemsFromCart(selectedItems);
            await displayBasket();
            await updateCartIcon();
        } else {
            alert(result.message || 'Đặt hàng không thành công.');
        }
    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        alert('Đã xảy ra lỗi khi đặt hàng.');
    }
}

// Xóa sản phẩm khỏi giỏ hàng
async function removeSelectedItemsFromCart(selectedItems) {
    try {
        for (const item of selectedItems) {
            await fetch(`${API_URL}/cart`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId: item.productId }),
            });
        }
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    }
}


// Cập nhật giỏ hàng và biểu tượng khi tải trang
(async () => {
    await displayBasket();
    await updateCartIcon();
})();