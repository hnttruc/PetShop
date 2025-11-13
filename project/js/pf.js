document.addEventListener('DOMContentLoaded', function () {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAddress = document.getElementById('userAddress');
    const avatarElement = document.getElementById('avatar');
    const logoutLink = document.getElementById('logoutLink');

    // Lấy thông tin người dùng từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        // Hiển thị thông tin người dùng
        userName.textContent = user.name || 'Người dùng ẩn danh';
        userEmail.textContent = user.email || 'Email chưa cập nhật';
        userAddress.textContent = user.address || 'Địa chỉ chưa cập nhật';
        avatarElement.src = user.avatar || 'default-avatar.jpg'; // Avatar mặc định
    } else {
        // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
        alert('Bạn chưa đăng nhập!');
        window.location.href = './login.html';
    }

    // Xử lý đăng xuất
    logoutLink.addEventListener('click', () => {
        localStorage.clear();
        alert('Đã đăng xuất thành công!');
        window.location.href = './index.html';
    });
});

// Hiển thị form chỉnh sửa thông tin
function openEditForm() {
    const editForm = document.getElementById('editForm');
    editForm.style.display = 'block';

    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('nameInput').value = user.name || '';
        document.getElementById('emailInput').value = user.email || '';
        document.getElementById('addressInput').value = user.address || '';
    }
}

// Hủy chỉnh sửa
function cancelEdit() {
    document.getElementById('editForm').style.display = 'none';
}

// Lưu thay đổi
async function saveChanges() {
    const avatarInput = document.getElementById('avatarInput');
    const nameInput = document.getElementById('nameInput').value.trim();
    const emailInput = document.getElementById('emailInput').value.trim();
    const addressInput = document.getElementById('addressInput').value.trim();

    if (!nameInput || !emailInput) {
        alert('Vui lòng điền đầy đủ tên và email!');
        return;
    }

    let avatarBase64 = null;

    // Kiểm tra nếu người dùng chọn avatar mới
    if (avatarInput.files && avatarInput.files[0]) {
        if (avatarInput.files[0].size > 2 * 1024 * 1024) { // Giới hạn 2MB
            alert('Ảnh đại diện không được vượt quá 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            avatarBase64 = e.target.result;
            await updateUserData(nameInput, emailInput, addressInput, avatarBase64);
        };
        reader.readAsDataURL(avatarInput.files[0]);
    } else {
        await updateUserData(nameInput, emailInput, addressInput, avatarBase64);
    }
}

// Gửi dữ liệu cập nhật đến server
async function updateUserData(name, email, address, avatar) {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        if (!user || !token) {
            alert('Bạn cần đăng nhập để thực hiện thao tác này!');
            return;
        }

        const payload = { userId: user._id, name, email, address };
        if (avatar) payload.avatar = avatar;

        const response = await fetch('http://localhost:3004/updateuser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            user.name = name;
            user.email = email;
            user.address = address;
            user.avatar = avatar || user.avatar;

            localStorage.setItem('user', JSON.stringify(user));
            alert('Cập nhật thành công!');

            document.getElementById('userName').textContent = name;
            document.getElementById('userEmail').textContent = email;
            document.getElementById('avatar').src = user.avatar;

            cancelEdit();
        } else if (response.status === 401) {
            alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
            localStorage.clear();
            window.location.href = './login.html';
        } else {
            alert('Cập nhật thất bại: ' + result.message);
        }
    } catch (error) {
        alert('Lỗi kết nối đến server: ' + error.message);
    }
}
