document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById("registerForm");
    const registerButton = document.getElementById("registerButton");

    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault(); // Ngăn việc tải lại trang khi submit

            // Lấy giá trị từ form
            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value.trim();
            const address = document.getElementById("registerAddress").value.trim();
            // Kiểm tra dữ liệu đầu vào
            if (!name || !email || !password || !address) {
                alert("Vui lòng điền đầy đủ thông tin.");
                return;
            }

            if (!/^\S+@\S+\.\S+$/.test(email)) { // Kiểm tra định dạng email
                alert("Email không hợp lệ.");
                return;
            }

            // Disable nút và hiển thị thông báo đang xử lý
            if (registerButton) {
                registerButton.disabled = true;
                registerButton.textContent = "Đang đăng ký...";
            }

            try {
                // Gửi dữ liệu đăng ký đến server qua Fetch API
                const response = await fetch("http://localhost:3004/signup", { // Thay URL khi triển khai
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    // Xử lý lỗi từ server
                    alert(data.message || "Đăng ký thất bại. Vui lòng thử lại.");
                } else {
                    alert(data.message); // Hiển thị thông báo thành công
                    if (data.message === "Đăng ký thành công!") {
                        // Đóng modal đăng ký sau khi thành công
                        if ($('#registerModal').length) {
                            $('#registerModal').modal('hide');
                        }
                        registerForm.reset(); // Xóa dữ liệu trong form
                    }
                }
            } catch (error) {
                console.error("Lỗi đăng ký:", error);
                alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
            } finally {
                // Đảm bảo bật lại nút đăng ký khi hoàn tất
                if (registerButton) {
                    registerButton.disabled = false;
                    registerButton.textContent = "Đăng ký";
                }
            }
        });
    }
});
