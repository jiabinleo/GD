var imgUrlArr = [];
var videoUrlArr = [];
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
      $(".mask-IV").hide();
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
      url: fileUrl.header240 + "/dfbinterface/mobile/handle/GetSingleHandle", //后台接口地址
      type: "POST",
      dataType: "json",
      data: { disasterid: getRequest().disasterid },
      success: function(data) {
        if (data.success == "0") {
          if (data.hasOwnProperty("result")) {
            share.htmlL(data.result);
          }
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  },
  htmlL: function(data) {
    handle = data.handle;
    attachList = data.attachList;
    imgUrlArr = [];
    videoUrlArr = [];
    for (let i = 0; i < attachList.length; i++) {
      if (attachList[i].filetype === "1") {
        imgUrlArr.push(attachList[i].url_path);
      } else if (attachList[i].filetype === "2") {
        videoUrlArr.push(attachList[i].url_path);
      }
    }
    imgHTML = "";
    for (let i = 0; i < imgUrlArr.length; i++) {
      imgHTML += ` <li fileTYpe = "1" class="minIV" urlSrc="${imgUrlArr[i]}">
        <img src="${imgUrlArr[i]}" alt="">
    </li>`;
    }

    videoHTML = "";
    for (let i = 0; i < videoUrlArr.length; i++) {
      videoHTML += ` <li fileTYpe = "2" class="minIV" urlSrc="${
        videoUrlArr[i]
      }">
        <video  src="${videoUrlArr[i]}"  width="100%" src="" >暂无视频</video>
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
    $("#sectionHTML").html(sectionHTML);
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
