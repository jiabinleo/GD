var layers = [new AMap.TileLayer.Satellite()], //, new AMap.TileLayer.RoadNet()
  map,
  satellite = false,
  jsonData,
  numPage = 1,
  numPageS,
  dataS = {},
  // dtype = [],
  markerL = [], //地图上隐患点图标集合
  gradename = [],
  areaname = [],
  // dtypes = "", //灾情
  warnlevel = "", //等级
  historyData, //巡查历史记录数据
  detailImgArr = [],
  detailVideoArr = [],
  imgTanArr = [],
  videoTanArr = [],
  imgVideoWArr = [], //图片视频集合
  detail_imgVideoArr = [], //巡查历史图片视频集合
  indexImgVideo = 0, // 当前显示第几张
  detail_indexImgVideo = 0, //巡查历史当前显示第几张
  nextNum = 0, //切换下一张的最大数量
  imgYes = true, //当前弹框是img还是video
  allData, //搜索部分所有数据
  newOpenUuid, //左侧弹框地址编号
  pageNum = 5, //每页显示的数量
  // pointData,
  CanvasLayer, //canvas图层
  clickPointObj = {}, //最新点击的点
  placeSearch;
map = new AMap.Map("container", {
  resizeEnable: true,
  layers: layers
});

// var key = document.cookie("key");
// console.log(key);
var indexPage = {
  init: function () {
    indexPage.changeMap([]);
    indexPage.queryGetGisAreaName();
    indexPage.listen();
    // indexPage.getGovernance({
    //   orgid: "21"
    // });
    indexPage.years(dataS);
    indexPage.clickColor(numPage);
    indexPage.queryData({
        year: 2018
      },
      layers
    );
    $("#msgWrap").load("view/message.html");
    //拖拽
    config.drag("tableList");
    config.drag("details");
    config.drag("msgWrap");
    config.drag("inspectingDetail");
    config.drag("tableWrap");
    config.drag("toolL");
  },
  listen: function () {
    //查询按钮
    $("#search").on("click", function () {
      $(".status span").removeClass("insetActive");
      areaname = $("#getAreaName option:selected").val();
      years = $("#years option:selected").val();

      warnlevel = "";
      for (let i = 0; i < gradename.length; i++) {
        warnlevel += gradename[i] + ",";
      }
      warnlevel = warnlevel.substring(0, warnlevel.length - 1);
      data = {
        year: years,
        areaid: areaname == "全部" ? "" : areaname,
        warnlevel: warnlevel,
        managestate: "" //所有状态
      };
      indexPage.queryData(data, layers);
    });
    $("#arrL").on("click", function () {
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
    $("#arrR").on("click", function () {
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
    $("#arrCenter").on("click", "a", function () {
      numPage = $(this).html();
      $(this)
        .addClass("activeColor")
        .siblings()
        .removeClass("activeColor");
      indexPage.tableList(jsonData, numPage);
    });
    //点击加载卫星图和普通图
    $("#satellite").on("click", function () {
      $("#search").trigger("click");
      //卫星图
      if (satellite) {
        layers = [];
      } else {
        layers = [new AMap.TileLayer.Satellite()];
      }
      satellite = !satellite;

      setTimeout(function () {
        indexPage.changeMap(layers);
        $("#search").trigger("click");
      }, 300);
    });
    //路径规划
    $(document).on("click", "#goto", function () {
      window.open(
        "https://gaode.com/dir?&to%5Bname%5D=" + $(this).attr("data")
      );
    });
    //点击检索
    $("#retrieval").on("click", function () {
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
    $("#close1").on("click", function () {
      $("#retrievalBox").hide();
      $(".retrieval")
        .removeClass("retrieval-hide")
        .addClass("retrieval-show");
    });

    // 显示图表
    $("#chart").on("click", function () {
      $("#tableList").load("view/table.html");
      if ($("#tableList").css("display") == "none") {
        $("#tableList").show();
      } else {
        $("#tableList").hide();
      }
    });
    //关闭详情
    $(document).on("click", "#close3", function () {
      $("#details").hide();
    });
    //灾害等级
    $(".grade").on("click", "[name='check']", function () {
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
    $("#tbodyHtml").on("click", "tr", function () {
      indexPage.setZoomAndCenter(
        $(this).attr("lon"),
        $(this).attr("lat"),
        $(this).attr("warnlevel"),
        17
      );
    });
    //根据状态筛选
    $(".status").on("click", "span", function () {
      $(this)
        .addClass("insetActive")
        .siblings()
        .removeClass("insetActive");
      areaname = $("#getAreaName option:selected").val();
      warnlevel = "";
      for (let i = 0; i < gradename.length; i++) {
        warnlevel += gradename[i] + ",";
      }
      warnlevel = warnlevel.substring(0, warnlevel.length - 1);
      managestate = $(this).attr("data");
      var data = {
        year: 2018,
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
      // dtype = [];
      areaname = [];
      indexPage.queryData(data, layers);
    });
    //周边详情
    $(document).on("click", ".aroundList", function () {
      // indexPage.showPoint(jsonData, layers);
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
    $(document).on("click", ".close4", function () {
      placeSearch.clear();
      $(".close4").hide();
      $("#panel").hide();
    });
    //巡查
    $(document).on("click", "#inspecting", function () {
      $("#inspectingDetail").show();
    });
    //关闭巡查历史
    $(document).on("click", "#close5", function () {
      $("#inspectingDetail").hide();
    });
    //查询时间筛选
    $(document).on("click", ".detailB", function () {
      historyData.index = $(this).attr("ids");
      indexPage.inspectingHtml(historyData);
    });
    //更多详情
    $(document).on("click", "#openNew", function () {
      var src = filePath.share + "?disasterid=" + newOpenUuid;
      window.open(src);
    });
    $(document).on("click", "#qrcode", function () {
      return false;
    });

    // 搜索
    $(document).on("click", "#searchs", function () {
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
    $("#searchTxt").keyup(function () {
      console.log(allData);
      if (allData) {
        var searchVal = $.trim($("#searchTxt").val());
        var searchResultHtml = "";
        for (let i = 0; i < allData.length; i++) {
          if (allData[i].addressname.indexOf(searchVal) != -1) {
            searchResultHtml += `<li class="sta${+allData[i].warnlevel}"  lon=${
              allData[i].lon
            } lat=${allData[i].lat} managestate=${
              allData[i].warnlevel
            } title="${allData[i].addressname}">${allData[i].addressname}</li>`;
          }
        }
        $("#searchResultHtml").html(searchResultHtml);
        $("#searchResult").show();
      }
    });
    $(document).on("click", "#searchResultHtml > li", function () {
      indexPage.setZoomAndCenter(
        $(this).attr("lon"),
        $(this).attr("lat"),
        $(this).attr("warnlevel"),
        17
      );
      return false;
    });
    $(document).on("click", ".search", function () {
      return false;
    });
    $(document).on("click", function () {
      $("#searchResult").hide();
    });
    $(document).on("click", "#message", function () {
      $("#msgWrap").load("view/message.html");
      if ($("#msgWrap").css("display") == "none") {
        $("#msgWrap").show();
      } else if ($("#msgWrap").css("display") == "block") {
        $("#msgWrap").hide();
      }
    });
    var marginLeft = 0;
    $(document).on("click", ".imgVideoNext", function () {
      console.log(marginLeft);
      if ($(this).attr("next") === "0") {
        if (marginLeft < 0) {
          marginLeft += 140;
        }
      } else if ($(this).attr("next") === "1") {
        if (marginLeft > (imgVideoWArr.length - 3) * -140) {
          marginLeft -= 140;
        }
      }
      $("#imgVideo_center > ul").css("marginLeft", marginLeft);
    });
    //点击预览
    $(document).on("click", "#imgVideo_center > ul > li", function () {
      indexImgVideo = $(this).attr("num");
      $(".mask-wrap").show();
      if (imgVideoWArr[$(this).attr("num")].fileType === "1") {
        var mask_imgVideo_HTML = `<div id="leftArr" class="leftArr arr" next = "0">
            <img src="./img/prev.png" alt="">
        </div>
        <div class="rightArr arr" next = 1>
            <img src="./img/next.png" alt="">
        </div>
        <div class="center" id="center">
            <img src="${
              imgVideoWArr[$(this).attr("num")].url_path
            }" onerror=src="./img/loading.gif" />
        </div>`;
      } else if (imgVideoWArr[$(this).attr("num")].fileType === "2") {
        var mask_imgVideo_HTML = `<div id="leftArr" class="leftArr arr" next = 0>
            <img src="./img/prev.png" alt="">
              </div>
              <div class="rightArr arr" next = 1>
                      <img src="./img/next.png" alt="">
                  </div>
              <div id="center" class="center" >
              <video controls="controls" muted pause="" width="100%" src="${
                imgVideoWArr[$(this).attr("num")].url_path
              }" class="pause">暂无视频</video>
        </div>`;
      }

      $("#mask_imgVideo").html(mask_imgVideo_HTML);
    });
    $(document).on("click", ".mask-wrap", function () {
      $(".mask-wrap").hide();
    });
    $(document).on("click", "#mask_imgVideo", function () {
      return false;
    });
    $(document).on("click", "#mask_imgVideo > .arr", function () {
      if ($(this).attr("next") === "0") {
        if (indexImgVideo > 0) {
          indexImgVideo--;
        }
      } else if (indexImgVideo < imgVideoWArr.length - 1) {
        indexImgVideo++;
      } else {
        return;
      }
      if (imgVideoWArr[indexImgVideo].fileType === "1") {
        var centerHTML = `<img src="${
          imgVideoWArr[indexImgVideo].url_path
        }"  onerror=src="./img/loading.gif" />`;
        $("#center").html(centerHTML);
      } else if (imgVideoWArr[indexImgVideo].fileType === "2") {
        var centerHTML = `<video controls="controls" muted pause="" width="100%" src="${
          imgVideoWArr[indexImgVideo].url_path
        }" class="pause">暂无视频</video>`;
        $("#center").html(centerHTML);
      }
    });
    //巡查记录图片视频
    var detail_marginLeft = 0;
    $(document).on("click", ".detailArr", function () {
      console.log(detail_imgVideoArr);
      if ($(this).attr("next") === "0") {
        if (detail_marginLeft < 0) {
          detail_marginLeft += 146;
        }
      } else if ($(this).attr("next") === "1") {
        if (detail_marginLeft > (detail_imgVideoArr.length - 3) * -146) {
          detail_marginLeft -= 146;
        }
      }
      $(".imgArrDetailCenter > ul").css("marginLeft", detail_marginLeft);
    });
    //巡查记录点击预览

    $(document).on("click", "#imgArrDetailCenter > ul > li", function () {
      indexImgVideo = $(this).attr("num");
      $(".mask-wrap").show();
      // console.log(detail_imgVideoArr);
      if (detail_imgVideoArr[$(this).attr("num")].filetype === "1") {
        var mask_detialImgVideo_HTML = `<div id="leftArr" class="leftArr detialArr" next = "0">
            <img src="./img/prev.png" alt="">
        </div>
        <div class="rightArr detialArr" next = 1>
            <img src="./img/next.png" alt="">
        </div>
        <div class="center" id="center">
            <img src="${
              detail_imgVideoArr[$(this).attr("num")].url_path
            }" onerror=src="./img/loading.gif" />
        </div>`;
      } else if (detail_imgVideoArr[$(this).attr("num")].filetype === "2") {
        var mask_detialImgVideo_HTML = `<div id="leftArr" class="leftArr detialArr" next = 0>
            <img src="./img/prev.png" alt="">
              </div>
              <div class="rightArr detialArr" next = 1>
                      <img src="./img/next.png" alt="">
                  </div>
              <div id="center" class="center" >
              <video controls="controls" muted pause="" width="100%" src="${
                detail_imgVideoArr[$(this).attr("num")].url_path
              }" class="pause">暂无视频</video>
        </div>`;
      }

      $("#mask_imgVideo").html(mask_detialImgVideo_HTML);
    });
    $(document).on("click", "#mask_imgVideo > .detialArr", function () {
      if ($(this).attr("next") === "0") {
        if (indexImgVideo > 0) {
          indexImgVideo--;
        }
      } else if (indexImgVideo < detail_imgVideoArr.length - 1) {
        indexImgVideo++;
      } else {
        return;
      }
      if (detail_imgVideoArr[indexImgVideo].filetype === "1") {
        var centerHTML = `<img src="${
          detail_imgVideoArr[indexImgVideo].url_path
        }" />`;
        $("#center").html(centerHTML);
      } else if (detail_imgVideoArr[indexImgVideo].filetype === "2") {
        var centerHTML = `<video controls="controls" muted pause="" width="100%" src="${
          detail_imgVideoArr[indexImgVideo].url_path
        }" class="pause">暂无视频</video>`;
        $("#center").html(centerHTML);
      }
    });
    //关闭表单页面
    $(document).on("click", ".closeTable", function () {
      $("#tableWrap").hide();
    });
    // 快捷;
    $(document).on("click", ".tools", function () {
      indexPage.toolsShow($(this).attr("ids"));
    });
    $(document).on("click", "#close7", function () {
      $("#toolL").hide();
    });
    if ($("#retrievalBox").height() < 500) {
      pageNum = 3; //每页显示的数量
    }
  },
  changeMap: function (layers) {
    map = new AMap.Map("container", {
      resizeEnable: true,
      zoom: 16,
      layers: layers
    });
  },
  //根据条件查询数据
  queryData: function (dataS, layers) {
    $.ajax({
      type: "POST",
      url: fileUrl.header88 + "/light/mobile/gisshow/GetGisHiddendata",
      dataType: "json",
      data: dataS,
      beforeSend: function (XMLHttpRequest) {
        $("#search").val("正在查询。。。");
      },
      success: function (data) {
        $("#search").val("查询成功！！！");
        setTimeout(function () {
          $("#search").val("查询");
        }, 1000);
        if (data.success === true) {
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
  queryGetGisAreaName: function () {
    $.ajax({
      type: "GET",
      url: fileUrl.header98 + "/dfbinterface/mobile/gisshow/GetGisAreaname", //后台接口地址
      dataType: "jsonp",
      jsonp: "callback",
      success: function (data) {
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
  years: function () {
    var mydate = new Date();
    year = mydate.getFullYear();
    dataS.years = year;
    var yearsHtml = `<option value="${year}">${year}</option>`;
    for (var i = 0; i < 10; i++) {
      year--;
      yearsHtml += "<option value='" + year + "'>" + year + "</option>";
    }
    $("#years").html(yearsHtml);
  },
  //分页
  paging: function (num) {
    var numpage = "";
    numPageS = Math.ceil(num / pageNum);
    numpage += "<a class='activeColor'>" + 1 + "</a>";
    var pages =
      Math.ceil(num / pageNum) + 1 > 15 ? 10 : Math.ceil(num / pageNum) + 1;
    for (let i = 2; i < pages; i++) {
      numpage += "<a>" + i + "</a>";
    }
    $("#arrCenter").html(numpage);
  },

  //查询列表warnlevel
  tableList: function (data, numPage) {
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
        " warnlevel=" +
        data[i].warnlevel +
        " title=" +
        (data[i].addressname ? data[i].addressname : "") +
        "><td>" +
        data[i].addressname +
        "</td><td class=status" +
        data[i].warnlevel +
        ">" +
        config.warnlevels(data[i].warnlevel) +
        "</td></tr>";
    }
    $("#tbodyHtml").html(tbodyHtml);
  },
  clickColor: function (numPage) {
    $("#arrCenter")
      .find("a")
      .eq(numPage)
      .addClass("activeColor");
  },
  // 地图上显示点
  showPoint: function (data) {
    console.log(map.getZoom());
    if (map.getZoom() > 14) {
      var showMarkerContent = true;
    } else if (map.getZoom() <= 14) {
      var showMarkerContent = false;
    }
    var tData = "";
    map.remove(markerL);
    markerL = [];
    for (var i = 0, markerl; i < data.length; i++) {
      var icon = "";
      if (data[i].warnlevel == 1 || data[i].warnlevel == 2) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "img/led_red.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].warnlevel == 3 || data[i].warnlevel == 4) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "img/led_orange.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      var markerl = new AMap.Marker({
        position: [data[i].lon, data[i].lat],
        map: window.map,
        icon: icon
      });
      var tData = data[i];
      markerl.content = tData;
      markerl.on("click", markerClick);
      markerL.push(markerl);
    }
    AMap.event.addListener(map, "zoomend", function () {
      indexPage.sizeZoom(map.getZoom(), clickPointObj);
      if (map.getZoom() > 14) {
        if (!showMarkerContent) {
          map.remove(markerL);
          markerL = [];
          for (var i = 0, markerl; i < data.length; i++) {
            var icon = "";
            if (data[i].warnlevel == 1 || data[i].warnlevel == 2) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_red.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            if (data[i].warnlevel == 3 || data[i].warnlevel == 4) {
              icon = new AMap.Icon({
                size: new AMap.Size(40, 50), //图标大小
                image: "img/led_orange.png",
                imageOffset: new AMap.Pixel(0, 0)
              });
            }
            var markerl = new AMap.Marker({
              position: [data[i].lon, data[i].lat],
              map: window.map,
              icon: icon
            });
            var tData = data[i];
            markerl.content = tData;
            markerl.on("click", markerClick);
            markerl.setLabel({
              offset: new AMap.Pixel(0, 0), //修改label相对于maker的位置
              content: tData.addressname
            });
            markerL.push(markerl);
          }
          showMarkerContent = true;
        }
      } else {
        if (map.getZoom() <= 14) {
          if (showMarkerContent) {
            map.remove(markerL);
            markerL = [];
            for (var i = 0, markerl; i < data.length; i++) {
              var icon = "";
              if (data[i].warnlevel == 1 || data[i].warnlevel == 2) {
                icon = new AMap.Icon({
                  size: new AMap.Size(40, 50), //图标大小
                  image: "img/led_red.png",
                  imageOffset: new AMap.Pixel(0, 0)
                });
              }
              if (data[i].warnlevel == 3 || data[i].warnlevel == 4) {
                icon = new AMap.Icon({
                  size: new AMap.Size(40, 50), //图标大小
                  image: "img/led_orange.png",
                  imageOffset: new AMap.Pixel(0, 0)
                });
              }
              var markerl = new AMap.Marker({
                position: [data[i].lon, data[i].lat],
                map: window.map,
                icon: icon
              });
              var tData = data[i];
              markerl.content = tData;
              markerl.on("click", markerClick);
              markerl.setLabel({
                offset: new AMap.Pixel(-100, -20), //修改label相对于maker的位置
                content: ""
              });
              markerL.push(markerl);
            }
            showMarkerContent = false;
          }
        }
      }
    });

    function markerClick(e) {
      var etc = e.target.content;
      console.log(etc);
      clickPointObj = {
        lon: etc.lon,
        lat: etc.lat,
        size: "",
        color: config.warnlevel(etc.warnlevel)
      };
      indexPage.sizeZoom(map.getZoom(), clickPointObj);

      indexPage.detailsSpot(etc);
      indexPage.inspecting(etc);
      // indexPage.clickPoint(clickPointObj);
    }
    map.setFitView();
  },
  // 转移视觉目标
  setZoomAndCenter: function (lon, lat, warnlevel, lever) {
    clickPointObj = {
      lon: parseFloat(lon),
      lat: parseFloat(lat),
      size: "",
      color: config.warnlevel(warnlevel)
    };
    indexPage.sizeZoom(map.getZoom(), clickPointObj);
    map.setZoomAndCenter(lever, [lon, lat]);
  },
  sizeZoom: function (ziseZoom, clickPointObj) {
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
  // clickPoint: function (clickPointObj) {
  //   try {
  //     CanvasLayer.hide();
  //   } catch (error) {}
  //   try {
  //     indexPage.addDraw(
  //       clickPointObj.lon,
  //       clickPointObj.lat,
  //       clickPointObj.size,
  //       clickPointObj.color
  //     );
  //   } catch (error) {}
  // },
  // 增加图层
  addDraw: function (lon, lat, size, color) {
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = 200;
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    context.strokeStyle = "white";
    context.globalAlpha = 1;
    context.lineWidth = 2;
    var radious = 0;
    var draw = function (argument) {
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
  detailsSpot: function (etc) {
    var data = {
      uuid: etc.uuid
    };
    $.ajax({
      type: "GET",
      url: fileUrl.header98 + "/dfbinterface/mobile/gisshow/GetSingleHidden", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function (data) {
        if (data.success == "0") {
          indexPage.detailsSpotHtml(etc, data.result);
        }
      }
    });
  },
  //巡查详情
  inspecting: function (etc) {
    $.ajax({
      type: "POST",
      url: fileUrl.header88 + "/light/inspect/mobile/GetSingleInspect", //后台接口地址
      dataType: "json",
      data: {
        uuid: etc.uuid
      },
      success: function (data) {
        if (data.success == true) {
          historyData = {
            data: data.result,
            etc: etc,
            index: data.result.length - 1
          };
          indexPage.inspectingHtml(historyData);
        }
      },
      error: function (err) {
        console.log(err);
      }
    });
  },
  inspectingHtml: function (historyData) {
    var inspectingDetailHtml = "";
    if (historyData.data.length != 0) {
      var activeData = historyData.data[historyData.index];
      var detail_time = "";
      for (let i = historyData.data.length - 1; i >= 0; i--) {
        detail_time += ` <input class="detailB detailB${i}" ids="${i}" type="button" value="${
          historyData.data[i].check_datetime
        }">`;
      }
      var detail_imgArr = [];
      var detail_videoArr = [];
      detail_imgVideoArr = [];
      for (let i = 1; i < activeData.attach.length; i++) {
        if (activeData.attach[i].filetype === "1") {
          detail_imgArr.push({
            url_path: activeData.attach[i].url_path,
            filetype: activeData.attach[i].filetype
          });
        } else if (activeData.attach[i].filetype === "2") {
          detail_videoArr.push({
            url_path: activeData.attach[i].url_path,
            filetype: activeData.attach[i].filetype
          });
        }
      }
      detail_imgVideoArr = detail_imgArr.concat(detail_videoArr);
      console.log(detail_imgVideoArr);
      detail_imgVideoArrHTML = "";
      for (let i = 0; i < detail_imgVideoArr.length; i++) {
        if (detail_imgVideoArr[i].filetype === "1") {
          detail_imgVideoArrHTML += `<li num="${i}" filetype="1"><img onerror=src="./img/loading.gif" alt="暂无图片" src = ${
            detail_imgVideoArr[i].url_path
          } /></li>`;
        } else if (detail_imgVideoArr[i].filetype === "2") {
          detail_imgVideoArrHTML += `<li num="${i}" filetype="2"><video src = ${
            detail_imgVideoArr[i].url_path
          } ></video></li>`;
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
          <p>巡查图片、视频</p>
          <div id="detailImg" class="detailImg">
              <div class="imgArrDetailLeft detailArr" next="0"><img src="./img/graypre.png" /></div>
              <div class="imgArrDetailRight detailArr" next="1"><img src="./img/graynext.png" /></div>
              <div id="imgArrDetailCenter" class="imgArrDetailCenter">
                <ul>
                  ${detail_imgVideoArrHTML}
                </ul>
              </div>
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
      $(".imgArrDetailCenter > ul").css({
        width: detail_imgVideoArr.length * 146 + "px",
        "min-width": "438px"
      });
      if (detail_imgVideoArr.length <= 3) {
        $(".detailArr").hide();
      }
      if (detail_imgVideoArr.length == 0) {
        $("#imgVideo_center")
          .html("暂无图片或视频")
          .css({
            "line-height": "50px",
            "font-size": "14px",
            color: "#666666"
          });
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
  walkings: function (walkingStart, walkingEnd) {
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
  detailsSpotHtml: function (etc, data) {
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
      success: function (data) {
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
    var imgHTML = "";
    var videoHTML = "";
    var imgArrW = [];
    var videoArrW = [];
    var imgVideoHTML = "";
    for (let i = 0; i < data.attachList.length; i++) {
      console.log(data.attachList[i].filetype);
      if (data.attachList[i].filetype === "1") {
        imgArrW.push({
          fileType: "1",
          url_path: data.attachList[i].url_path
        });
      } else if (data.attachList[i].filetype === "2") {
        videoArrW.push({
          fileType: "2",
          url_path: data.attachList[i].url_path
        });
      }
    }
    imgVideoWArr = imgArrW.concat(videoArrW);
    console.log(imgVideoWArr);
    for (let i = 0; i < imgVideoWArr.length; i++) {
      if (imgVideoWArr[i].fileType === "1") {
        imgVideoHTML += `<li num="${i}" fileType="1"><img onerror=src="./img/loading.gif" alt="暂无图片" src = ${
          imgVideoWArr[i].url_path
        } /></li>`;
      } else if (imgVideoWArr[i].fileType === "2") {
        imgVideoHTML += `<li num="${i}" fileType="2"><video src = ${
          imgVideoWArr[i].url_path
        } ></video></li>`;
      }
    }
    var detailsHtml = `<div class="details-header">
    <span title=${data.fzsite.secondname}>${isKong(
      data.fzsite.secondname
    )}</span>
    <span>(编号：${isKong(data.fzsite.id)})</span>
    <span id="close3"><img src="img/close.png" alt=""></span>
</div>
<div class="details-content">
    <div class="address"  title="${isKong(data.fzsite.addressname)}">
        <span class="lt">灾情地址：</span>
        <span><img id='goto' data=${
          data.fzsite.addressname
        } src="img/goto.png" alt=""></span>
        <span class="rt">${isKong(data.fzsite.addressname)}</span>
    </div>
    <p class="quyujiedao rt">所属区（街道）：${isKong(
      data.fzsite.areaname
    )}${isKong(data.fzsite.street)}<p>
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
            <span class="rt">${isKong(data.fzsite.manager)}</span>
        </p>
        <p>
            <span class="lt">联系电话</span>
            <span class="rt">${isKong(data.fzsite.managertel)}</span>
        </p>
        <p>
            <span class="lt">上报时间</span>
            <span class="rt">${config.formatDate(data.fzsite.createtime)}</span>
        </p>
        <p>
            <span class="lt">灾情状况</span>
            <span class="rt">${isKong(data.fzsite.remark)}</span>
        </p>
    </div>
    <div class="imgVideo">
        <p>现场照片、视频</p>
        <div id="imgVideo_left" class="imgVideo-left imgVideoNext" next="0"></div>
        <div id="imgVideo_right" class="imgVideo-right imgVideoNext" next="1"></div>
        <div id="imgVideo_center" class="imgVideo-center">
          <ul>
            ${imgVideoHTML}
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
    <p>周边详情</p>
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
    $("#imgVideo_center > ul").css({
      width: imgVideoWArr.length * 140,
      "min-width": "438px"
    });
    if (imgVideoWArr.length <= 3) {
      $(".imgVideoNext").hide();
    }
    if (imgVideoWArr.length == 0) {
      $("#imgVideo_center")
        .html("暂无图片或视频")
        .css({
          "line-height": "50px",
          "font-size": "14px",
          color: "#666666"
        });
    }
    $("#details").show();
  },
  //周围信息
  around: function (lat, lon, name) {
    if (placeSearch === undefined) {} else {
      placeSearch.clear();
    }
    AMap.service(["AMap.PlaceSearch"], function () {
      placeSearch = new AMap.PlaceSearch({
        //构造地点查询类
        pageSize: 3,
        type: name,
        pageIndex: 1,
        map: map,
        panel: "panel"
      });
      var cpoint = [lon, lat]; //中心点坐标
      placeSearch.searchNearBy("", cpoint, 500, function (status, result) {});
    });
  },

  toolsShow: function (tools) {
    console.log(tools);
    var toolsUrl;
    if (tools === "yjzjk") {
      $("#toolsTitle").html("应急专家");
      var toolsUrl =
        fileUrl.header88 + "/light/expertuser/GetExpert";
    }
    if (tools === "qxdw") {
      $("#toolsTitle").html("抢险队伍");
      toolsUrl =
        fileUrl.header88 + "/light/disasterteam/GetDisasterteam";
    }
    if (tools === "qxgj") {
      $("#toolsTitle").html("抢险工具");
      toolsUrl =
        fileUrl.header88 + "/light/disastertool/GetDisastertool";
    }
    $.ajax({
      type: "GET",
      url: toolsUrl,
      dataType: "json",
      success: function (data) {
        console.log(data);
        if (data.success === "0" && tools === "yjzjk") {
          indexPage.yjzjk(data.result);
        } else if (data.success === "0" && tools === "qxdw") {
          indexPage.qxdw(data.result);
        } else if (data.success === "0" && tools === "qxgj") {
          indexPage.qxgj(data.result);
        }
        $("#toolL").show();
      },
      error: function (err) {
        console.log(err);
      }
    });
  },
  yjzjk: function (data) {
    console.log(data);
    var toolsHTML = `<thead><tr><th>姓名</th><th>单位</th><th>手机号</th><th>邮箱</th></tr></thead>`;
    toolsHTML += `<tbody>`;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].child.length; j++) {
        toolsHTML += `<tr><td>${data[i].child[j].username}</td>
        <td>${data[i].child[j].department}</td>
        <td>${data[i].child[j].phone}</td>
        <td>${data[i].child[j].email}</td>`;
      }
    }
    toolsHTML += `</tbody>`;
    $("#toolsHTML").html(toolsHTML);
  },
  qxdw: function (data) {
    var toolsHTML = `<thead><tr><th>单位</th><th>联系人</th><th>联系电话</th></tr></thead>`;
    toolsHTML += `<tbody>`;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].child.length; j++) {
        toolsHTML += `<tr><td>${data[i].child[j].department}</td>
        <td>${data[i].child[j].manager}</td>
        <td>${data[i].child[j].department}</td>`;
      }
    }
    toolsHTML += `</tbody>`;
    $("#toolsHTML").html(toolsHTML);
  },
  qxgj: function (data) {
    console.log(data);
    var toolsHTML = `<thead><tr><th>抢险工具名称</th><th>工具数量</th><th>所属单位</th><th>联系人</th><th>联系电话</th></tr></thead>`;
    toolsHTML += `<tbody>`;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].child.length; j++) {
        toolsHTML += `<tr><td>${data[i].child[j].toolname}</td>
        <td>${data[i].child[j].count}</td>
        <td>${data[i].child[j].department}</td>
        <td>${data[i].child[j].manager}</td>
        <td>${data[i].child[j].managertel}</td></tr>`;
      }
    }
    toolsHTML += `</tbody>`;
    $("#toolsHTML").html(toolsHTML);
  }
};
indexPage.init();