

function toggleElement(descriptionId, linkId) {
    var fullDescription = document.getElementById(descriptionId);
    var readMoreLink = document.getElementById(linkId);

    if (fullDescription.style.display === "none" || fullDescription.style.display === "") {
        fullDescription.style.display = "block";
        readMoreLink.innerHTML = "Read Less<i class='bi bi-chevron-right'></i>";
    } else {
        fullDescription.style.display = "none";
        readMoreLink.innerHTML = "Read More<i class='bi bi-chevron-right'></i>";
    }
}

// Hàm cụ thể cho từng dịch vụ
function toggleDescription() {
    toggleElement("full-description", "read-more");
}

function toggleFeedingDescription() {
    toggleElement("full-description-feeding", "read-more-feeding");
}

function toggleGroomingDescription() {
    toggleElement("full-description-grooming", "read-more-grooming");
}

function toggleTrainingDescription() {
    toggleElement("full-description-training", "read-more-training");
}

function toggleExerciseDescription() {
    toggleElement("full-description-exercise", "read-more-exercise");
}

function toggleTreatmentDescription() {
    toggleElement("full-description-treatment", "read-more-treatment");
}



// Biến toàn cục để lưu trữ chỉ số sản phẩm hiện tại
let currentProductIndex = 0;
let filteredProducts = []; // Mảng để lưu các sản phẩm đã lọc

// Hàm lọc sản phẩm
function filterProducts(category) {
    const carouselItems = document.querySelectorAll('.carousel-item');

    // Reset mảng sản phẩm đã lọc
    filteredProducts = [];

    // Duyệt qua tất cả các carousel-item
    carouselItems.forEach(item => {
        const products = item.querySelectorAll('.product-item');
        let hasVisibleProducts = false; // Biến kiểm tra xem có sản phẩm nào hiển thị không

        products.forEach(product => {
            // Kiểm tra sản phẩm có thuộc danh mục đã chọn không
            const isSelected = category === 'all' || product.classList.contains(category);
            product.style.display = isSelected ? 'block' : 'none';

            if (isSelected) {
                hasVisibleProducts = true; // Có sản phẩm phù hợp
                filteredProducts.push(product); // Thêm sản phẩm vào mảng đã lọc
            }
        });

        // Hiển thị hoặc ẩn carousel-item nếu có sản phẩm nào hiển thị
        item.style.display = hasVisibleProducts ? 'block' : 'none';
    });

    // Kiểm tra nếu không còn sản phẩm nào sau khi lọc
    if (filteredProducts.length === 0) {
        currentProductIndex = 0;
        updateControlButtons(); // Cập nhật trạng thái nút điều khiển khi không có sản phẩm
        return;
    }

    // Đặt chỉ số hiện tại về sản phẩm đầu tiên
    currentProductIndex = 0;
    setActiveProduct(filteredProducts[currentProductIndex]);

    updateControlButtons(); // Cập nhật trạng thái nút điều khiển
}

// Hàm thiết lập sản phẩm 'active'
function setActiveProduct(product) {
    const carouselItems = document.querySelectorAll('.carousel-item');

    // Xóa trạng thái active khỏi tất cả các item và ẩn chúng
    carouselItems.forEach(item => {
        item.classList.remove('active');
        item.style.display = 'none'; // Ẩn tất cả các item không phù hợp
    });

    // Tìm item chứa sản phẩm đã chọn
    const activeItem = product.closest('.carousel-item');
    if (activeItem) {
        activeItem.style.display = 'block'; // Hiển thị item chứa sản phẩm đã chọn
        activeItem.classList.add('active'); // Thiết lập item đó là active
    }

    // Kích hoạt carousel đến item chứa sản phẩm đã chọn
    const carousel = document.getElementById('productCarousel');
    const bsCarousel = bootstrap.Carousel.getInstance(carousel);
    if (bsCarousel) {
        bsCarousel.to([...carouselItems].indexOf(activeItem));
    }
}

// Hàm cập nhật trạng thái các nút điều khiển
function updateControlButtons() {
    const prevButton = document.querySelector('.carousel-control-prev');
    const nextButton = document.querySelector('.carousel-control-next');

    // Kiểm tra nếu còn các sản phẩm đã lọc
    if (filteredProducts.length > 0) {
        prevButton.disabled = (currentProductIndex === 0);
        nextButton.disabled = (currentProductIndex === filteredProducts.length - 1);
    } else {
        prevButton.disabled = true;
        nextButton.disabled = true;
    }
}

// Hàm chuyển đến sản phẩm tiếp theo
function nextProduct() {
    if (filteredProducts.length === 0) return;

    currentProductIndex = (currentProductIndex + 1) % filteredProducts.length;
    setActiveProduct(filteredProducts[currentProductIndex]);
    updateControlButtons();
}

// Hàm quay lại sản phẩm trước đó
function previousProduct() {
    if (filteredProducts.length === 0) return;

    currentProductIndex = (currentProductIndex - 1 + filteredProducts.length) % filteredProducts.length;
    setActiveProduct(filteredProducts[currentProductIndex]);
    updateControlButtons();
} 



    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Product carousel
    $(".product-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 45,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });


    // Team carousel
    $(".team-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 45,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: false,
        loop: true,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
    });
    
(jQuery);

