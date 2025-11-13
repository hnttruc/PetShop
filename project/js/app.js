document.addEventListener('DOMContentLoaded', function () {
    const addProductForm = document.getElementById('addProductForm');
    const cancelButton = document.getElementById('cancelButton');
    const productList = document.getElementById('productList');

    let currentProductId = null;  // Biến lưu ID của sản phẩm đang được chỉnh sửa

    // Lắng nghe sự kiện submit form
    addProductForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Ngừng gửi form đi
        
        const productName = document.getElementById('productName').value;
        const productPrice = document.getElementById('productPrice').value;
        const productDescription = document.getElementById('productDescription').value;
        const productImage = document.getElementById('productImage').files[0];
        const category = document.getElementById('product-category').value;

        if (!productName || !productPrice || !productDescription || !category) {
            alert('Vui lòng điền đầy đủ thông tin sản phẩm.');
            return;
        }
        
        // Xử lý ảnh nếu có
        let imageURL = "";
        if (productImage) {
            const reader = new FileReader();
            reader.onload = function() {
                imageURL = reader.result;
                if (currentProductId) {
                    // Nếu có ID sản phẩm, gọi API sửa sản phẩm
                    updateProduct(currentProductId, productName, productPrice, productDescription, imageURL, category);
                } else {
                    // Nếu không có ID sản phẩm, gọi API thêm mới
                    addProduct(productName, productPrice, productDescription, imageURL, category);
                }
                resetForm();
            };
            reader.readAsDataURL(productImage);
        } else {
            if (currentProductId) {
                updateProduct(currentProductId, productName, productPrice, productDescription, imageURL, category);
            } else {
                addProduct(productName, productPrice, productDescription, imageURL, category);
            }
            resetForm();
        }
    });


    // Thêm mới sản phẩm với loại sản phẩm
    function addProduct(name, price, description, image, category) {
        fetch('http://localhost:3004/addproduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, price, description, image: image || "", category })
        })
        .then(response => response.json())
        .then(data => {
            alert('Sản phẩm đã được thêm!');
            displayProducts(); // Cập nhật lại danh sách sản phẩm
        })
        .catch(error => alert('Lỗi: ' + error));
    }

    // Sửa sản phẩm



    // Hiển thị tất cả sản phẩm
    function displayProducts() {
        fetch('http://localhost:3004/products')
            .then(response => response.json())
            .then(products => {
                const productList = document.getElementById('productList');
                productList.innerHTML = '';  // Xóa danh sách sản phẩm hiện tại
    
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('col-lg-4', 'col-md-6', 'mb-4');
                    productCard.innerHTML = `
                        <div class="card h-100" data-id="${product._id}">
                            <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 150px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="text-primary"><strong>${product.price.toLocaleString()} VND</strong></p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-warning edit-button">Sửa</button>
                                <button class="btn btn-danger delete-button">Xóa</button>
                            </div>
                        </div>
                    `;
                    productList.appendChild(productCard);
    
                    // Lắng nghe sự kiện cho nút Sửa và Xóa
                    productCard.querySelector('.edit-button').addEventListener('click', function() {
                        editProduct(product._id);  // Sử dụng _id thay vì id
                    });
                    productCard.querySelector('.delete-button').addEventListener('click', function() {
                        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                            deleteProduct(product._id);  // Sử dụng _id thay vì id
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải sản phẩm:', error);
            });
    }


    
    // Xóa sản phẩm
    function deleteProduct(productId) {
        fetch(`http://localhost:3004/products/${productId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            alert('Sản phẩm đã bị xóa!');
            removeProductFromList(productId);  // Xóa sản phẩm khỏi danh sách hiển thị
        })
        .catch(error => alert('Lỗi: ' + error));
    }

    // Hàm xóa sản phẩm khỏi danh sách hiển thị
function removeProductFromList(productId) {
    const productCard = document.querySelector(`div[data-id='${productId}']`);  // Tìm thẻ sản phẩm theo ID
    if (productCard) {
        productCard.remove();  // Xóa sản phẩm khỏi DOM
    } else {
        console.log(`Không tìm thấy sản phẩm với ID: ${productId}`);
    }
}

// Hàm reset form sau khi thêm/sửa
function resetForm() {
    // Reset tất cả các trường trong form về giá trị mặc định (rỗng)
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImage').value = '';
    
    // Reset ID sản phẩm (dùng khi đang chỉnh sửa sản phẩm)
    currentProductId = null;  // Reset lại ID sản phẩm
}

    // Khi trang được tải, hiển thị danh sách sản phẩm
    displayProducts();

    // Khi nhấn nút Thoát, quay lại trang chủ
    cancelButton.addEventListener('click', function() {
        window.location.href = './product.html';
    });
});


// Cập nhật thông tin sản phẩm
async function updateProduct(productId, updatedData) {
    try {
        const response = await fetch(`http://localhost:3004/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_JWT_TOKEN',  // Nếu cần xác thực
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Cập nhật sản phẩm thành công:', result.product);
        } else {
            console.error('Lỗi khi cập nhật sản phẩm:', result.message);
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
    }
}



    // Hàm cập nhật lại thông tin sản phẩm trong giao diện
    function displayUpdatedProduct(product) {
        // Cập nhật lại các trường thông tin trên giao diện
        productNameInput.value = product.name;
        productPriceInput.value = product.price;
        productDescriptionInput.value = product.description;
        productCategoryInput.value = product.category; // Cập nhật loại sản phẩm
        productImageInput.value = '';  // Không tự động điền ảnh vào

        // Cập nhật thông tin sản phẩm trên các danh sách sản phẩm (nếu có)
        const productCard = document.querySelector(`.card[data-id="${product._id}"]`);
        if (productCard) {
            productCard.querySelector('.product-name').textContent = product.name;
            productCard.querySelector('.product-price').textContent = `${product.price.toLocaleString()} VND`;
            productCard.querySelector('img').src = product.image || 'default_image_url'; // Nếu có trường hình ảnh
        }
    }

    // Hàm lấy thông tin sản phẩm cần sửa
    // Các input cần lấy
const productNameInput = document.getElementById('productName');
const productPriceInput = document.getElementById('productPrice');
const productDescriptionInput = document.getElementById('productDescription');
const productImageInput = document.getElementById('productImage');
const category = document.getElementById('productCategory').value;  // Lấy giá trị category

// Biến toàn cục để lưu ID sản phẩm hiện tại
let currentProductId = null;

// Hàm lấy thông tin sản phẩm cần sửa
function editProduct(productId) {
    fetch(`http://localhost:3004/product/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không tìm thấy sản phẩm hoặc có lỗi với API');
            }
            return response.json();
        })
        .then(product => {
            // Điền thông tin sản phẩm vào form
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productDescriptionInput.value = product.description;
            productImageInput.value = '';  // Không tự động điền ảnh vào

            // Lưu lại ID của sản phẩm đang sửa
            currentProductId = productId;

            // Ẩn nút "Thêm sản phẩm" và hiển thị nút "Cập nhật"
            document.getElementById('add').style.display = 'none';
            document.getElementById('update').style.display = 'inline-block';
        })
        .catch(error => alert('Lỗi khi lấy thông tin sản phẩm: ' + error));
}


// Hàm cập nhật thông tin sản phẩm trong cơ sở dữ liệu
function updateProduct(productId, name, price, description, image, category) {
    fetch(`http://localhost:3004/product/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, price, description, image, category })
    })
    .then(response => response.json())
    .then(data => {
        alert('Sản phẩm đã được cập nhật!');
        displayProducts();  // Cập nhật lại danh sách sản phẩm
        resetForm();  // Reset form sau khi cập nhật
    })
    .catch(error => alert('Lỗi: ' + error));
}

        // Hàm cập nhật sản phẩm
function updateProduct() {
    const name = productNameInput.value;
    const price = productPriceInput.value;
    const description = productDescriptionInput.value;
    const image = productImageInput.value;  // Lấy giá trị ảnh từ input
    const category = productCategoryInput.value;  // Lấy giá trị category từ input (nếu có)

    // Đảm bảo URL chính xác
    fetch(`http://localhost:3004/product/${currentProductId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            price: price,
            description: description,
            image: image,  // Truyền giá trị ảnh vào
            category: category,  // Đảm bảo có category trong request
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sản phẩm đã được cập nhật:', data);

        // Cập nhật lại giao diện sau khi sửa
        // Hiển thị lại nút "Thêm sản phẩm" và ẩn nút "Cập nhật"
        document.getElementById('add').style.display = 'inline-block';
        document.getElementById('update').style.display = 'none';

        // Bạn có thể gọi lại hàm hiển thị sản phẩm nếu muốn làm mới danh sách
        displayProducts();
    })
    .catch(error => {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
    });
}

        // Hàm cập nhật lại thông tin sản phẩm trong giao diện
        function displayUpdatedProduct(product) {
            // Cập nhật lại các trường thông tin trên giao diện
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productDescriptionInput.value = product.description;
            productCategoryInput.value = product.category; // Cập nhật loại sản phẩm
            productImageInput.value = '';  // Không tự động điền ảnh vào
    
            // Cập nhật thông tin sản phẩm trên các danh sách sản phẩm (nếu có)
            const productCard = document.querySelector(`.card[data-id="${product._id}"]`);
            if (productCard) {
                productCard.querySelector('.product-name').textContent = product.name;
                productCard.querySelector('.product-price').textContent = `${product.price.toLocaleString()} VND`;
                productCard.querySelector('img').src = product.image || 'default_image_url'; // Nếu có trường hình ảnh
            }
        }
    
       
    // Reset form sau khi cập nhật sản phẩm
function resetForm() {
    productNameInput.value = '';
    productPriceInput.value = '';
    productDescriptionInput.value = '';
    productImageInput.value = '';
    document.getElementById('product-category').value = '';

    // Hiển thị lại nút "Thêm sản phẩm" và ẩn nút "Cập nhật"
    document.getElementById('add').style.display = 'inline-block';
    document.getElementById('update').style.display = 'none';

    currentProductId = null;
}

    






   

   

   

  
