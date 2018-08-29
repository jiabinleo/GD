var imgUrlArr = [
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535455267411&di=11c0c9ade3824fe58be97aa2def6ed3d&imgtype=0&src=http%3A%2F%2Fc.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2F8694a4c27d1ed21b3c778fdda06eddc451da3f4f.jpg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535455337129&di=81982ecc52cda17cc1b16e8ad1e4da02&imgtype=0&src=http%3A%2F%2Fe.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2F8c1001e93901213f5480ffe659e736d12f2e955d.jpg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535455361598&di=e552cd3e9ac2e69724e55fb9fdcd9ba6&imgtype=0&src=http%3A%2F%2Fd.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2F2fdda3cc7cd98d104a601b0a2c3fb80e7bec9050.jpg",
  "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535455267411&di=11c0c9ade3824fe58be97aa2def6ed3d&imgtype=0&src=http%3A%2F%2Fc.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2F8694a4c27d1ed21b3c778fdda06eddc451da3f4f.jpg"
];
var videoUrlArr = [
  "http://192.168.1.240:8080/site/dfbinterface/20180801/b856cb4128a84254a05eebfe5ae103d5.mp4",
  "http://192.168.1.240:8080/site/dfbinterface/20180801/b856cb4128a84254a05eebfe5ae103d5.mp4",
  "http://192.168.1.240:8080/site/dfbinterface/20180801/b856cb4128a84254a05eebfe5ae103d5.mp4",
  "http://192.168.1.240:8080/site/dfbinterface/20180801/b856cb4128a84254a05eebfe5ae103d5.mp4"
];
var indexNum = 0; //当前图片或视频的下标
var share = {
  init: function() {
    share.queryData();
    share.listen();
    share.erCode();
    $("#copytxt").html(window.location.href);
  },
  listen: function() {
    $(document).on("click", ".mask-wrap", function() {
      $(".mask-wrap").hide();
      $("#qrcode").hide();
    });
    $(document).on("click", "#shareBtn", function() {
      $(".mask-wrap").show();
      $("#qrcode").show();
    });
    $(document).on("click", "#qrcode", function() {
      return false;
    });
    $(document).on("click", "#copy", function() {
      var Url2 = document.getElementById("copytxt").innerText;
      var oInput = document.createElement("input");
      oInput.value = Url2;
      document.body.appendChild(oInput);
      oInput.select(); // 选择对象
      document.execCommand("Copy"); // 执行浏览器复制命令
      oInput.className = "oInput";
      oInput.style.display = "none";
      $("#mask_copy").show();
      $("#maskInnerCopy").animate({ opacity: 1, top: "50%" }, 500);
    });

    $(document).on("click", ".close6", function() {
      $(".mask-wrap").hide();
      $(".qrcode").hide();
    });

    $(document).on("click", "#maskCopyYes", function() {
      $("#maskInnerCopy").animate(
        { opacity: 0, top: 0, transform: "translateZ(300deg)" },
        500,
        function() {
          $("#mask_copy").hide();
          setTimeout(function() {
            $(".mask-wrap").hide();
            $("#qrcode").hide();
          }, 3000);
        }
      );
    });
    //视频播放/暂停
    $(document).on("click", "#vid", function() {
      if ($(this).hasClass("pause")) {
        $(this).trigger("play");
        $(this).removeClass("pause");
        $(this).addClass("play");
      } else {
        $(this).trigger("pause");
        $(this).removeClass("play");
        $(this).addClass("pause");
      }
      return false;
    });
    //预览图片
    $(document).on("click", ".minIV", function() {
      indexNum = $(this).index();
      if ($(this).attr("filetype") == "1") {
        $(".mask-IV > video").hide();
        $(".mask-IV > img").attr("src", imgUrlArr[$(this).index()]);
        $(".mask-IV > img").show();
      } else if ($(this).attr("filetype") == "2") {
        $(".mask-IV > img").hide();
        $(".mask-IV > video").attr("src", videoUrlArr[$(this).index()]);
        $(".mask-IV > video").show();
      }
      $("#prev").attr("filetype", $(this).attr("filetype"));
      $("#next").attr("filetype", $(this).attr("filetype"));
      $(".mask-IV").show();
      $(".mask-wrap").show();
    });
    $(document).on("click", ".mask-IV", function() {
      return false;
    });
    //预览左右切换
    $(document).on("click", ".arr", function() {
      var IVUrlArrNow = [], //当前数组
        $maskNow; //当前元素
      if ($(this).attr("filetype") == "1") {
        IVUrlArrNow = imgUrlArr;
        $maskNow = $(".mask-IV > img");
      } else if ($(this).attr("filetype") == "2") {
        IVUrlArrNow = videoUrlArr;
        $maskNow = $(".mask-IV > video");
      }
      if ($(this).attr("id") === "prev") {
        if (indexNum > 0) {
          indexNum--;
        }
      } else if ($(this).attr("id") === "next") {
        if (indexNum < IVUrlArrNow.length - 1) {
          indexNum++;
        }
      }
      $maskNow.attr("src", IVUrlArrNow[indexNum]);
    });
  },
  queryData: function() {
    $.ajax({
      url: fileUrl.header + "/dfbinterface/mobile/handle/GetSingleHandle", //后台接口地址
      type: "POST",
      dataType: "json",
      data: { disasterid: getRequest().uuid },
      success: function(data) {
        console.log(data);
        if (data.success == "0") {
          share.htmlL(data.result);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  },
  htmlL: function(data) {
    console.log(data);
    var handle = data.handle;
    var attachList = data.attachList;
    console.log(attachList);
    var imgUrl = [];
    console.log(imgUrl);
    var videoUrl = [];
    for (let i = 0; i < attachList.length; i++) {
      console.log(attachList[i].url_path);
      if (attachList[i].filetype === "1") {
        imgUrl.push(attachList[i].url_path);
      } else if (attachList[i].filetype === "2") {
        videoUrl[i].push(attachList[i].url_path);
      }
    }
    imgHTML = "";
    for (let i = 0; i < imgUrl.length; i++) {
      imgHTML += ` <li fileTYpe = "1" class="minIV" urlSrc="${imgUrl[i]}">
        <img src="${imgUrl[i]}" alt="">
    </li>`;
    }

    videoHTML = "";
    for (let i = 0; i < videoUrl.length; i++) {
      videoHTML += ` <li fileTYpe = "2" class="minIV" urlSrc="${videoUrl[i]}">
        <img src="${videoUrl[i]}" alt="">
    </li>`;
    }

    var headerHTML = `
            <span></span>
            <h2>${handle.disastername}</h2>
            <p id="ids">编号（${handle.id}）</p>`;
    $("#headerHTML").html(headerHTML);

    var sectionHTML = `<div class="address">
    <div class="address1">
        <p>
            <span>地址：</span>
            <span id="address">${handle.addressname}</span>
        </p>
        <p>
            <span>隶属：</span>
            <span id="liShu">南山区西丽街道办</span>
        </p>
    </div>
    <p>
        <span>上报时间：</span>
        <span id="time">${config.formatDate(handle.createtime)}</span>
    </p>
    <p>
        <span>灾情描述：</span>
        <span>西南门的路中间发生一处长1.2米，宽1.1米，深30公分的地坑，暂无人员伤亡。</span>
    </p>
</div>
<div class="details">
    <p>
        <span>坍塌规模：</span>
        <span>${handle.collapsescale}</span>
    </p>
    <p>
        <span>坍塌危害：</span>
        <span>财务损失100万元，人员伤亡5人，死亡0人。</span>
    </p>
    <p>
        <span>灾情等级：</span>
        <span>一般（<a class="lve">Ⅳ级</a>）</span>
    </p>
</div>
<div class="reason">
    <p>
        <span>引发因素：</span>
        <span>排水管道</span>
    </p>
    <p>
        <span>坍塌原因：</span>
        <span>排水管道破损导致，由街道办组织施工队抢修排水管道。</span>
    </p>
    <p>
        <span>应急处理：</span>
        <span>警戒围挡</span>
    </p>
</div>
<div class="photo" id="photoImg">
    <p>现场图片：</p>
    <ul>
        ${imgHTML}
    </ul>
</div>
<div class="photo">
    <p>现场视频：</p>
    <ul>
        ${videoHTML}
    </ul>
</div>`;
    // $("#sectionHTML").html(sectionHTML);
  },
  erCode: function() {
    $("#downloadApp").qrcode({
      text:
        "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
    });
    $("#PublicNumber").qrcode({
      text:
        "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
    });
  }
};
share.init();
