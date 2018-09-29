var fileUrl = {
  weather: "http://14.116.184.77:8088",
  header88: "http://192.168.1.240:8088",
  header98: "http://192.168.1.240:8098"
};
var filePath = {
  share: "http://192.168.1.240:8088/light/mapgis/view/share.html"
};
var config = {
  //时间转换
  formatDate: function (now) {
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
  fixZero: function (num, length) {
    var str = "" + num;
    var len = str.length;
    var s = "";
    for (var i = length; i-- > len;) {
      s += "0";
    }
    return s + str;
  },
  //状态
  status: function (key) {
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
      case "4":
        sta = "已结案";
        break;
    }
    return sta;
  },
  statusColor: function (key) {
    var color = "#0aa2fa";
    switch (key) {
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
        color = "#0aa2fa";
        break;
    }
    return color;
  },
  //拖拽
  zIndex: 1,
  drag: function (IdName) {
    var box = document.getElementById(IdName);
    var eleP = {
      left: 0,
      top: 0
    };
    var startP = {
      left: 0,
      top: 0
    };
    box.onmousedown = function (event) {
      config.zIndex += 1;
      box.style.zIndex = config.zIndex;
      event = event || window.event;
      eleP.left = box.offsetLeft;
      eleP.top = box.offsetTop;
      startP.left = event.clientX;
      startP.top = event.clientY;
      document.onmousemove = function (event) {
        event = event || window.event;
        var endP = {
          left: 0,
          top: 0
        };
        endP.left = event.clientX;
        endP.top = event.clientY;
        var disX = endP.left - startP.left;
        var disY = endP.top - startP.top;
        var left = disX + eleP.left;
        var top = disY + eleP.top;
        if (left < 15) {
          left = 0;
        } else if (
          left >
          document.documentElement.clientWidth - box.offsetWidth - 15
        ) {
          left = document.documentElement.clientWidth - box.offsetWidth;
        }
        if (top < 15) {
          top = 0;
        } else if (
          top >
          document.documentElement.clientHeight - box.offsetHeight - 15
        ) {
          top = document.documentElement.clientHeight - box.offsetHeight;
        }
        box.style.left = left + "px";
        box.style.top = top + "px";
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
      return false;
    };
  }
};

function getRequest() {
  var url = window.location.search; //获取url中"?"符后的字串
  var theRequest = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    strS = str.split("&");
    for (var i = 0; i < strS.length; i++) {
      theRequest[strS[i].split("=")[0]] = decodeURI(strS[i].split("=")[1]);
    }
  }
  return theRequest;
}

//根据日期计算星期
function getWeek(dateString) {
  var date;
  if (isNull(dateString)) {
    date = new Date();
  } else {
    var dateArray = dateString.split("-");
    date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
  }
  return "星期" + "日一二三四五六".charAt(date.getDay());
}

function isNull(object) {
  if (object == null || typeof object == "undefined") {
    return true;
  }
  return false;
}

// 判断字段是否为空
function isKong(val) {
  return val ? val : "";
}