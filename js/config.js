var header = "http://14.116.184.77:8098";
var headerWeather = "http://14.116.184.77:8088";
var header240 = "http://192.168.1.240:8080";

//时间转换
var config = {
  formatDate: function(now) {
    var now = new Date(now);
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    return (
      year +
      "-" +
      config.fixZero(month, 2) +
      "-" +
      config.fixZero(date, 2) +
      " " +
      config.fixZero(hour, 2) +
      ":" +
      config.fixZero(minute, 2) +
      ":" +
      config.fixZero(second, 2)
    );
  },
  //时间如果为单位数补0
  fixZero: function(num, length) {
    var str = "" + num;
    var len = str.length;
    var s = "";
    for (var i = length; i-- > len; ) {
      s += "0";
    }
    return s + str;
  },
  getRequest: function() {
    var url = window.location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
      }
    }
    return theRequest;
  },
  // 转移视觉目标
  setZoomAndCenter: function(lon, lat) {
    map.setZoomAndCenter(16, [lon, lat]);
  }
};
