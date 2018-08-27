//关闭检索
$("#close1").on("click", function() {
  $("#retrievalBox").hide();
  $(".retrieval")
    .removeClass("retrieval-hide")
    .addClass("retrieval-show");
});

var retrievalBox = {
  init: function() {
    retrievalBox.listen();
    retrievalBox.queryGetGisAreaName();
    common.queryData("", layers);
  },
  listen: function() {
    //转移视觉目标
    $("#tbodyHtml").on("click", "tr", function() {
      config.setZoomAndCenter(16, lon,lat);
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
        dtype: dtypes,
        areaid: areaname == "全部" ? "" : areaname,
        warnlevel: warnlevel,
        managestate: managestate
      };
      common.queryData(data, layers);
    });
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
      common.queryData(data, layers);
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
  }
};

retrievalBox.init();
