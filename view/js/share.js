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
  },
  queryData: function() {
    $.ajax({
      url: header + "/dfbinterface/mobile/handle/GetSingleHandle", //后台接口地址
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
      imgHTML += ` <li imgSrc="${imgUrl[i]}">
        <img src="${imgUrl[i]}" alt="">
    </li>`;
    }

    videoHTML = "";
    for (let i = 0; i < videoUrl.length; i++) {
      videoHTML += ` <li imgSrc="${videoUrl[i]}">
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
