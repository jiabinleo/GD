var layers = [new AMap.TileLayer.Satellite()], //, new AMap.TileLayer.RoadNet()
  map,
  satellite = false,
  jsonData,
  numPage = 1,
  numPageS,
  dtype = [],
  gradename = [],
  areaname = [],
  dtypes = "", //灾情
  warnlevel = "", //等级
  historyData, //巡查历史记录数据
  imgArr = [], //存储照片视频上下切换
  videoArr = [],
  detailImgArr = [],
  detailVideoArr = [],
  imgTanArr = [],
  videoTanArr = [],
  indexImgVideo = 0, // 当前显示第几张
  nextNum = 0, //切换下一张的最大数量
  imgYes = true, //当前弹框是img还是video
  allData, //搜索部分所有数据
  newOpenUuid, //左侧弹框地址编号
  pageNum = 5, //每页显示的数量
  pointData,
  CanvasLayer, //canvas图层
  clickPointObj = {}; //最新点击的点
map = new AMap.Map("container", { resizeEnable: true, layers: layers });
var indexPage = {
  init: function() {
    indexPage.changeMap([]);
    indexPage.queryGetGisAreaName();
    indexPage.listen();
    indexPage.getGovernance({ username: "admin" });
    indexPage.clickColor(numPage);
    indexPage.queryData("", layers);
    $("#msgWrap").load("view/message.html");
    //拖拽
    config.drag("tableList");
    config.drag("details");
    config.drag("msgWrap");
    config.drag("inspectingDetail");
    config.drag("tableWrap");
  },
  listen: function() {
    //查询按钮
    $("#search").on("click", function() {
      $(".status span").removeClass("insetActive");
      areaname = $("#getAreaName option:selected").val();
      if (dtype.length == 0 || dtype.length == 2) {
        dtypes = "";
      } else {
        dtypes = dtype[0];
      }
      warnlevel = "";
      for (let i = 0; i < gradename.length; i++) {
        warnlevel += gradename[i] + ",";
      }
      warnlevel = warnlevel.substring(0, warnlevel.length - 1);
      data = {
        dtype: dtypes,
        areaid: areaname == "全部" ? "" : areaname,
        warnlevel: warnlevel,
        managestate: "" //所有状态
      };
      indexPage.queryData(data, layers);
    });
    $("#arrL").on("click", function() {
      if (numPage > 1) {
        numPage--;
        indexPage.tableList(jsonData, numPage);
        var _activeColor = $(".activeColor");
        $("#arrCenter")
          .find(".activeColor")
          .removeClass("activeColor")
          .prev()
          .addClass("activeColor");
      }
    });
    $("#arrR").on("click", function() {
      if (numPage < numPageS) {
        numPage++;
        indexPage.tableList(jsonData, numPage);
        $("#arrCenter")
          .find(".activeColor")
          .removeClass("activeColor")
          .next()
          .addClass("activeColor");
      }
    });
    $("#arrCenter").on("click", "a", function() {
      numPage = $(this).html();
      $(this)
        .addClass("activeColor")
        .siblings()
        .removeClass("activeColor");
      indexPage.tableList(jsonData, numPage);
    });
    //点击加载卫星图和普通图
    $("#satellite").on("click", function() {
      $("#search").trigger("click");
      //卫星图
      if (satellite) {
        layers = [];
      } else {
        layers = [new AMap.TileLayer.Satellite()];
      }
      satellite = !satellite;

      setTimeout(function() {
        indexPage.changeMap(layers);
        $("#search").trigger("click");
      }, 300);
    });
    //路径规划
    $(document).on("click", "#goto", function() {
      window.open(
        "https://gaode.com/dir?&to%5Bname%5D=" + $(this).attr("data")
      );
    });
    //点击检索
    $("#retrieval").on("click", function() {
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
    //关闭检索
    $("#close1").on("click", function() {
      $("#retrievalBox").hide();
      $(".retrieval")
        .removeClass("retrieval-hide")
        .addClass("retrieval-show");
    });

    // 显示图表
    $("#chart").on("click", function() {
      $("#tableList").load("view/table.html");
      if ($("#tableList").css("display") == "none") {
        $("#tableList").show();
      } else {
        $("#tableList").hide();
      }
    });

    //关闭详情
    $(document).on("click", "#close3", function() {
      $("#details").hide();
    });
    //灾情类型
    $(".disasterType").on("click", "[name='check']", function() {
      if ($(this).prop("className") == "checkFalse") {
        $(this).removeClass("checkFalse");
        $(this).addClass("checkTrue");
        dtype.push($(this).attr("data"));
      } else if ($(this).prop("className") == "checkTrue") {
        $(this).removeClass("checkTrue");
        $(this).addClass("checkFalse");
        dtype.splice($.inArray($(this).attr("data"), dtype), 1);
      }
    });
    //灾害等级
    $(".grade").on("click", "[name='check']", function() {
      if ($(this).prop("className") == "checkFalse") {
        $(this).removeClass("checkFalse");
        $(this).addClass("checkTrue");
        gradename.push($(this).attr("data"));
      } else if ($(this).prop("className") == "checkTrue") {
        $(this).removeClass("checkTrue");
        $(this).addClass("checkFalse");
        gradename.splice($.inArray($(this).attr("data"), gradename), 1);
      }
    });
    //转移视觉目标
    $("#tbodyHtml").on("click", "tr", function() {
      indexPage.setZoomAndCenter(
        $(this).attr("lon"),
        $(this).attr("lat"),
        $(this).attr("managestate"),
        17
      );
    });
    //根据状态筛选
    $(".status").on("click", "span", function() {
      $(this)
        .addClass("insetActive")
        .siblings()
        .removeClass("insetActive");
      areaname = $("#getAreaName option:selected").val();
      if (dtype.length == 0 || dtype.length == 2) {
        dtypes = "";
      } else {
        dtypes = dtype[0];
      }
      warnlevel = "";
      for (let i = 0; i < gradename.length; i++) {
        warnlevel += gradename[i] + ",";
      }
      warnlevel = warnlevel.substring(0, warnlevel.length - 1);
      managestate = $(this).attr("data");
      var data = {
        dtype: "",
        areaid: "",
        warnlevel: "",
        managestate: managestate
      };
      for (let i = 0; i < $("[name='check']").length; i++) {
        $("[name='check']")
          .eq(i)
          .removeClass("checkTrue")
          .addClass("checkFalse");
      }
      dtype = [];
      areaname = [];
      indexPage.queryData(data, layers);
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
      imgYes = true;
      imgTanArr = imgArr;
      nextNum = imgTanArr.length;
      indexImgVideo = $(this).attr("index");
      $(".mask-img").html(
        `<div class="prev"></div>
      <img id="vid" onerror=src="./img/loading.gif" src="${
        imgTanArr[indexImgVideo]
      }" alt="加载中233.。。">
      <div class="next"></div>`
      );
      $(".mask-wrap").show();
      $(".mask-img").show();
    });
    //放大巡查图片
    $(document).on("click", ".imgMinDetail", function() {
      imgYes = true;
      imgTanArr = detailImgArr;
      nextNum = imgTanArr.length;
      indexImgVideo = $(this).attr("index");

      $(".mask-img").html(
        `<div class="prev"></div>
      <img id="vid" src="${imgTanArr[indexImgVideo]}" alt="暂无图片">
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
      videoTanArr = videoArr;
      nextNum = videoTanArr.length;
      indexImgVideo = $(this).attr("index");
      $(".mask-img").html(
        `<div class="prev"></div>
        <video id="vid" controls="controls" muted pause="" width="100%" 
        src="${videoTanArr[indexImgVideo]}" 
        class="pause">暂无视频</video>
        <div class="next"></div>`
      );
      var maskImgHeight = $(".mask-img")[0].clientHeight;
      $(".mask-wrap").show();
      $(".mask-img").show();
    });
    //放大巡查视频
    $(document).on("click", ".videoMinDetail", function() {
      imgYes = false;
      videoTanArr = detailVideoArr;
      nextNum = videoTanArr.length;
      indexImgVideo = $(this).attr("index");
      $(".mask-img").html(
        `<div class="prev"></div>
        <video id="vid" controls="controls" muted pause="" width="100%" 
        src="${videoTanArr[indexImgVideo]}" 
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
          $("#vid").attr("src", imgTanArr[indexImgVideo]);
        } else {
          $("#vid").attr("src", videoTanArr[indexImgVideo]);
        }
      }
      return false;
    });
    $(document).on("click", ".next", function() {
      if (indexImgVideo < nextNum - 1) {
        indexImgVideo++;
        if (imgYes) {
          $("#vid").attr("src", imgTanArr[indexImgVideo]);
        } else {
          $("#vid").attr("src", videoTanArr[indexImgVideo]);
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
    //更多详情
    $(document).on("click", "#openNew", function() {
      var src = filePath.share + "?disasterid=" + newOpenUuid;
      window.open(src);
    });
    $(document).on("click", "#qrcode", function() {
      return false;
    });

    // 搜索
    $(document).on("click", "#searchs", function() {
      if (allData) {
        var searchVal = $.trim($("#searchTxt").val());
        var searchResultHtml = "";
        for (let i = 0; i < allData.length; i++) {
          if (allData[i].addressname.indexOf(searchVal) != -1) {
            searchResultHtml += `<li class="sta${+allData[i]
              .managestate}" lon=${allData[i].lon} lat=${
              allData[i].lat
            } managestate=${allData[i].managestate} title="${
              allData[i].addressname
            }">${allData[i].addressname}</li>`;
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
            searchResultHtml += `<li class="sta${+allData[i]
              .managestate}"  lon=${allData[i].lon} lat=${
              allData[i].lat
            } managestate=${allData[i].managestate} title="${
              allData[i].addressname
            }">${allData[i].addressname}</li>`;
          }
        }
        $("#searchResultHtml").html(searchResultHtml);
        $("#searchResult").show();
      }
    });
    $(document).on("click", "#searchResultHtml > li", function() {
      indexPage.setZoomAndCenter(
        $(this).attr("lon"),
        $(this).attr("lat"),
        $(this).attr("managestate"),
        17
      );
      return false;
    });
    $(document).on("click", ".search", function() {
      return false;
    });
    $(document).on("click", function() {
      $("#searchResult").hide();
    });
    $(document).on("click", "#message", function() {
      $("#msgWrap").load("view/message.html");
      if ($("#msgWrap").css("display") == "none") {
        $("#msgWrap").show();
      } else if ($("#msgWrap").css("display") == "block") {
        $("#msgWrap").hide();
      }
    });
    //灾害点图片
    $(document).on("click", "#fieldPhoto_wrap > div", function() {
      var fieldPhotoMarginLeft = 0;
      if ($(this).attr("class") === "imgArrRight") {
        fieldPhotoMarginLeft =
          parseInt($(".fieldPhoto-wrap > ul").css("marginLeft")) - 144;
      } else if ($(this).attr("class") === "imgArrLeft") {
        fieldPhotoMarginLeft =
          parseInt($(".fieldPhoto-wrap > ul").css("marginLeft")) + 144;
      }
      if (
        fieldPhotoMarginLeft >= (imgArr.length - 3) * -144 &&
        fieldPhotoMarginLeft <= 0
      ) {
        $(".fieldPhoto-wrap > ul").css("marginLeft", fieldPhotoMarginLeft);
      }
    });
    $(document).on("click", "#fieldVideo_wrap > div", function() {
      var fieldPhotoMarginLeft = 0;
      if ($(this).attr("class") === "videoArrRight") {
        fieldPhotoMarginLeft =
          parseInt($(".fieldVideo-wrap > ul").css("marginLeft")) - 144;
      } else if ($(this).attr("class") === "videoArrLeft") {
        fieldPhotoMarginLeft =
          parseInt($(".fieldVideo-wrap > ul").css("marginLeft")) + 144;
      }
      if (
        fieldPhotoMarginLeft >= (videoArr.length - 3) * -144 &&
        fieldPhotoMarginLeft <= 0
      ) {
        $(".fieldVideo-wrap > ul").css("marginLeft", fieldPhotoMarginLeft);
      }
    });
    // 巡查图片左右滑动
    $(document).on("click", "#detailImg > div", function() {
      var photoMarginLeft = 0;
      if ($(this).attr("class") === "imgArrDetailRight") {
        photoMarginLeft =
          parseInt($("#detailImg > ul").css("marginLeft")) - 144;
      } else if ($(this).attr("class") === "imgArrDetailLeft") {
        photoMarginLeft =
          parseInt($("#detailImg > ul").css("marginLeft")) + 144;
      }
      if (
        photoMarginLeft >= (detailImgArr.length - 3) * -144 &&
        photoMarginLeft <= 0
      ) {
        $("#detailImg > ul").css("marginLeft", photoMarginLeft);
      }
    });
    $(document).on("click", "#detailVideo > div", function() {
      var photoMarginLeft = 0;
      if ($(this).attr("class") === "videoArrDetailRight") {
        photoMarginLeft =
          parseInt($("#detailVideo > ul").css("marginLeft")) - 144;
      } else if ($(this).attr("class") === "videoArrDetailLeft") {
        photoMarginLeft =
          parseInt($("#detailVideo > ul").css("marginLeft")) + 144;
      }
      if (
        photoMarginLeft >= (detailVideoArr.length - 3) * -144 &&
        photoMarginLeft <= 0
      ) {
        $("#detailVideo > ul").css("marginLeft", photoMarginLeft);
      }
    });
    //关闭表单页面
    $(document).on("click", ".closeTable", function() {
      $("#tableWrap").hide();
    });
    // 快捷;

    $(document).on("click", "#zqsb", function() {
      window.parent.addTab({
        url: "/light/fzSite/addSiteView",
        title: "灾情上报",
        iconCls: ""
      });
    });
    $(document).on("click", "#zljh", function() {
      window.parent.addTab({
        url: "/light/plan/manager",
        title: "防止计划",
        iconCls: ""
      });
    });
    console.log($("#retrievalBox").height()); //490.609//560//495.297
    if ($("#retrievalBox").height() < 500) {
      pageNum = 3; //每页显示的数量
    }
    // $(document).on("click", "#msgWrap_details", function(e) {
    //   window.event? window.event.cancelBubble = true : e.stopPropagation();
    // });
  },
  changeMap: function(layers) {
    map = new AMap.Map("container", {
      resizeEnable: true,
      zoom: 16,
      layers: layers
    });
  },
  //根据条件查询数据
  queryData: function(data, layers) {
    $.ajax({
      type: "GET",
      url: fileUrl.header98 + "/dfbinterface/mobile/gisshow/GetGisDisasterdata", //后台接口地址
      dataType: "jsonp",
      data: data,
      callback: "callback",
      success: function(data) {
        if (data.success === "0") {
          jsonData = data.result;
          allData = data.result;
          numPage = 1; //重置为第一页
          indexPage.paging(data.result.length);
          indexPage.tableList(jsonData, numPage);
          indexPage.showPoint(data.result, layers);
          try {
            CanvasLayer.hide();
          } catch (error) {}
        }
      }
    });
  },
  // 获取所在区域
  queryGetGisAreaName: function() {
    $.ajax({
      type: "GET",
      url: fileUrl.header98 + "/dfbinterface/mobile/gisshow/GetGisAreaname", //后台接口地址
      dataType: "jsonp",
      callback: "callback",
      success: function(data) {
        var result = data.result;
        var selectconten = "<option value='全部'>全部</option>";
        for (var i = 0; i < result.length; i++) {
          selectconten +=
            "<option value='" +
            result[i].id +
            "'>" +
            result[i].name +
            "</option>";
        }
        $("#getAreaName").html(selectconten);
      }
    });
  },
  //分页
  paging: function(num) {
    var numpage = "";
    numPageS = Math.ceil(num / pageNum);
    numpage += "<a class='activeColor'>" + 1 + "</a>";
    for (let i = 2; i < Math.ceil(num / pageNum) + 1; i++) {
      numpage += "<a>" + i + "</a>";
    }
    $("#arrCenter").html(numpage);
  },

  //查询列表warnlevel
  tableList: function(data, numPage) {
    var tbodyHtml = "";
    var nums = numPage * pageNum;
    if (data.length < numPage * pageNum) {
      nums = data.length;
    }
    for (let i = (numPage - 1) * pageNum; i < nums; i++) {
      tbodyHtml +=
        "<tr lat=" +
        data[i].lat +
        " lon=" +
        data[i].lon +
        " managestate=" +
        data[i].managestate +
        " title=" +
        (data[i].addressname ? data[i].addressname : "") +
        "><td>" +
        data[i].id +
        "</td><td>" +
        data[i].addressname +
        "</td><td class=status" +
        data[i].managestate +
        ">" +
        config.status(data[i].managestate) +
        "</td></tr>";
    }
    $("#tbodyHtml").html(tbodyHtml);
  },
  //治理状况统计
  getGovernance: function(data) {
    $.ajax({
      type: "POST",
      url: fileUrl.header98 + "/dfbinterface/mobile/gisshow/Getypecount",
      dataType: "jsonp",
      data: data,
      callback: "callback",
      success: function(data) {
        console.log(data);
        if (data.success == "0") {
          $("#ungovern").html(data.result.suspending);
          $("#ingovern").html(data.result.solved);
          $("#hasgovern").html(data.result.handling);
          $("#casgovern").html(data.result.casehandling);
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
  // 地图上显示点
  showPoint: function(data) {
    var markers = [];
    pointData = data;
    var tData = "";
    map.clearMap(); // 清除地图覆盖物
    // indexPage.notHarnessing(pointData);
    AMap.event.addListener(map, "zoomend", function() {
      indexPage.sizeZoom(map.getZoom());
      indexPage.clickPoint(clickPointObj);
    });
    for (var i = 0, marker; i < data.length; i++) {
      var icon = "";
      if (data[i].managestate == 1) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "img/led_green.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].managestate == 2) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "img/led_red.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].managestate == 3) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "img/led_orange.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].managestate == 4) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "img/led_green.png",
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
      AMap.event.addListener(map, "zoomend", function() {
        var data = pointData;
        map.remove(markers);
        markers = [];

        if (map.getZoom() > 14) {
          for (var i = 0, marker; i < data.length; i++) {
            var icon = "";
            if (data[i].managestate == 1) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_green.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].managestate == 2) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_red.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].managestate == 3) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_orange.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].managestate == 4) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_green.png",
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
            marker.setLabel({
              offset: new AMap.Pixel(0, 0), //修改label相对于maker的位置
              // offset: new AMap.Pixel(-100, -25), //修改label相对于maker的位置
              content: tData.addressname
            });
            markers.push(marker);
          }
        } else {
          for (var i = 0, marker; i < data.length; i++) {
            var icon = "";
            if (data[i].managestate == 1) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_green.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].managestate == 2) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_red.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].managestate == 3) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_orange.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].managestate == 4) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_green.png",
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
            marker.setLabel({
              offset: new AMap.Pixel(-100, -20), //修改label相对于maker的位置
              content: ""
            });
            markers.push(marker);
          }
        }
      });
    }
    function markerClick(e) {
      var etc = e.target.content;
      var color = "#0aa2fa";
      switch (etc.managestate) {
        case "1":
          color = "#0aa2fa";
          break;
        case "2":
          color = "#ff0000";
          break;
        case "3":
          color = "#fa9d0a";
          break;
        case "4":
          color = "#0aa2fa";
          break;

        default:
          break;
      }
      clickPointObj = {
        lon: etc.lon,
        lat: etc.lat,
        size: "",
        color: color
      };
      indexPage.sizeZoom(map.getZoom());

      indexPage.detailsSpot(etc);
      indexPage.inspecting(etc);
      indexPage.clickPoint(clickPointObj);
    }
    map.setFitView();
  },
  // 转移视觉目标
  setZoomAndCenter: function(lon, lat, managestate, lever) {
    var color = "#0aa2fa";
    switch (managestate) {
      case "1":
        color = "#0aa2fa";
        break;
      case "2":
        color = "#ff0000";
        break;
      case "3":
        color = "#fa9d0a";
        break;
      case "4":
        color = "#0aa2fa";
        break;

      default:
        break;
    }
    clickPointObj = {
      lon: parseFloat(lon),
      lat: parseFloat(lat),
      size: "",
      color: color
    };
    indexPage.sizeZoom(map.getZoom());
    map.setZoomAndCenter(lever, [lon, lat]);
    setTimeout(function() {
      indexPage.clickPoint(clickPointObj);
    }, 500);
  },
  sizeZoom: function(ziseZoom) {
    switch (ziseZoom) {
      case 3:
        clickPointObj.size = 15;
        break;
      case 4:
        clickPointObj.size = 12;
        break;
      case 5:
        clickPointObj.size = 7;
        break;
      case 6:
        clickPointObj.size = 3;
        break;
      case 7:
        clickPointObj.size = 1.5;
        break;
      case 8:
        clickPointObj.size = 0.9;
        break;
      case 9:
        clickPointObj.size = 0.3;
        break;
      case 10:
        clickPointObj.size = 0.14;
        break;
      case 11:
        clickPointObj.size = 0.06;
        break;
      case 12:
        clickPointObj.size = 0.03;
        break;
      case 13:
        clickPointObj.size = 0.025;
        break;
      case 14:
        clickPointObj.size = 0.012;
        break;
      case 15:
        clickPointObj.size = 0.008;
        break;
      case 16:
        clickPointObj.size = 0.002;
        break;
      case 17:
        clickPointObj.size = 0.0013;
        break;
      case 18:
        clickPointObj.size = 0.001;
        break;
      case 19:
        clickPointObj.size = 0.0008;
        break;
      case 20:
        clickPointObj.size = 0.0004;
        break;
      default:
        break;
    }
  },
  clickPoint: function(clickPointObj) {
    try {
      CanvasLayer.hide();
    } catch (error) {}
    try {
      indexPage.addDraw(
        clickPointObj.lon,
        clickPointObj.lat,
        clickPointObj.size,
        clickPointObj.color
      );
    } catch (error) {}
  },
  // 增加图层
  addDraw: function(lon, lat, size, color) {
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = 200;
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    context.strokeStyle = "white";
    context.globalAlpha = 1;
    context.lineWidth = 2;
    var radious = 0;
    var draw = function(argument) {
      context.clearRect(0, 0, 200, 200);
      context.globalAlpha = (context.globalAlpha - 0.01 + 1) % 1;
      radious = (radious + 1) % 100;
      context.beginPath();
      context.arc(100, 100, radious, 0, 2 * Math.PI);
      context.fill();
      context.stroke();
      AMap.Util.requestAnimFrame(draw);
    };
    CanvasLayer = new AMap.CanvasLayer({
      canvas: canvas,
      bounds: new AMap.Bounds(
        [lon - size, lat - size],
        [lon + size, lat + size]
      ),
      zooms: [1, 21]
    });
    CanvasLayer.setMap(map);
    draw();
  },
  detailsSpot: function(etc) {
    var data = {
      uuid: etc.uuid
    };
    $.ajax({
      type: "GET",
      url: fileUrl.header98 + "/dfbinterface/mobile/gisshow/GetSingleDisaster", //后台接口地址
      dataType: "jsonp",
      data: data,
      callback: "callback",
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
      url: fileUrl.header88 + "/light/inspect/GetSingleInspect", //后台接口地址
      dataType: "json",
      data: { uuid: etc.uuid },
      success: function(data) {
        console.log(data);
        if (data.success == true) {
          historyData = {
            data: data.result,
            etc: etc,
            index: data.result.length - 1
          };
          indexPage.inspectingHtml(historyData);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  },
  inspectingHtml: function(historyData) {
    var inspectingDetailHtml = "";
    if (historyData.data.length != 0) {
      var activeData = historyData.data[historyData.index];
      var detail_time = "";
      for (let i = historyData.data.length - 1; i >= 0; i--) {
        detail_time += ` <input class="detailB detailB${i}" ids="${i}" type="button" value="${
          historyData.data[i].check_datetime
        }">`;
      }
      var detail_img = "";
      var detail_video = "";
      detailImgArr = [];
      (detailVideoArr = []), (imgMini = 0);
      videoMini = 0;
      for (let i = 1; i < activeData.attach.length; i++) {
        if (activeData.attach[i].filetype === "1") {
          imgMini++;
          detailImgArr.push(activeData.attach[i].url_path);
          detail_img += `<li class="imgMinDetail" index="${imgMini - 1}">
          <img src="${activeData.attach[i].url_path}" alt=""></li>`;
        } else if (activeData.attach[i].filetype === "2") {
          videoMini++;
          detailVideoArr.push(activeData.attach[i].url_path);
          detail_video += `<li class="videoMinDetail" index="${videoMini - 1}">
          <video controls="controls" muted pause="" width="100%" src="${
            activeData.attach[i].url_path
          }" class="pause">暂无视频</video></li>`;
        }
      }
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
          }">${config.status(activeData.managestate)}</span></p>
          <p><span class="lt">巡查情况</span><span class="rt">${
            activeData.remark
          }</span></p>
          <p>巡查图片</p>
          <div id="detailImg" class="detailImg">
              <div class="imgArrDetailLeft"><img src="./img/graypre.png" /></div>
              <div class="imgArrDetailRight"><img src="./img/graynext.png" /></div>
              <ul>
                  ${detail_img}
              </ul>
          </div>
          <p>巡查视频</p>
          <div id="detailVideo" class="detailVideo">
              <div class="videoArrDetailLeft"><img src="./img/graypre.png" /></div>
              <div class="videoArrDetailRight"><img src="./img/graynext.png" /></div>
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
      $(".detailImg > ul").css({
        width: detailImgArr.length * 146,
        "min-width": "438px"
      });
      $(".detailVideo > ul").css({
        width: detailVideoArr.length * 146,
        "min-width": "438px"
      });
      if (
        parseInt($("#detailImg > ul").css("width")) <=
        parseInt($("#detailImg").css("width"))
      ) {
        $(".detailImg > div").css({ display: "none" });
      }
      if (
        parseInt($("#detailVideo > ul").css("width")) <=
        parseInt($("#detailVideo").css("width"))
      ) {
        $(".detailVideo > div").css({ display: "none" });
      }
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
    newOpenUuid = etc.uuid;
    // 获取天气
    var weatherHtml = "";
    var description = ""; //短临预报
    $.ajax({
      url: fileUrl.weather + "/light/mobile/weather/getWeather",
      type: "POST",
      async: false,
      dataType: "json",
      data: {
        lon: data.fzsite.lon,
        lat: data.fzsite.lat
      },
      success: function(data) {
        if (data.success == "0") {
          for (let i = 0; i < data.result.forecast.dailyArray.length; i++) {
            description = data.result.forecast.description;
            var skycon = {};
            switch (data.result.forecast.dailyArray[i].skycon) {
              case "CLEAR_DAY":
                skycon = {
                  weatherUrl: "img/CLEAR_DAY.png",
                  status: "晴天"
                };
                break;
              case "CLEAR_NIGHT":
                skycon = {
                  weatherUrl: "img/CLEAR_NIGHT.png",
                  status: "晴夜"
                };
                break;
              case "PARTLY_CLOUDY_DAY":
                skycon = {
                  weatherUrl: "img/PARTLY_CLOUDY_DAY.png",
                  status: "多云"
                };
                break;
              case "PARTLY_CLOUDY_NIGHT":
                skycon = {
                  weatherUrl: "img/PARTLY_CLOUDY_NIGHT.png",
                  status: "多云"
                };
                break;
              case "CLOUDY":
                skycon = {
                  weatherUrl: "img/CLOUDY.png",
                  status: "阴"
                };
                break;
              case "RAIN":
                skycon = {
                  weatherUrl: "img/RAIN.png",
                  status: "雨"
                };
                break;
              case "SNOW":
                skycon = {
                  weatherUrl: "img/SNOW.png",
                  status: "雪"
                };
                break;
              case "WIND":
                skycon = {
                  weatherUrl: "img/WIND.png",
                  status: "风"
                };
                break;
              case "HAZE":
                skycon = {
                  weatherUrl: "img/HAZE.png",
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
            <p>${getWeek(data.result.forecast.dailyArray[i].date)}</p>
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
    for (let i = 0; i < data.attachList.length; i++) {
      if (data.attachList[i].filetype === "1") {
        imgMini++;
        imgArr.push(data.attachList[i].url_path);
        imgHtml += `<li class="imgMin"  index="${imgMini - 1}">
        <img width="100%" src="${
          data.attachList[i].url_path
        }"  onerror=src="./img/loading.gif" alt="暂无图片">
        <a>${config.formatDate(data.attachList[i].createtime)}</a>
        </li>`;
      } else if (data.attachList[i].filetype === "2") {
        videoMini++;
        videoArr.push(data.attachList[i].url_path);
        videoHtml += `<li class="videoMin" index="${videoMini - 1}">
        <video  width="100%" src="${
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
            }">( ${config.status(data.fzsite.managestate)})</a></span>
           <span id="openNew" class="rt pl30 moreDetail">更多详情</span>
            <span class="inspecting rt" id="inspecting" >巡查</span>
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
            <span class="rt">${config.formatDate(data.fzsite.createtime)}</span>
        </p>
        <p>
            <span class="lt">灾情状况</span>
            <span class="rt">${data.fzsite.remark}</span>
        </p>
    </div>
    <div class="fieldPhoto">
        <p>现场照片</p>
        <div id="fieldPhoto_wrap" class="fieldPhoto-wrap">
            <div class="imgArrLeft"><img src="./img/graypre.png" /></div>
            <div class="imgArrRight"><img src="./img/graynext.png" /></div>
            <ul>
                ${imgHtml}
            </ul>
        </div>
    </div>
    <div class="fieldVideo">
        <p>现场视频</p>
        <div id="fieldVideo_wrap" class="fieldVideo-wrap">
            <div class="videoArrLeft"><img src="./img/graypre.png" /></div>
            <div class="videoArrRight"><img src="./img/graynext.png" /></div>
            <ul>
                ${videoHtml}
            </ul>
        </div>
    </div>
    <div class="weather">
        <p>未来天气<span style="font-size:12px;transform: scale(0.5);">[彩云天气]</span>（${description}）</p>
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
            <li class="aroundList" data="社区">
                <img src="img/community.png" alt="">
                <p>
                社区
                </p>
            </li>
            <li class="aroundList" data="水库">
                <img src="img/reservoir.png" alt="">
                <p>
                水库
                </p>
            </li>
            <li class="aroundList" data="医院">
                <img src="img/hospital.png" alt="">
                <p>
                    医院
                </p>
            </li>
            <li class="aroundList" data="地铁站">
                <img src="img/metroStation.png" alt="">
                <p>
                地铁站
                </p>
            </li>
        </ul>
    </div>
</div>`;

    $("#details").html(detailsHtml);

    $(".fieldPhoto-wrap > ul").css({
      width: imgArr.length * 154,
      "min-width": "438px"
    });
    $(".fieldVideo-wrap > ul").css({
      width: videoArr.length * 154,
      "min-width": "438px"
    });
    if (
      parseInt($("#fieldPhoto_wrap > ul").css("width")) <=
      parseInt($("#fieldPhoto_wrap").css("width"))
    ) {
      $(".fieldPhoto-wrap > div").css({ display: "none" });
    }
    if (
      parseInt($("#fieldVideo_wrap > ul").css("width")) <=
      parseInt($("#fieldVideo_wrap").css("width"))
    ) {
      $(".fieldVideo-wrap > div").css({ display: "none" });
    }
    $("#details").show();
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
      var cpoint = [lon, lat]; //中心点坐标
      placeSearch.searchNearBy("", cpoint, 500, function(status, result) {});
      map.setZoomAndCenter(17, [lon, lat]);
    });
  }
};
indexPage.init();
