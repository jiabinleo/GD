$("#downloadApp").qrcode({
  text: "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
});
$("#PublicNumber").qrcode({
  text: "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
});

var swiperIdHTML = "";
for (let i = 0; i < 10; i++) {
  swiperIdHTML += `<div class="swiper-slide"><img src="img/CLEAR_DAY.png" alt=""></div>`;
}
$("#swiperId").html(swiperIdHTML);
window.onload = function() {
  var mySwiper = new Swiper(".swiper-container", {
    loop: true,
    pagination: {
      el: ".swiper-pagination"
    },
    // 如果需要前进后退按钮
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev"
    }
  });
};
