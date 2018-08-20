var StartingPoint = "",
  endPoint = "",
  layers = [new AMap.TileLayer.Satellite()],
  map,
  ruler1,
  ruler2,
  infoWindow,
  satellite = true,
  jsonData,
  numPage = 1,
  numPageS,
  dtype = [],
  gradename = [],
  areaname = [],
  dtypes = "", //灾情
  warnlevel = ""; //等级
map = new AMap.Map("container", { resizeEnable: true, layers: layers });

var header = "http://14.116.184.77:8098";
// var header = "http://192.168.1.240:8080";

var indexPage = {
  init: function() {
    indexPage.changeMap([new AMap.TileLayer.Satellite()]);
    indexPage.queryGetGisAreaName();
    indexPage.listen();
    indexPage.getGovernance("");
    indexPage.clickColor(numPage);
    indexPage.queryData("", layers);
  },
  listen: function() {
    //查询按钮
    $("#search").on("click", function() {
      areaname = $("#getAreaName option:selected").val();
      if (dtype.length == 0 || dtype.length == 2) {
        dtypes = "";
      } else {
        dtypes = dtype[0];
      }

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
      console.log(data, layers);
      indexPage.queryData(data, layers);
    });
    $("#arrL").on("click", function() {
      if (numPage > 1) {
        numPage--;
        indexPage.tableList(jsonData, numPage);
      }
    });
    $("#arrR").on("click", function() {
      if (numPage < numPageS) {
        numPage++;
        indexPage.tableList(jsonData, numPage);
      }
    });
    $("#arrCenter").on("click", "a", function() {
      numPage = $(this).html();
      indexPage.tableList(jsonData, numPage);
    });
    //点击加载卫星图和普通图
    $("#satellite").on("click", function() {
      console.log(satellite);
      //卫星图
      if (satellite) {
        layers = "";
      } else {
        layers = [new AMap.TileLayer.Satellite()];
      }
      satellite = !satellite;
      indexPage.changeMap(layers);
      indexPage.queryData("", layers);
    });
    // $("#rangefinder").on("click", function() {
    //   startRuler();
    // });
    //路径规划
    $(document).on("click", ".goto", function() {
      indexPage.goto("珠光创新科技园", $(this).attr("data"));
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
      // indexPage.queryData("", layers);
    });
    //关闭检索
    $("#close").on("click", function() {
      $("#retrievalBox").hide();
      $(".retrieval")
        .removeClass("retrieval-hide")
        .addClass("retrieval-show");
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
      map.setZoomAndCenter(16, [$(this).attr("lon"), $(this).attr("lat")]);
    });
    //根据状态筛选
    $(".status").on("click", "span", function() {
      areaname = $("#getAreaName option:selected").val();
      if (dtype.length == 0 || dtype.length == 2) {
        dtypes = "";
      } else {
        dtypes = dtype[0];
      }

      for (let i = 0; i < gradename.length; i++) {
        warnlevel += gradename[i] + ",";
      }
      warnlevel = warnlevel.substring(0, warnlevel.length - 1);
      console.log($(this).attr("data"));
      managestate = $(this).attr("data");
      var data = {
        dtype: dtypes,
        areaid: areaname == "全部" ? "" : areaname,
        warnlevel: warnlevel,
        managestate: managestate
      };
      indexPage.queryData(data, layers);
    });
  },
  changeMap: function(layers) {
    map = new AMap.Map("container", {
      resizeEnable: true,
      zoom: 12,
      layers: layers
    });
  },
  //根据条件查询数据
  queryData: function(data, layers) {
    $.ajax({
      type: "GET",
      url: header + "/dfbinterface/mobile/gisshow/GetGisDisasterdata", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        console.log(data);
        if (data.success === "0") {
          jsonData = data.result;
          numPage = 1; //重置为第一页
          indexPage.paging(data.result.length);
          indexPage.tableList(jsonData, numPage);
          indexPage.showPoint(data.result, layers);
        }
      }
    });
  },
  // 获取所在区域
  queryGetGisAreaName: function() {
    $.ajax({
      type: "GET",
      url: header + "/dfbinterface/mobile/gisshow/GetGisAreaname", //后台接口地址
      dataType: "jsonp",
      jsonp: "callback",
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
    numPageS = Math.ceil(num / 5);
    for (let i = 1; i < Math.ceil(num / 5) + 1; i++) {
      numpage += "<a>" + i + "</a>";
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
    console.log(numPage);
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
    //初始化地图对象，加载地图
    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
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
          image: "../img/led_orange.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      if (data[i].managestate == 3) {
        icon = new AMap.Icon({
          size: new AMap.Size(40, 50), //图标大小
          image: "../img/led_red.png",
          imageOffset: new AMap.Pixel(0, 0)
        });
      }
      var marker = new AMap.Marker({
        position: [data[i].lon, data[i].lat],
        map: window.map,
        icon: icon
      });
      var contentHtml =
        "<div class='ProjectileFrame'>" +
        "<p>经度：<a>" +
        data[i].lon +
        "</a></p>" +
        "<p>纬度：<a>" +
        data[i].lat +
        "</a></p>" +
        "<p>巡查地址：" +
        data[i].addressname +
        "<a class='goto'data=" +
        data[i].addressname +
        ">[去这里]</a></p>" +
        "<p>状况：<a>" +
        data[i].remark +
        "</a></p>" +
        "<p>状态：<a class=status" +
        data[i].managestate +
        ">" +
        indexPage.status(data[i].managestate) +
        "</a></p>" +
        "</div>";
      marker.content = contentHtml;
      marker.on("click", markerClick);
      // marker.emit("click", { target: marker });
    }
    function markerClick(e) {
      infoWindow.setContent(e.target.content);
      infoWindow.open(map, e.target.getPosition());
    }
    map.setFitView();
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
      console.log(data.position.lat);
      console.log(data.position.lng);
    }
  }

  function onError(data) {
    // 定位出错
    console.log(
      "由于Chrome、IOS10等已不再支持非安全域的浏览器定位请求，为保证定位成功率和精度，请尽快升级您的站点到HTTPS。"
    );
  }
});
