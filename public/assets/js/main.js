/* ===================================================================
   Prime Rides - 3D Interactive Luxury JavaScript
   Tilt Effects, Smooth Animations, High-Conversion Calculator
   =================================================================== */

(function ($) {
  'use strict';

  // 1. Preloader (Instant removal)
  $('#preloader, .preloader-bg').remove();

  // 2. Navbar Scroll
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 60) {
      $('.navbar').addClass('nav-scroll');
    } else {
      $('.navbar').removeClass('nav-scroll');
    }
  });

  // 3. Hero Slider
  if ($('.header .owl-carousel').length) {
    $('.header .owl-carousel').owlCarousel({
      items: 1,
      loop: true,
      margin: 0,
      autoplay: true,
      autoplayTimeout: 6500,
      smartSpeed: 1000,
      dots: true,
      nav: false,
      animateOut: 'fadeOut',
      animateIn: 'fadeIn'
    });
  }

  // 4. Testimonials Carousel
  if ($('.testimonials-carousel').length) {
    $('.testimonials-carousel').owlCarousel({
      loop: true,
      margin: 30,
      autoplay: true,
      autoplayTimeout: 5500,
      smartSpeed: 800,
      dots: true,
      nav: false,
      responsive: { 0: { items: 1 }, 768: { items: 2 }, 1200: { items: 3 } }
    });
  }

  // 5. Clients Logo Carousel
  if ($('.clients-carousel').length) {
    $('.clients-carousel').owlCarousel({
      loop: true,
      margin: 40,
      autoplay: true,
      autoplayTimeout: 2500,
      smartSpeed: 600,
      dots: false,
      nav: false,
      responsive: { 0: { items: 2 }, 576: { items: 3 }, 768: { items: 4 }, 1200: { items: 6 } }
    });
  }

  // 6. Video Popup
  if ($('.vid').length) {
    $('.vid').magnificPopup({
      type: 'iframe',
      mainClass: 'mfp-fade',
      removalDelay: 160,
      preloader: false,
      fixedContentPos: false
    });
  }

  // 7. Cars Category Filter (Default: All Categories Visible)
  function initCategoryFilter() {
    // Explicitly ensure all cards are displayed on page load
    $('.category-card-item, .fleet-grid-item').show();
    $('.category-filter-btn[data-filter="all"], .fleet-filter-btn[data-filter="all"]').addClass('active');

    $(document).on('click', '.category-filter-btn, .fleet-filter-bar .fleet-filter-btn', function (e) {
      e.preventDefault();
      $('.category-filter-btn, .fleet-filter-bar .fleet-filter-btn').removeClass('active');
      $(this).addClass('active');
      var filter = $(this).attr('data-filter') || 'all';
      var items = $('.category-card-item, .fleet-grid-item');
      if (filter === 'all') {
        items.stop(true, true).fadeIn(300);
      } else {
        items.each(function () {
          if ($(this).hasClass(filter)) {
            $(this).stop(true, true).fadeIn(300);
          } else {
            $(this).stop(true, true).fadeOut(200);
          }
        });
      }
    });
  }
  initCategoryFilter();

  // (Mouse tilt effects removed per design hierarchy specification)

  // 9. Scroll Reveal Animations
  var revealElements = document.querySelectorAll('.car-card-lux, .review-card-lux, .cat-tile, .glass-card, .booking-search-card-3d, .estimator-card-3d, .journal-card, .trust-item, [data-reveal]');
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i % 4) * 0.1 + 's, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ' + (i % 4) * 0.1 + 's';
    revealObserver.observe(el);
  });

  // 10. Interactive 3D Range Slider with Live Fill
  var rangeSlider = document.getElementById('calcDaysRange');
  if (rangeSlider) {
    function updateSliderFill() {
      var min = parseInt(rangeSlider.min) || 1;
      var max = parseInt(rangeSlider.max) || 30;
      var val = parseInt(rangeSlider.value) || 3;
      var percent = ((val - min) / (max - min)) * 100;
      rangeSlider.style.setProperty('--slider-fill', percent + '%');
    }
    rangeSlider.addEventListener('input', updateSliderFill);
    updateSliderFill();
  }

  // 11. Interactive Insurance Card Toggle
  document.querySelectorAll('.insurance-card-3d').forEach(function (card) {
    card.addEventListener('click', function () {
      document.querySelectorAll('.insurance-card-3d').forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      var radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      updateRentalCalculation();
    });
  });

  // 12. Live Rental Calculator
  function updateRentalCalculation() {
    var carSelect = document.getElementById('calcCarSelect');
    if (!carSelect) return;
    var selectedOption = carSelect.options[carSelect.selectedIndex];
    var dailyRate = parseInt(selectedOption.getAttribute('data-price') || 2999);
    var carName = selectedOption.textContent || 'Hyundai Creta';
    var days = parseInt(document.getElementById('calcDaysRange').value || 3);
    var insuranceType = document.querySelector('input[name="calcInsurance"]:checked');
    var isVip = insuranceType ? insuranceType.value === 'vip' : false;
    var insuranceCost = isVip ? 499 * days : 0;

    var discountPercent = 0;
    if (days >= 14) discountPercent = 20;
    else if (days >= 7) discountPercent = 10;

    var rawTotal = dailyRate * days;
    var discountAmount = (rawTotal * discountPercent) / 100;
    var finalTotal = rawTotal - discountAmount + insuranceCost;

    document.getElementById('calcDaysDisplay').textContent = days + (days === 1 ? ' Day' : ' Days');
    document.getElementById('calcDailyRateDisplay').textContent = '₹' + dailyRate.toLocaleString('en-IN') + ' / day';
    document.getElementById('calcSubtotalDisplay').textContent = '₹' + rawTotal.toLocaleString('en-IN');
    document.getElementById('calcDiscountDisplay').textContent = discountPercent > 0 ? '- ₹' + discountAmount.toLocaleString('en-IN') + ' (' + discountPercent + '% Off)' : '₹0';
    document.getElementById('calcInsuranceDisplay').textContent = '₹' + insuranceCost.toLocaleString('en-IN');

    // Animate total
    var totalEl = document.getElementById('calcTotalDisplay');
    totalEl.textContent = '₹' + finalTotal.toLocaleString('en-IN');
    totalEl.style.transform = 'scale(1.15)';
    setTimeout(function () { totalEl.style.transform = 'scale(1)'; totalEl.style.transition = 'transform 0.3s ease'; }, 200);

    // Discount badge
    var discountBadge = document.getElementById('calcDiscountBadge');
    if (discountBadge) {
      discountBadge.textContent = discountPercent > 0 ? discountPercent + '% OFF' : '';
      discountBadge.style.display = discountPercent > 0 ? 'inline-block' : 'none';
    }

    // WhatsApp link
    var waMsg = encodeURIComponent('Hello Primerides! I would like to reserve the ' + carName.split('(')[0].trim() + ' for ' + days + ' days from Delhi NCR. Estimated Quote: ₹' + finalTotal.toLocaleString('en-IN') + '. Please confirm availability!');
    var waBtn = document.getElementById('calcWhatsAppBtn');
    if (waBtn) waBtn.href = 'https://api.whatsapp.com/send?phone=919045301702&text=' + waMsg;
  }

  var calcCarSelect = document.getElementById('calcCarSelect');
  var calcDaysRange = document.getElementById('calcDaysRange');
  if (calcCarSelect) calcCarSelect.addEventListener('change', updateRentalCalculation);
  if (calcDaysRange) calcDaysRange.addEventListener('input', function () { updateRentalCalculation(); });
  document.querySelectorAll('input[name="calcInsurance"]').forEach(function (r) {
    r.addEventListener('change', updateRentalCalculation);
  });
  updateRentalCalculation();

  // 13. Instant Booking Modal
  window.openBookingModal = function (carName, carPrice, carImg) {
    document.getElementById('modalCarName').textContent = carName;
    document.getElementById('modalCarPrice').textContent = '₹' + Number(carPrice).toLocaleString('en-IN') + ' / day';
    document.getElementById('modalCarImg').src = carImg;
    document.getElementById('modalVehicleInput').value = carName;
    var bookingModal = new bootstrap.Modal(document.getElementById('instantBookingModal'));
    bookingModal.show();
  };

  // 14. Performance Spotlight Switcher
  var carSpecsData = {
    'fortuner': { name: 'Toyota Fortuner 4x4', engine: '2.8L Turbocharged Diesel', hp: '201 BHP', hpPercent: 86, speed: '190 km/h', speedPercent: 75, accel: '9.8s', accelPercent: 68, torque: '500 Nm', torquePercent: 88, price: '₹5,999/day', img: 'assets/img/cars/1.jpg' },
    'thar': { name: 'Mahindra Thar 4x4', engine: '2.2L mHawk CRDe Diesel', hp: '130 BHP', hpPercent: 68, speed: '155 km/h', speedPercent: 60, accel: '10.2s', accelPercent: 62, torque: '300 Nm', torquePercent: 70, price: '₹3,499/day', img: 'assets/img/cars/3.jpg' },
    'crysta': { name: 'Toyota Innova Crysta', engine: '2.4L GD Turbo Diesel', hp: '148 BHP', hpPercent: 72, speed: '175 km/h', speedPercent: 68, accel: '11.5s', accelPercent: 55, torque: '343 Nm', torquePercent: 75, price: '₹4,200/day', img: 'assets/img/cars/7.jpg' },
    'creta': { name: 'Hyundai Creta SX(O)', engine: '1.5L CRDi VGT Diesel', hp: '114 BHP', hpPercent: 62, speed: '180 km/h', speedPercent: 70, accel: '10.5s', accelPercent: 60, torque: '250 Nm', torquePercent: 65, price: '₹2,999/day', img: 'assets/img/cars/2.jpg' }
  };

  document.querySelectorAll('.spotlight-nav-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.spotlight-nav-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var data = carSpecsData[btn.getAttribute('data-car')];
      if (!data) return;
      
      var imgEl = document.getElementById('spotlightImg');
      imgEl.style.opacity = '0';
      imgEl.style.transform = 'scale(0.95)';
      
      setTimeout(function () {
        document.getElementById('spotlightTitle').textContent = data.name;
        document.getElementById('spotlightEngine').textContent = data.engine;
        document.getElementById('spotlightHp').textContent = data.hp;
        document.getElementById('spotlightHpBar').style.width = data.hpPercent + '%';
        document.getElementById('spotlightSpeed').textContent = data.speed;
        document.getElementById('spotlightSpeedBar').style.width = data.speedPercent + '%';
        document.getElementById('spotlightAccel').textContent = data.accel;
        document.getElementById('spotlightAccelBar').style.width = data.accelPercent + '%';
        document.getElementById('spotlightTorque').textContent = data.torque;
        document.getElementById('spotlightTorqueBar').style.width = data.torquePercent + '%';
        document.getElementById('spotlightPrice').textContent = data.price;
        imgEl.src = data.img;
        imgEl.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
      }, 250);
    });
  });

  // 15. Animated Counter Numbers
  var countersAnimated = false;
  function animateCounters() {
    if (countersAnimated || !document.querySelector('.counter-number')) return;
    var el = document.querySelector('.counter-number');
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      document.querySelectorAll('.counter-number').forEach(function (counter) {
        var target = parseInt(counter.getAttribute('data-count'));
        var duration = 2000;
        var start = 0;
        var startTime = null;
        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else counter.textContent = target;
        }
        requestAnimationFrame(step);
      });
      countersAnimated = true;
    }
  }
  window.addEventListener('scroll', animateCounters);
  animateCounters();

  // 16. Scroll-to-Top Progress
  var progressPath = document.querySelector('.progress-wrap path');
  if (progressPath) {
    var pathLength = progressPath.getTotalLength();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
    progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
    progressPath.style.strokeDashoffset = pathLength;
    progressPath.getBoundingClientRect();
    progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

    function updateProgress() {
      var scroll = window.scrollY;
      var height = document.body.scrollHeight - window.innerHeight;
      var progress = pathLength - (scroll * pathLength / height);
      progressPath.style.strokeDashoffset = progress;
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 150) {
        document.querySelector('.progress-wrap').classList.add('active-progress');
      } else {
        document.querySelector('.progress-wrap').classList.remove('active-progress');
      }
    });

    document.querySelector('.progress-wrap').addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 17. Register / Login Modal Handler
  window.openAuthModal = function (mode) {
    window.switchAuthTab(mode || 'login');
    var el = document.getElementById('authModal');
    if (el) {
      var authModal = new bootstrap.Modal(el);
      authModal.show();
    }
  };

  window.switchAuthTab = function (mode) {
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var tabLoginBtn = document.getElementById('tabLoginBtn');
    var tabRegisterBtn = document.getElementById('tabRegisterBtn');
    var authModalTitle = document.getElementById('authModalTitle');

    if (!loginForm || !registerForm) return;

    if (mode === 'register') {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      if (tabLoginBtn) tabLoginBtn.classList.remove('active');
      if (tabRegisterBtn) tabRegisterBtn.classList.add('active');
      if (authModalTitle) authModalTitle.textContent = 'Create New Account';
    } else {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      if (tabLoginBtn) tabLoginBtn.classList.add('active');
      if (tabRegisterBtn) tabRegisterBtn.classList.remove('active');
      if (authModalTitle) authModalTitle.textContent = 'Welcome to Primerides';
    }
  };

})(jQuery);
