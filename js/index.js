var StartingPoint = "",
  endPoint = "",
  layers = [new AMap.TileLayer.Satellite()],
  map,
  ruler1,
  ruler2,
  infoWindow,
  satellite = true;

function changeMap(layers) {
  map = new AMap.Map("container", {
    resizeEnable: true,
    zoom: 12,
    layers: layers
  });
}
changeMap("");
//高德地图测距
function ranging(window) {
  map.plugin(["AMap.RangingTool"], function() {
    ruler1 = new AMap.RangingTool(map);
    AMap.event.addListener(ruler1, "end", function(e) {
      ruler1.turnOff();
    });
    var sMarker = {
      icon: new AMap.Icon({
        size: new AMap.Size(19, 31), //图标大小
        image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b1.png"
      })
    };
    var eMarker = {
      icon: new AMap.Icon({
        size: new AMap.Size(19, 31), //图标大小
        image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b2.png"
      }),
      offset: new AMap.Pixel(-9, -31)
    };
    var lOptions = {
      strokeStyle: "solid",
      strokeColor: "#FF33FF",
      strokeOpacity: 1,
      strokeWeight: 2
    };
    var rulerOptions = {
      startMarkerOptions: sMarker,
      endMarkerOptions: eMarker,
      lineOptions: lOptions
    };
    ruler2 = new AMap.RangingTool(map, rulerOptions);
  });
  //启用默认样式测距
  function startRuler1() {
    ruler2.turnOff();
    ruler1.turnOn();
  }
  //启用自定义样式测距
  function startRuler2() {
    ruler1.turnOff();
    ruler2.turnOn();
  }
  return (window.startRuler = startRuler1);
}

function queryData(data, layers) {
  $.ajax({
    type: "GET",
    url:
      "http://14.116.184.77:8098/dfbinterface/mobile/gisshow/GetGisDisasterdata", //后台接口地址
    dataType: "jsonp",
    data: data,
    jsonp: "callback",
    success: function(data) {
      if (data.success === "0") {
        showPoint(data.result, layers);
      }
    }
  });
}
function goto(StartingPoint, endPoint) {
  window.open(
    "https://gaode.com/dir?&from%5Bname%5D=" +
      StartingPoint +
      "&to%5Bname%5D=" +
      endPoint
  );
}
map = new AMap.Map("container", { resizeEnable: true, layers: layers });
function showPoint(data) {
  //初始化地图对象，加载地图
  infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });
  for (var i = 0, marker; i < data.length; i++) {
    var marker = new AMap.Marker({
      position: [data[i].lon, data[i].lat],
      map: window.map
    });
    var contentHtml =
      "<div>" +
      "<p>经度：" +
      data[i].lon +
      "</p>" +
      "<p>纬度：" +
      data[i].lat +
      "</p>" +
      "<p>巡查地址：" +
      data[i].addressname +
      "<a class='goto' style='color:blue;' data=" +
      data[i].addressname +
      ">[去这里]</a></p>" +
      "<p>状况：" +
      data[i].remark +
      "</p>" +
      "</div>";
    marker.content = contentHtml;
    marker.on("click", markerClick);
    marker.emit("click", { target: marker });
  }
  function markerClick(e) {
    infoWindow.setContent(e.target.content);
    infoWindow.open(map, e.target.getPosition());
  }
  map.setFitView();
}
// var citysearch = new AMap.CitySearch();

ranging(window);
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
  startRuler();
  ranging(window);
});
// 路径规划
$("#btn").on("click", function() {
  goto("珠光创新科技园", "南山区科技园");
});


//goto
$(document).on("click", ".goto", function() {
  goto("珠光创新科技园", $(this).attr("data"));
});
//点击检索
$("#retrieval").on("click",function(){
  $("#retrievalBox").show();
  $(".retrieval").addClass("retrieval-hide").removeClass("retrieval-show");
  // queryData("", layers);
})
//关闭检索
$("#close").on("click", function() {
  $("#retrievalBox").hide();
  $(".retrieval").removeClass("retrieval-hide").addClass("retrieval-show")
});