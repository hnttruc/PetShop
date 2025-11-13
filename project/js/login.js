const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngừng hành động mặc định của form

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
        alert("Vui lòng nhập email và mật khẩu.");
        return;
    }
    
    // Kiểm tra định dạng email
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert("Email không hợp lệ.");
        return;
    }

    // Kiểm tra độ dài mật khẩu (ít nhất 6 ký tự)
   

    try {
        // Gửi dữ liệu đến server
        const response = await fetch('http://localhost:3004/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            // Hiển thị thông báo lỗi nếu có từ server
            alert(result.message || 'Lỗi đăng nhập'); 
            return;
        }

        console.log(result);  // Kiểm tra nội dung phản hồi từ server

        if (result.user) {
            // Nếu đăng nhập thành công, lưu trạng thái đăng nhập và thông tin người dùng vào localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(result.user));  // Lưu thông tin người dùng
            localStorage.setItem('token', result.token);  // Lưu token vào localStorage (nếu có)

            alert('Đăng nhập thành công!');
            
            // Xóa dữ liệu trong các trường nhập liệu
            document.getElementById("loginEmail").value = "";
            document.getElementById("loginPassword").value = "";
        
            // Chuyển hướng người dùng đến trang index
            window.location.href = 'index.html'; // Chuyển hướng đến trang index
        }
        

    } catch (error) {
        console.error('Lỗi đăng nhập:', error.message);  // In lỗi ra console
        alert('Lỗi đăng nhập: ' + error.message);  // Thông báo lỗi cho người dùng
    }
});
