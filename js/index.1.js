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
  areaname = [];
var header = "http://14.116.184.77:8098";
// var header = "http://192.168.1.240:8080";




function changeMap(layers) {
  map = new AMap.Map("container", {
    resizeEnable: true,
    zoom: 12,
    layers: layers
  });
}
changeMap("");
//高德地图测距
// function ranging(window) {
//   map.plugin(["AMap.RangingTool"], function() {
//     ruler1 = new AMap.RangingTool(map);
//     AMap.event.addListener(ruler1, "end", function(e) {
//       ruler1.turnOff();
//     });
//     var sMarker = {
//       icon: new AMap.Icon({
//         size: new AMap.Size(19, 31), //图标大小
//         image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b1.png"
//       })
//     };
//     var eMarker = {
//       icon: new AMap.Icon({
//         size: new AMap.Size(19, 31), //图标大小
//         image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b2.png"
//       }),
//       offset: new AMap.Pixel(-9, -31)
//     };
//     var lOptions = {
//       strokeStyle: "solid",
//       strokeColor: "#FF33FF",
//       strokeOpacity: 1,
//       strokeWeight: 2
//     };
//     var rulerOptions = {
//       startMarkerOptions: sMarker,
//       endMarkerOptions: eMarker,
//       lineOptions: lOptions
//     };
//     ruler2 = new AMap.RangingTool(map, rulerOptions);
//   });
//   //启用默认样式测距
//   function startRuler1() {
//     ruler2.turnOff();
//     ruler1.turnOn();
//   }
//   //启用自定义样式测距
//   function startRuler2() {
//     ruler1.turnOff();
//     ruler2.turnOn();
//   }
//   return (window.startRuler = startRuler1);
// }
//根据条件查询数据
function queryData(data, layers) {
  $.ajax({
    type: "GET",
    url: header + "/dfbinterface/mobile/gisshow/GetGisDisasterdata", //后台接口地址
    dataType: "jsonp",
    data: data,
    jsonp: "callback",
    success: function(data) {
      if (data.success === "0") {
        jsonData = data.result;
        numPage = 1; //重置为第一页
        paging(data.result.length);
        tableList(jsonData, numPage);
        showPoint(data.result, layers);
      }
    }
  });
}
// 获取所在区域
function queryGetGisAreaName() {
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
}
queryGetGisAreaName();

//分页
function paging(num) {
  var numpage = "";
  numPageS = Math.ceil(num / 5);
  for (let i = 1; i < Math.ceil(num / 5) + 1; i++) {
    numpage += "<a>" + i + "</a>";
  }
  $("#arrCenter").html(numpage);
}
//状态
function status(key) {
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
}
//查询按钮
$("#search").on("click", function() {
  areaname = $("#getAreaName option:selected").val();
  console.log(dtype);

  if (dtype.length == 0 || dtype.length == 2) {
    var dtypes = "";
  } else {
    var dtypes = dtype[0];
  }
  var warnlevel = "";
  for (let i = 0; i < gradename.length; i++) {
    warnlevel += gradename[i] + ",";
  }
  warnlevel = warnlevel.substring(0, warnlevel.length - 1);
  var data = {
    dtype: dtypes,
    areaid: areaname == "全部" ? "" : areaname,
    warnlevel: warnlevel
  };
  console.log(data);
  queryData(data, layers);
});
//查询列表warnlevel
function tableList(data, numPage) {
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
      status(data[i].managestate) +
      "</td></tr>";
  }
  $("#tbodyHtml").html(tbodyHtml);
  //治理状况统计
}
function getGovernance(data) {
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
}
getGovernance("");

$("#arrL").on("click", function() {
  if (numPage > 1) {
    numPage--;
    tableList(jsonData, numPage);
  }
});
$("#arrR").on("click", function() {
  if (numPage < numPageS) {
    numPage++;
    tableList(jsonData, numPage);
  }
});
$("#arrCenter").on("click", "a", function() {
  numPage = $(this).html();
  tableList(jsonData, numPage);
});
function clickColor(numPage) {
  console.log(numPage);
  $("#arrCenter")
    .find("a")
    .eq(numPage)
    .addClass("activeColor");
}
clickColor(numPage);
queryData("", layers);
//跳转到高德
function goto(StartingPoint, endPoint) {
  window.open(
    "https://gaode.com/dir?&from%5Bname%5D=" +
      StartingPoint +
      "&to%5Bname%5D=" +
      endPoint
  );
}
map = new AMap.Map("container", { resizeEnable: true, layers: layers });

// 地图上显示点
function showPoint(data) {
  //初始化地图对象，加载地图
  infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
  map.clearMap(); // 清除地图覆盖物
  for (var i = 0, marker; i < data.length; i++) {
    console.log(data[i]);
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
      "<a class='goto' style='color:blue;' data=" +
      data[i].addressname +
      ">[去这里]</a></p>" +
      "<p>状况：<a>" +
      data[i].remark +
      "</a></p>" +
      "<p>状态：<a class=status" +
      data[i].managestate +
      ">" +
      status(data[i].managestate) +
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
// var citysearch = new AMap.CitySearch();

// ranging(window);

//点击加载卫星图和普通图
$("#satellite").on("click", function() {
  //卫星图
  if (satellite) {
    layers = "";
  } else {
    layers = [new AMap.TileLayer.Satellite()];
  }
  satellite = !satellite;
  changeMap(layers);
});
$("#rangefinder").on("click", function() {
  // ranging(window);
  startRuler();
});
//路径规划
$(document).on("click", ".goto", function() {
  goto("珠光创新科技园", $(this).attr("data"));
});
//点击检索
$("#retrieval").on("click", function() {
  $("#retrievalBox").show();
  $(".retrieval")
    .addClass("retrieval-hide")
    .removeClass("retrieval-show");
  queryData("", layers);
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
function clearMark(positions) {
  // [[116.405467, 39.907761], [116.415467, 39.907761], [116.415467, 39.917761], [116.425467, 39.907761], [116.385467, 39.907761]]
  var markers = [],
    positions = positions;
  for (var i = 0, marker; i < positions.length; i++) {
    marker = new AMap.Marker({
      map: map,
      position: positions[i]
    });
    markers.push(marker);
  }
}

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
    console.log(data);
    console.log(
      "由于Chrome、IOS10等已不再支持非安全域的浏览器定位请求，为保证定位成功率和精度，请尽快升级您的站点到HTTPS。"
    );
  }
});
