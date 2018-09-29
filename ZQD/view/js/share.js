// var imgUrlArr = [];
// var videoUrlArr = [];
var indexImgVideo = 0; //当前图片或视频的下标
var imgVideoArr = []; //图片视频集合
var share = {
  init: function () {
    share.queryData();
    share.listen();
    share.erCode();
    $("#copytxt").html(window.location.href);
  },
  listen: function () {
    $(document).on("click", ".mask-wrap", function () {
      $(".mask-wrap").hide();
      $(".mask-IV").hide();
      $("#qrcode").hide();
    });
    $(document).on("click", "#shareBtn", function () {
      $(".mask-wrap").show();
      $("#qrcode").show();
    });
    $(document).on("click", "#qrcode", function () {
      return false;
    });
    $(document).on("click", ".mask-IV", function () {
      return false;
    })
    $(document).on("click", "#copy", function () {
      var Url2 = document.getElementById("copytxt").innerText;
      var oInput = document.createElement("input");
      oInput.value = Url2;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.className = "oInput";
      oInput.style.display = "none";
      $("#mask_copy").show();
      $("#maskInnerCopy").animate({
        opacity: 1,
        top: "50%"
      }, 500);
    });

    $(document).on("click", ".close6", function () {
      $("#mask_wrap").hide();
      $(".qrcode").hide();
    });
    $(document).on("click", "#closeIV", function () {
      $("#mask_IV").hide();
      $("#mask_wrap").hide();
    });
    $(document).on("click", "#maskCopyYes", function () {
      $("#maskInnerCopy").animate({
          opacity: 0,
          top: 0,
          transform: "translateZ(300deg)"
        },
        500,
        function () {
          $("#mask_copy").hide();
        }
      );
    });
    var marginLeft = 0;
    $(document).on("click", ".imgVideo-content > .arr", function () {
      if ($(this).attr("next") === "0") {
        if (marginLeft < 0) {
          marginLeft += 140;
        }
      } else if ($(this).attr("next") === "1") {
        if ($(window).width() > 1300) {
          if (marginLeft > (imgVideoArr.length - 7) * -140) {
            marginLeft -= 140;
          }
        }
        if ($(window).width() >= 750 && $(window).width() <= 1300) {
          if (marginLeft > (imgVideoArr.length - 4) * -140) {
            marginLeft -= 140;
          }
        }
        if ($(window).width() < 750) {
          if (marginLeft > (imgVideoArr.length - 2) * -140) {
            marginLeft -= 140;
          }
        }
      }
      console.log(marginLeft)
      $("#center > ul").css("marginLeft", marginLeft);
    });

    $(document).on("click", "#center > ul > li", function () {
      indexImgVideo = $(this).attr("num");
      if (imgVideoArr[$(this).attr("num")].filetype === "1") {
        var mask_imgVideo_HTML = `<div id="leftArr" class="leftArr arr" next = "0">
            <img src="../../img/prev.png" alt="">
        </div>
        <div class="rightArr arr" next = 1>
            <img src="../../img/next.png" alt="">
        </div>
        <div class="mask_center" id="mask_center">
            <img src="${imgVideoArr[$(this).attr("num")].url_path}" />
        </div>`;
      } else if (imgVideoArr[$(this).attr("num")].filetype === "2") {
        var mask_imgVideo_HTML = `<div id="leftArr" class="leftArr arr" next = 0>
            <img src="../../img/prev.png" alt="">
              </div>
              <div class="rightArr arr" next = 1>
                      <img src="../../img/next.png" alt="">
                  </div>
              <div id="mask_center" class="mask_center" >
              <video controls="controls" muted pause="" width="100%" src="${
                imgVideoArr[$(this).attr("num")].url_path
              }" class="pause">暂无视频</video>
        </div>`;
      }
      console.log(mask_imgVideo_HTML)
      $("#mask_imgVideo").html(mask_imgVideo_HTML);
      $(".mask-IV").show();
      $(".mask-wrap").show();
    });

    $(document).on("click", "#mask_imgVideo > .arr", function () {
      if ($(this).attr("next") === "0") {
        if (indexImgVideo > 0) {
          indexImgVideo--;
        }
      } else if (indexImgVideo < imgVideoArr.length - 1) {
        indexImgVideo++;
      } else {
        return;
      }
      var centerHTML = ""
      if (imgVideoArr[indexImgVideo].filetype === "1") {
        centerHTML = `<img src="${
          imgVideoArr[indexImgVideo].url_path
        }" />`;
      } else if (imgVideoArr[indexImgVideo].filetype === "2") {
        centerHTML = `<video controls="controls" muted pause="" width="100%" src="${
          imgVideoArr[indexImgVideo].url_path
        }" class="pause">暂无视频</video>`;
      }
      $("#mask_center").html(centerHTML);
    });
    //视频播放/暂停
    // $(document).on("click", "#vid", function () {
    //   if ($(this).hasClass("pause")) {
    //     $(this).trigger("play");
    //     $(this).removeClass("pause");
    //     $(this).addClass("play");
    //   } else {
    //     $(this).trigger("pause");
    //     $(this).removeClass("play");
    //     $(this).addClass("pause");
    //   }
    //   return false;
    // });
    //预览图片
    // $(document).on("click", ".minIV", function () {
    //   indexNum = $(this).index();
    //   if ($(this).attr("filetype") == "1") {
    //     $(".mask-IV > video").hide();
    //     $(".mask-IV > img").attr("src", imgUrlArr[$(this).index()]);
    //     $(".mask-IV > img").show();
    //   } else if ($(this).attr("filetype") == "2") {
    //     $(".mask-IV > img").hide();
    //     $(".mask-IV > video").attr("src", videoUrlArr[$(this).index()]);
    //     $(".mask-IV > video").show();
    //   }
    //   $("#prev").attr("filetype", $(this).attr("filetype"));
    //   $("#next").attr("filetype", $(this).attr("filetype"));
    //   $(".mask-IV").show();
    //   $(".mask-wrap").show();
    // });
    // $(document).on("click", ".mask-IV", function () {
    //   return false;
    // });
    //预览左右切换
    // $(document).on("click", ".arr", function () {
    //   var IVUrlArrNow = [], //当前数组
    //     $maskNow; //当前元素
    //   if ($(this).attr("filetype") == "1") {
    //     IVUrlArrNow = imgUrlArr;
    //     $maskNow = $(".mask-IV > img");
    //   } else if ($(this).attr("filetype") == "2") {
    //     IVUrlArrNow = videoUrlArr;
    //     $maskNow = $(".mask-IV > video");
    //   }
    //   if ($(this).attr("id") === "prev") {
    //     if (indexNum > 0) {
    //       indexNum--;
    //     }
    //   } else if ($(this).attr("id") === "next") {
    //     if (indexNum < IVUrlArrNow.length - 1) {
    //       indexNum++;
    //     }
    //   }
    //   $maskNow.attr("src", IVUrlArrNow[indexNum]);
    // });
  },
  queryData: function () {
    $.ajax({
      url: fileUrl.header88 + "/dfbinterface/mobile/handle/GetSingleHandle", //后台接口地址
      type: "GET",
      dataType: "jsonp",
      callback: "result",
      data: {
        disasterid: getRequest().disasterid
      },
      success: function (data) {
        if (data.success == "0") {
          if (data.hasOwnProperty("result")) {
            share.htmlL(data.result);
          }
        } else {
          $("#sectionHTML").html(
            `<span style="color:#666666";>暂无数据</span>`
          );
          $("#ids").html("编号（无）");
        }
      },
      error: function (err) {
        console.log(err);
      }
    });
  },
  htmlL: function (data) {
    handle = data.handle;
    attachList = data.attachList;
    var imgUrlArr = [];
    var videoUrlArr = [];
    for (let i = 0; i < attachList.length; i++) {
      if (attachList[i].filetype === "1") {
        imgUrlArr.push({
          url_path: attachList[i].url_path,
          filetype: "1"
        });
      } else if (attachList[i].filetype === "2") {
        videoUrlArr.push({
          url_path: attachList[i].url_path,
          filetype: "2"
        });
      }
    }
    imgVideoArr = imgUrlArr.concat(videoUrlArr)
    imgVideoHTML = ""
    for (let i = 0; i < imgVideoArr.length; i++) {
      if (imgVideoArr[i].filetype === "1") {
        imgVideoHTML += `<li num="${i}" fileType="1"><img onerror=src="../../img/loading.gif" alt="暂无图片" src = ${
          imgVideoArr[i].url_path
        } /></li>`;
      } else if (imgVideoArr[i].filetype === "2") {
        imgVideoHTML += `<li num="${i}" fileType="2"><video src = ${
          imgVideoArr[i].url_path
        } onerror=src="../../img/loading.gif"></video></li>`;
      }
    }
    // imgHTML = "";
    // for (let i = 0; i < imgUrlArr.length; i++) {
    //   imgHTML += ` <li fileTYpe = "1" class="minIV" urlSrc="${imgUrlArr[i]}">
    //     <img src="${imgUrlArr[i]}" alt="">
    // </li>`;
    // }

    // videoHTML = "";
    // for (let i = 0; i < videoUrlArr.length; i++) {
    //   videoHTML += ` <li fileTYpe = "2" class="minIV" urlSrc="${
    //     videoUrlArr[i]
    //   }">
    //     <video src="${videoUrlArr[i]}"  width="100%" src="" >暂无视频</video>
    // </li>`;
    // }
    function isTrue(value) {
      return value ? value : "";
    }
    var headerHTML = `
            <span></span>
            <h2>${isTrue(handle.disastername)}</h2>
            <p id="ids">编号（${isTrue(handle.id)}）</p>`;
    $("#headerHTML").html(headerHTML);
    // warnlevel
    var warnlevel = "";
    switch (isTrue(handle.warnlevel)) {
      case "1":
        warnlevel = "Ⅰ级";
        break;
      case "2":
        warnlevel = "Ⅱ级";
        break;
      case "3":
        warnlevel = "Ⅲ级";
        break;
      case "4":
        warnlevel = "Ⅳ级";
        break;
      default:
        warnlevel = "";
        break;
    }
    var sectionHTML = `<div class="address">
    <div class="address1">
        <p>
            <span>地址：</span>
            <span id="address">${isTrue(handle.addressname)}</span>
        </p>
        <p>
            <span>隶属：</span>
            <span id="liShu">${isTrue(handle.department)}</span>
        </p>
    </div>
    <p>
        <span>上报时间：</span>
        <span id="time">${isTrue(handle.createtime)}</span>
    </p>
    <p>
        <span>灾情描述：</span>
        <span>${isTrue(handle.process)}</span>
    </p>
</div>
<div class="details">
    <p>
        <span>坍塌规模：</span>
        <span>${isTrue(handle.collapsescale)}</span>
    </p>
    <p>
        <span>坍塌危害：</span>
        <span>${isTrue(handle.department)}</span>
    </p>
    <p>
        <span>灾情等级：</span>
        <span><a class="lve">${warnlevel}</a></span>
    </p>
</div>
<div class="reason">
    <p>
        <span>引发因素：</span>
        <span>${isTrue(handle.reason)}</span>
    </p>
    <p>
        <span>坍塌原因：</span>
        <span>${isTrue(handle.department)}</span>
    </p>
    <p>
        <span>应急处理：</span>
        <span>${isTrue(handle.department)}</span>
    </p>
</div>
<div class="imgVideo">
  <p>现场图片、视频：</p>
    <div class="imgVideo-content">
      <div class="leftArr arr" next="0">

      </div>
      <div class="rightArr arr" next="1">
    
      </div>
      <div id="center" class="center">
        <ul id="centerHTML" class="centerHTML">
        ${imgVideoHTML}
        </ul>
      </div>
    </div>
</div>`;
    $("#sectionHTML").html(sectionHTML);
    $("#center > ul").css({
      width: imgVideoArr.length * 140,
      "min-width": "438px"
    });

    if ($(window).width() > 1300) {
      if (imgVideoArr.length <= 7) {
        $(".leftArr").hide();
      }
    }
    if ($(window).width() < 750) {
      if (imgVideoArr.length <= 2) {
        $(".leftArr").hide();
      }
    }
    console.log($(window).width())
    if (imgVideoArr.length == 0) {
      $("#center")
        .html("暂无图片或视频")
        .css({
          "line-height": "50px",
          "font-size": "14px",
          color: "#666666"
        });
    }
  },
  erCode: function () {
    $("#downloadApp").qrcode({
      text: "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
    });
    $("#PublicNumber").qrcode({
      text: "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
    });
  }
};
share.init();