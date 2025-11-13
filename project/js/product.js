document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');

    try {
        const response = await fetch('http://localhost:3004/products');
        const products = await response.json();

        // Duyệt qua danh sách sản phẩm và hiển thị từng sản phẩm
        products.forEach(product => {
            const shortDescription = product.description.length > 50 
                ? product.description.substring(0, 50) + '...'
                : product.description;
        
                const productHTML = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 shadow-sm border-light rounded-lg" data-id="${product._id}">
                        <!-- Ảnh sản phẩm -->
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover; border-radius: 8px;">
                        <div class="card-body text-center">
                            <!-- Tên sản phẩm -->
                            <h5 class="card-title product-name" style="cursor: pointer; font-size: 1.1rem; color: #333;" data-id="${product._id}">
                                <strong>${product.name}</strong>
                            </h5>
                            <!-- Giá sản phẩm -->
                            <p class="text-primary mb-3" style="font-size: 1.1rem;">
                                <strong>${product.price.toLocaleString()} VND</strong>
                            </p>
                            <!-- Mô tả ngắn và Xem thêm -->
                            <p class="card-text" style="font-size: 0.9rem; color: #6c757d;">
                                <span class="short-description">${shortDescription}</span>
                                <span class="full-description" style="display: none; color: #333;">${product.description}</span> <!-- Mô tả dài ẩn -->
                                <a href="javascript:void(0);" class="view-more" data-id="${product._id}" style="color: #007bff; text-decoration: none;">Xem thêm</a>
                            </p>
                        </div>
                        <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                            <!-- Thêm vào giỏ hàng -->
                            <button class="btn btn-outline-primary add-to-cart" data-id="${product._id}" style="border-radius: 20px; padding: 8px 20px;">
                                <i class="bi bi-cart-plus"></i> 
                            </button>
                            <!-- Mua ngay -->
                            <button class="btn btn-warning buy-now" data-id="${product._id}" style="border-radius: 20px; padding: 8px 20px; color: #fff;">
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productList.innerHTML += productHTML;
        });
    
        // Lắng nghe sự kiện click trên tất cả các liên kết "Xem thêm"
        document.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('view-more')) {
                const productId = event.target.getAttribute('data-id');
                const productCard = event.target.closest('.card');
                const shortDescriptionElem = productCard.querySelector('.short-description');
                const fullDescriptionElem = productCard.querySelector('.full-description');
    
                // Toggle hiển thị mô tả đầy đủ
                if (fullDescriptionElem.style.display === 'none') {
                    fullDescriptionElem.style.display = 'inline';
                    event.target.textContent = 'Thu gọn';  // Đổi thành "Thu gọn"
                } else {
                    fullDescriptionElem.style.display = 'none';
                    event.target.textContent = 'Xem thêm';  // Đổi lại thành "Xem thêm"
                }
            }
        });
    
        // Gắn sự kiện cho các nút "Thêm vào giỏ hàng"
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);  // Mặc định quantity là 1
            });
        });
        
        // Gắn sự kiện cho các nút "Mua ngay"
        const buyNowButtons = document.querySelectorAll('.buy-now');
        buyNowButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId); // Gọi hàm thêm sản phẩm vào giỏ hàng
    
                // Chuyển hướng đến trang giỏ hàng ngay sau khi thêm sản phẩm
                setTimeout(() => {
                    window.location.href = 'basket.html'; // Chuyển hướng đến trang giỏ hàng
                }, 500); // Thời gian chờ trước khi chuyển hướng (500ms để đảm bảo sản phẩm được thêm vào giỏ)
            });
        });
    
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm:', error);
    }
});


// Hàm thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
        return;
    }

    // Dữ liệu cần gửi
    const data = {
        productId: productId, // Đảm bảo productId là chuỗi hợp lệ
        quantity: 1           // Số lượng mặc định là 1
    };

    fetch('http://localhost:3004/cart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Token từ localStorage
            'Content-Type': 'application/json'  // Định dạng JSON
        },
        body: JSON.stringify(data) // Chuyển đổi object sang JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Lỗi HTTP! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert('Sản phẩm đã được thêm vào giỏ hàng');
        updateCartIconMain(); // Cập nhật biểu tượng giỏ hàng sau khi thêm sản phẩm
    })
    .catch(error => {
        console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
    });
}




// Hàm lọc sản phẩm theo danh mục
async function filterProducts(category) {
    try {
        // Chỉ gọi API khi cần, tránh lặp lại
        const cachedProducts = window.cachedProducts || [];
        let products = cachedProducts;

        if (!products.length) {
            const response = await fetch('http://localhost:3004/products');
            products = await response.json();
            window.cachedProducts = products; // Lưu vào bộ nhớ tạm (cache)
        }

        // Sử dụng bộ lọc trực tiếp
        const filteredProducts = category === 'all'
            ? products
            : products.filter(product => product.category === category);

        displayProducts(filteredProducts); // Hiển thị sản phẩm đã lọc
    } catch (error) {
        console.error('Lỗi khi lọc sản phẩm:', error);
    }
}


// Hàm hiển thị sản phẩm
function displayProducts(products) {
    const productList = document.getElementById('product-list');
    if (!productList) {
        console.error('Không tìm thấy phần tử với ID "product-list".');
        return;
    }

    productList.innerHTML = ''; // Xóa danh sách sản phẩm cũ

    products.forEach(product => {
            const shortDescription = product.description.length > 50 
                ? product.description.substring(0, 50) + '...'
                : product.description;
        
                

        const productHTML = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card h-100 shadow-sm border-light rounded-lg" data-id="${product._id}">
                        <!-- Ảnh sản phẩm -->
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover; border-radius: 8px;">
                        <div class="card-body text-center">
                            <!-- Tên sản phẩm -->
                            <h5 class="card-title product-name" style="cursor: pointer; font-size: 1.1rem; color: #333;" data-id="${product._id}">
                                <strong>${product.name}</strong>
                            </h5>
                            <!-- Giá sản phẩm -->
                            <p class="text-primary mb-3" style="font-size: 1.1rem;">
                                <strong>${product.price.toLocaleString()} VND</strong>
                            </p>
                            <!-- Mô tả ngắn và Xem thêm -->
                            <p class="card-text" style="font-size: 0.9rem; color: #6c757d;">
                                <span class="short-description">${shortDescription}</span>
                                <span class="full-description" style="display: none; color: #333;">${product.description}</span> <!-- Mô tả dài ẩn -->
                                <a href="javascript:void(0);" class="view-more" data-id="${product._id}" style="color: #007bff; text-decoration: none;">Xem thêm</a>
                            </p>
                        </div>
                        <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                            <!-- Thêm vào giỏ hàng -->
                            <button class="btn btn-outline-primary add-to-cart" data-id="${product._id}" style="border-radius: 20px; padding: 8px 20px;">
                                <i class="bi bi-cart-plus"></i> 
                            </button>
                            <!-- Mua ngay -->
                            <button class="btn btn-warning buy-now" data-id="${product._id}" style="border-radius: 20px; padding: 8px 20px; color: #fff;">
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productList.innerHTML += productHTML;
        });
    
        // Lắng nghe sự kiện click trên tất cả các liên kết "Xem thêm"
        document.addEventListener('click', function(event) {
            if (event.target && event.target.classList.contains('view-more')) {
                const productId = event.target.getAttribute('data-id');
                const productCard = event.target.closest('.card');
                const shortDescriptionElem = productCard.querySelector('.short-description');
                const fullDescriptionElem = productCard.querySelector('.full-description');
    
                // Toggle hiển thị mô tả đầy đủ
                if (fullDescriptionElem.style.display === 'none') {
                    fullDescriptionElem.style.display = 'inline';
                    event.target.textContent = 'Thu gọn';  // Đổi thành "Thu gọn"
                } else {
                    fullDescriptionElem.style.display = 'none';
                    event.target.textContent = 'Xem thêm';  // Đổi lại thành "Xem thêm"
                }
            }
        });
    
        // Gắn sự kiện cho các nút "Thêm vào giỏ hàng"
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId);  // Mặc định quantity là 1
            });
        });
        
        // Gắn sự kiện cho các nút "Mua ngay"
        const buyNowButtons = document.querySelectorAll('.buy-now');
        buyNowButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                addToCart(productId); // Gọi hàm thêm sản phẩm vào giỏ hàng
    
                // Chuyển hướng đến trang giỏ hàng ngay sau khi thêm sản phẩm
                setTimeout(() => {
                    window.location.href = 'basket.html'; // Chuyển hướng đến trang giỏ hàng
                }, 500); // Thời gian chờ trước khi chuyển hướng (500ms để đảm bảo sản phẩm được thêm vào giỏ)
            });
        });
    
    


// Lắng nghe sự kiện khi người dùng chọn thể loại
const categoryButtons = document.querySelectorAll('.product-categories .btn-group .btn');
categoryButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const category = event.target.dataset.category; // Lấy category từ data-attribute
        filterProducts(category);
    });
});

}
