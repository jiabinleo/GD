$(function() {
  var StartingPoint = "",
    endPoint = "";
  var map = new AMap.Map("container", {
    resizeEnable: true,
    zoom: 12
  });
  var mapPage = {
    init: function() {
      mapPage.listen();
    },
    listen: function() {
      var satellite = true;
      $("#satellite").on("click", function() {
        if (satellite) {
          layers = [new AMap.TileLayer.Satellite()];
        } else {
          layers = "";
        }
        satellite = !satellite;
        mapPage.ranging(window, layers);
      });
      $("#rangefinder").on("click", function() {
        startRuler();
      });

      // 路径规划
      $("#btn").on("click", function() {
        StartingPoint = "珠光(地铁站)";
        endPoint = "珠光创新科技园";
        window.open(
          "https://gaode.com/dir?&from%5Bname%5D=" +
            StartingPoint +
            "&to%5Bname%5D=" +
            endPoint
        );
      });
    },

    //高德地图测距
    ranging: function(window, layers) {
      var map, ruler1, ruler2;
      //地图初始化
      map = new AMap.Map("container", {
        resizeEnable: true,
        layers: layers
      });
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
  };
  mapPage.init();
  mapPage.ranging(window, "");
});
