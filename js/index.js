var indexPage = {
  init: function() {
    indexPage.changeMap([new AMap.TileLayer.Satellite()]);
    indexPage.listen();
    indexPage.getGovernance("");
    indexPage.clickColor(numPage);
    common.queryData("", layers);
  },
  listen: function() {
   
    //点击加载卫星图和普通图
    $("#satellite").on("click", function() {
      //卫星图
      if (satellite) {
        layers = "";
      } else {
        layers = [new AMap.TileLayer.Satellite()];
      }
      satellite = !satellite;
      indexPage.changeMap(layers);
      common.queryData("", layers);
    });
    //路径规划
    $(document).on("click", "#goto", function() {
      indexPage.goto("", $(this).attr("data"));
    });
    //点击检索
    $("#retrieval").on("click", function() {
      $("#retrievalBox").load("/view/retrievalBox/retrievalBox.html");
      if ($("#retrievalBox").css("display") == "none") {
        $("#retrievalBox").show();
        $(".retrieval")
          .addClass("retrieval-hide")
          .removeClass("retrieval-show");
      } else {
        $("#retrievalBox").hide();
        $(".retrieval")
          .addClass("retrieval-show")
          .removeClass("retrieval-hide");
      }
    });

    // 显示图表
    $("#chart").on("click", function() {
      if ($("#tableList").css("display") == "none") {
        $("#tableList").load("../view/tableList/tableList.html");
        $("#tableList").show();
      } else {
        $("#tableList").hide();
      }
    });

    //关闭详情
    $(document).on("click", "#close3", function() {
      $("#details").hide();
    });

    //周边详情
    $(document).on("click", ".aroundList", function() {
      indexPage.showPoint(jsonData, layers);
      var lat = $(this)
        .parent()
        .attr("lat");
      var lon = $(this)
        .parent()
        .attr("lon");
      var name = $(this).attr("data");
      indexPage.around(lat, lon, name);
      $(".close4").show();
      $("#panel").show();
    });
    $(document).on("click", ".close4", function() {
      $(".close4").hide();
      $("#panel").hide();
      indexPage.showPoint(jsonData, layers);
    });
    //放大图片
    $(document).on("click", ".imgMin", function() {
      console.log(imgArr);
      imgYes = true;
      nextNum = imgArr.length;
      indexImgVideo = $(this).attr("index");

      $(".mask-img").html(
        `<div class="prev"></div>
      <img id="vid" src="${imgArr[indexImgVideo]}" alt="暂无图片">
      <div class="next"></div>`
      );
      $(".mask-wrap").show();
      $(".mask-img").show();
    });
    $(document).on("click", ".mask-wrap", function() {
      $(".mask-wrap").hide();
      $(".mask-img").hide();
      $(".qrcode").hide();
    });
    $(document).on("click", ".mask-img > img", function() {
      return false;
    });
    //放大视频
    $(document).on("click", ".videoMin", function() {
      imgYes = false;
      nextNum = videoArr.length;
      indexImgVideo = $(this).attr("index");
      $(".mask-img").html(
        `<div class="prev"></div>
        <video id="vid" muted pause="" width="100%" 
        src="${videoArr[indexImgVideo]}" 
        class="pause">暂无视频</video>
        <div class="next"></div>`
      );
      var maskImgHeight = $(".mask-img")[0].clientHeight;
      $(".mask-wrap").show();
      $(".mask-img").show();
    });
    //视频图片切换
    $(document).on("click", ".prev", function() {
      if (indexImgVideo > 0) {
        indexImgVideo--;
        if (imgYes) {
          $("#vid").attr("src", imgArr[indexImgVideo]);
        } else {
          $("#vid").attr("src", videoArr[indexImgVideo]);
        }
      }
      return false;
    });
    $(document).on("click", ".next", function() {
      if (indexImgVideo < nextNum - 1) {
        indexImgVideo++;
        if (imgYes) {
          $("#vid").attr("src", imgArr[indexImgVideo]);
        } else {
          $("#vid").attr("src", videoArr[indexImgVideo]);
        }
      }
      return false;
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
    //巡查
    $(document).on("click", "#inspecting", function() {
      $("#inspectingDetail").show();
    });
    //关闭巡查历史
    $(document).on("click", "#close5", function() {
      $("#inspectingDetail").hide();
    });
    //查询时间筛选
    $(document).on("click", ".detailB", function() {
      historyData.index = $(this).attr("ids");

      indexPage.inspectingHtml(historyData);
    });
    //分享
    $(document).on("click", "#qrButton", function() {
      $(".mask-wrap").show();
      $(".qrcode").show();
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
    // 搜索
    $(document).on("click", "#searchs", function() {
      if (allData) {
        var searchVal = $.trim($("#searchTxt").val());
        var searchResultHtml = "";
        for (let i = 0; i < allData.length; i++) {
          if (allData[i].addressname.indexOf(searchVal) != -1) {
            searchResultHtml += `<li lon=${allData[i].lon} lat=${
              allData[i].lat
            } title="${allData[i].addressname}">${allData[i].addressname}</li>`;
          }
        }
        $("#searchResultHtml").html(searchResultHtml);
        $("#searchResult").show();
      }
    });
    $("#searchTxt").keyup(function() {
      if (allData) {
        var searchVal = $.trim($("#searchTxt").val());
        var searchResultHtml = "";
        for (let i = 0; i < allData.length; i++) {
          if (allData[i].addressname.indexOf(searchVal) != -1) {
            searchResultHtml += `<li lon=${allData[i].lon} lat=${
              allData[i].lat
            } title="${allData[i].addressname}">${allData[i].addressname}</li>`;
          }
        }
        $("#searchResultHtml").html(searchResultHtml);
        $("#searchResult").show();
      }
    });
    $(document).on("click", "#searchResultHtml > li", function() {
      config.setZoomAndCenter($(this).attr("lon"), $(this).attr("lat"));
      return false;
    });
    $(document).on("click", ".search", function() {
      return false;
    });
    $(document).on("click", function() {
      $("#searchResult").hide();
    });
    // 表单跳转
    $(document).on("click", "#tableListHtml > tr", function() {
      console.log($(this).attr("url"));
      window.open($(this).attr("url"));
    });
  },
  changeMap: function(layers) {
    map = new AMap.Map("container", {
      resizeEnable: true,
      zoom: 16,
      layers: layers
    });
  },

  //分页
  paging: function(num) {
    var numpage = "";
    numPageS = Math.ceil(num / 5);
    for (let i = 1; i < Math.ceil(num / 5) + 1; i++) {
      numpage += "<a class='activeColor'>" + i + "</a>";
    }
    $("#arrCenter").html(numpage);
  },
  //状态
  status: function(key) {
    var sta = "";
    switch (key) {
      case "1":
        sta = "已治理";
        break;
      case "2":
        sta = "未治理";
        break;
      case "3":
        sta = "治理中";
        break;
    }
    return sta;
  },
  //查询列表warnlevel
  tableList: function(data, numPage) {
    var tbodyHtml = "";
    var nums = numPage * 5;
    if (data.length < numPage * 5) {
      nums = data.length;
    }
    for (let i = (numPage - 1) * 5; i < nums; i++) {
      tbodyHtml +=
        "<tr lat=" +
        data[i].lat +
        " lon=" +
        data[i].lon +
        " title=" +
        (data[i].addressname ? data[i].addressname : "") +
        "><td>" +
        data[i].id +
        "</td><td>" +
        data[i].addressname +
        "</td><td class=status" +
        data[i].managestate +
        ">" +
        indexPage.status(data[i].managestate) +
        "</td></tr>";
    }
    $("#tbodyHtml").html(tbodyHtml);
  },
  //治理状况统计

  getGovernance: function(data) {
    $.ajax({
      type: "POST",
      url: header + "/dfbinterface/mobile/gisshow/Getypecount",
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        if (data.success == "0") {
          $("#ungovern").html(data.result.suspending);
          $("#hasgovern").html(data.result.solved);
          $("#ingovern").html(data.result.handling);
        }
      }
    });
  },
  clickColor: function(numPage) {
    $("#arrCenter")
      .find("a")
      .eq(numPage)
      .addClass("activeColor");
  },
  //跳转到高德
  goto: function(StartingPoint, endPoint) {
    window.open(
      "https://gaode.com/dir?&from%5Bname%5D=" +
        StartingPoint +
        "&to%5Bname%5D=" +
        endPoint
    );
  },
  // 地图上显示点
  showPoint: function(data) {
    var tData = "";
    //初始化地图对象，加载地图
    // infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
    map.clearMap(); // 清除地图覆盖物
    for (var i = 0, marker; i < data.length; i++) {
      var icon = "";
      if (data[i].managestate == 1) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "../img/led_green.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].managestate == 2) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "../img/led_red.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].managestate == 3) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "../img/led_orange.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      var marker = new AMap.Marker({
        position: [data[i].lon, data[i].lat],
        map: window.map,
        icon: icon
      });
      var tData = data[i];
      marker.content = tData;
      marker.on("click", markerClick);
    }
    function markerClick(e) {
      var etc = e.target.content;
      indexPage.detailsSpot(etc);
      indexPage.inspecting(etc);
    }
    map.setFitView();
  },
  detailsSpot: function(etc) {
    var data = {
      uuid: etc.uuid
    };
    $.ajax({
      type: "GET",
      url: header + "/dfbinterface/mobile/gisshow/GetSingleDisaster", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        if (data.success == "0") {
          indexPage.detailsSpotHtml(etc, data.result);
        }
      }
    });
  },
  //巡查详情
  inspecting: function(etc) {
    $.ajax({
      type: "POST",
      url: header + "/dfbinterface/mobile/inspect/GetSingleInspect", //后台接口地址
      dataType: "json",
      data: { uuid: etc.uuid },
      success: function(data) {
        if (data.success == "0") {
          historyData = {
            data: data.result,
            etc: etc,
            index: data.result.length - 1
          };
          indexPage.inspectingHtml(historyData);
        }
      }
    });
  },
  inspectingHtml: function(historyData) {
    var inspectingDetailHtml = "";
    if (historyData.data.length != 0) {
      var activeData = historyData.data[historyData.index];
      var detail_time = "";
      for (let i = 0; i < historyData.data.length; i++) {
        detail_time += ` <input class="detailB detailB${i}" ids="${i}" type="button" value="${
          historyData.data[i].check_datetime
        }">`;
      }
      var detail_img = "";
      var detail_video = "";
      imgArr = [];
      imgMini = 0;
      videoMini = 0;
      for (let i = 1; i < activeData.attach.length; i++) {
        if (activeData.attach[i].filetype === "1") {
          imgMini++;
          imgArr.push(activeData.attach[i].url_path);
          detail_img += `<li class="imgMin" index="${imgMini - 1}">
          <img src="${activeData.attach[i].url_path}" alt=""></li>`;
        } else if (activeData.attach[i].filetype === "2") {
          videoMini++;
          videoArr.push(activeData.attach[i].url_path);
          detail_video += `<li class="videoMin" index="${videoMini - 1}">
          <video pause="" width="100%" src="${
            activeData.attach[i].url_path
          }" class="pause">暂无视频</video></li>`;
        }
      }
      console.log(detail_img);
      inspectingDetailHtml = `<div class="inspectingDetail-header">
      <span>巡查历史</span>
      <span>编号（${historyData.etc.id}）</span>
      <span id="close5"><img src="img/close.png"></span>
  </div>
  <div class="inspectingDetail-content">
  
      <div class="inspectingDetail-address" title="${
        activeData.inspect_address
      }">
          <span class="lt">签到地址</span>
          <span class="rt">${activeData.inspect_address}</span>
      </div>
      <div class="inspectingDetail-time">
      ${detail_time}
      </div>
      <div class="inspectingDetail-list">
          <p><span class="lt">巡查人</span><span class="rt">${
            activeData.manager
          }</span></p>
          <p><span class="lt">联系电话</span><span class="rt">${
            activeData.managertel
          }</span></p>
          <p><span class="lt">治理现状</span><span class="rt status${
            activeData.managestate
          }">${indexPage.status(activeData.managestate)}</span></p>
          <p><span class="lt">巡查情况</span><span class="rt">${
            activeData.remark
          }</span></p>
          <p>巡查图片</p>
          <div class="detailImgVideo">
              <ul>
                  ${detail_img}
              </ul>
          </div>
          <p>巡查视频</p>
          <div class="detailImgVideo">
              <ul>
                  ${detail_video}
              </ul>
          </div>
      </div>
      <div class="patrolTrack-wrap" id="patrolTrack-wrap">
          <p>巡查轨迹</p>
          <div id="patrolTrack-inner" class="patrolTrack-inner">
              <div id="containerTrack" class="containerTrack"></div>
              <div id="panelTrack" class="panelTrack"></div>
          </div>
      </div>
      </div>`;
      var str = activeData.coordinate_set;
      str = str.replace(/\'/g, '"');
      var walkingArr = JSON.parse(str);
      walkingStart = [
        parseFloat(walkingArr[0].lon),
        parseFloat(walkingArr[0].lat)
      ];
      walkingEnd = [
        parseFloat(walkingArr[walkingArr.length - 1].lon),
        parseFloat(walkingArr[walkingArr.length - 1].lat)
      ];

      $("#inspectingDetail").html(inspectingDetailHtml);
      $(".detailB" + historyData.index).css({
        color: "#ffffff",
        "background-color": "#50bbfb"
      });
      indexPage.walkings(walkingStart, walkingEnd);
    } else {
      inspectingDetailHtml = `<div class="inspectingDetail-header">
      <span>巡查历史</span>
      <span>编号（暂无）</span>
      <span id="close5"><img src="img/close.png"></span>
  </div>
  <div class="inspectingDetail-null">
      暂无数据
      </div>`;
      $("#inspectingDetail").html(inspectingDetailHtml);
    }
  },
  walkings: function(walkingStart, walkingEnd) {
    //巡查轨迹
    var map = new AMap.Map("containerTrack", {
      resizeEnable: true,
      center: walkingStart, //地图中心点
      zoom: 12 //地图显示的缩放级别
    });
    //步行导航
    var walking = new AMap.Walking({
      map: map,
      panel: "panelTrack"
    });
    //根据起终点坐标规划步行路线
    walking.search(walkingStart, walkingEnd);
  },
  detailsSpotHtml: function(etc, data) {
    console.log(data);
    $("#copytxt").html("http://127.0.0.1:5500/share.html?uuid=" + etc.uuid);
    // 获取天气
    var weatherHtml = "";
    $.ajax({
      // url: headerWeather + "/light/mobile/weather/getWeather",
      url: header240 + "/light/mobile/weather/getJsonpWeather",
      type: "POST",
      async: false,
      dataType: "jsonp",
      jsonp: "callback",
      // dataType: "json",
      data: {
        lon: data.fzsite.lon,
        lat: data.fzsite.lat
      },
      success: function(data) {
        console.log(data);
        if (data.success == "0") {
          for (let i = 0; i < data.result.forecast.dailyArray.length; i++) {
            var skycon = {};
            switch (data.result.forecast.dailyArray[i].skycon) {
              case "CLEAR_DAY":
                skycon = {
                  weatherUrl: "../img/CLEAR_DAY.png",
                  status: "晴天"
                };
                break;
              case "CLEAR_NIGHT":
                skycon = {
                  weatherUrl: "../img/CLEAR_NIGHT.png",
                  status: "晴夜"
                };
                break;
              case "PARTLY_CLOUDY_DAY":
                skycon = {
                  weatherUrl: "../img/PARTLY_CLOUDY_DAY.png",
                  status: "多云"
                };
                break;
              case "PARTLY_CLOUDY_NIGHT":
                skycon = {
                  weatherUrl: "../img/PARTLY_CLOUDY_NIGHT.png",
                  status: "多云"
                };
                break;
              case "CLOUDY":
                skycon = {
                  weatherUrl: "../img/CLOUDY.png",
                  status: "阴"
                };
                break;
              case "RAIN":
                skycon = {
                  weatherUrl: "../img/RAIN.png",
                  status: "雨"
                };
                break;
              case "SNOW":
                skycon = {
                  weatherUrl: "../img/SNOW.png",
                  status: "雪"
                };
                break;
              case "WIND":
                skycon = {
                  weatherUrl: "../img/WIND.png",
                  status: "风"
                };
                break;
              case "HAZE":
                skycon = {
                  weatherUrl: "../img/HAZE.png",
                  status: "雾霾沙尘"
                };
                break;
              default:
                skycon = {
                  weatherUrl: "",
                  status: ""
                };
                break;
            }
            weatherHtml += `<li>
            <p>${data.result.forecast.dailyArray[i].date}</p>
            <p>${data.result.forecast.dailyArray[i].tempMin}/${
              data.result.forecast.dailyArray[i].tempMax
            }℃</p>
            <img src="${skycon.weatherUrl}" alt="">
            <p>${skycon.status}</p>
        </li>`;
          }
        }
      }
    });
    var imgHtml = "";
    var videoHtml = "";
    imgArr = [];
    videoArr = [];
    imgMini = 0;
    videoMini = 0;
    setTimeout(() => {
      for (let i = 0; i < data.attachList.length; i++) {
        if (data.attachList[i].filetype === "1") {
          imgMini++;
          imgArr.push(data.attachList[i].url_path);
          imgHtml += `<li class="imgMin" index="${imgMini - 1}">
        <img width="100%" src="${data.attachList[i].url_path}" alt="暂无图片">
        <a>${config.formatDate(data.attachList[i].createtime)}</a>
        </li>`;
        } else if (data.attachList[i].filetype === "2") {
          videoMini++;
          videoArr.push(data.attachList[i].url_path);
          videoHtml += `<li class="videoMin" index="${videoMini - 1}">
        <video pause="" width="100%" src="${
          data.attachList[i].url_path
        }" class="pause">暂无视频</video>
        <a>${config.formatDate(data.attachList[i].createtime)}</a>
        </li>`;
        }
      }
      if (imgHtml.length == 0) {
        imgHtml =
          "<p style='font-size:14px;line-height:45px;color:#666666;padding-left:14px;'>暂无照片</p>";
      }
      if (videoHtml.length == 0) {
        videoHtml =
          "<p style='font-size:14px;line-height:45px;color:#666666;padding-left:14px;'>暂无视频</p>";
      }
      var detailsHtml = `<div class="details-header">
    <span title=${data.fzsite.secondname}>${data.fzsite.secondname}</span>
    <span>(编号：${data.fzsite.id})</span>
    <span id="close3"><img src="img/close.png" alt=""></span>
</div>
<div class="details-content">
    <div class="address"  title="${data.fzsite.addressname}">
        <span class="lt">灾情地址：</span>
        <span><img id='goto' data=${
          data.fzsite.addressname
        } src="img/goto.png" alt=""></span>
        <span class="rt">${data.fzsite.addressname}</span>
    </div>
    <p class="quyujiedao rt">所属区（街道）：${data.fzsite.areaname}${
        data.fzsite.street
      }<p>
    <div class="disasterPoint">
        <p>
            <span class="lt">灾情概况： <a class="status${
              data.fzsite.managestate
            }">( ${indexPage.status(data.fzsite.managestate)})</a></span>
            <span id="qrButton" class="rt pl30">转发</span>
            <span class="rt" id="inspecting">巡查</span>
        </p>
        <p>
            <span class="lt">上报者</span>
            <span class="rt">${data.fzsite.manager}</span>
        </p>
        <p>
            <span class="lt">联系电话</span>
            <span class="rt">${data.fzsite.managertel}</span>
        </p>
        <p>
            <span class="lt">上报时间</span>
            <span class="rt">${data.fzsite.checkdate}</span>
        </p>
        <p>
            <span class="lt">灾情状况</span>
            <span class="rt">${data.fzsite.remark}</span>
        </p>
    </div>
    <div class="fieldPhoto">
        <p>现场照片</p>
        <div class="fieldPhoto-wrap">
            <ul>
                ${imgHtml}
            </ul>
        </div>
    </div>
    <div class="fieldVideo">
        <p>现场视频</p>
        <div class="fieldVideo-wrap">
            <ul>
                ${videoHtml}
            </ul>
        </div>
    </div>
    <div class="weather">
        <p>未来天气</p>
        <ul>
            ${weatherHtml}
        </ul>
    </div>
    <div class="else">
        <ul lat=${data.fzsite.lat} lon=${data.fzsite.lon}>
            <li class="aroundList" data="学校">
                <img src="img/school.png" alt="">
                <p>学校</p>
            </li>
            <li class="aroundList" data="避难场所">
                <img src="img/refuge.png" alt="">
                <p>
                避难场所
                </p>
            </li>
            <li class="aroundList" data="重要场所">
                <img src="img/ImportantPlace.png" alt="">
                <p>
                    重要场所
                </p>
            </li>
            <li class="aroundList" data="水库">
                <img src="img/reservoir.png" alt="">
                <p>
                    水库
                </p>
            </li>
        </ul>
    </div>
</div>`;
      $("#details").html(detailsHtml);
      $("#details").show();
    }, 300);
  },
  //周围信息
  around: function(lat, lon, name) {
    AMap.service(["AMap.PlaceSearch"], function() {
      var placeSearch = new AMap.PlaceSearch({
        //构造地点查询类
        pageSize: 3,
        type: name,
        pageIndex: 1,
        map: map,
        panel: "panel"
      });
      config.setZoomAndCenter(lon, lat);
      var cpoint = [lon, lat]; //中心点坐标
      placeSearch.searchNearBy("", cpoint, 500, function(status, result) {});
    });
  }
};
indexPage.init();
// 定位
map.plugin("AMap.Geolocation", function() {
  var geolocation = new AMap.Geolocation({
    // 是否使用高精度定位，默认：true
    enableHighAccuracy: true,
    // 设置定位超时时间，默认：无穷大
    timeout: 10000,
    // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
    buttonOffset: new AMap.Pixel(10, 20),
    //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
    zoomToAccuracy: true,
    //  定位按钮的排放位置,  RB表示右下
    buttonPosition: "RB"
  });
  geolocation.getCurrentPosition();
  AMap.event.addListener(geolocation, "complete", onComplete);
  AMap.event.addListener(geolocation, "error", onError);

  function onComplete(data) {
    // data是具体的定位信息
    if (data.info == "SUCCESS") {
    }
  }

  function onError(data) {
    // 定位出错
    console.log(
      "由于Chrome、IOS10等已不再支持非安全域的浏览器定位请求，为保证定位成功率和精度，请尽快升级您的站点到HTTPS。"
    );
  }
});
