var dateStart = "",
  dateEnd = "";
var localhost = "http://14.116.184.77:8098";
var page = {
  init: function() {
    page.listen();
    page.queryData();
  },
  listen: function() {},
  queryData: function(dateStart, dateEnd) {
    $.ajax({
      url: localhost + "/dfbinterface/mobile/gisshow/GetGisCountData2",
      type: "GET",
      dataType: "jsonp",
      jsonp: "callback",
      data: {
        dateStart: dateStart,
        dateEnd: dateEnd
      },
      success: function(data) {
        if (data.success === "0") {
          page.queryEcharts(data.result[0]);
        }
      },
      error: function(err) {}
    });
  },
  queryEcharts: function(data) {
    var areaname = [],
      casehandling = [],
      handling = [],
      solved = [],
      suspending = [];
    for (const index in data) {
      areaname.push(data[index].areaname); //区域
      suspending.push(data[index].suspending); //未治理
      handling.push(data[index].handling); //治理中
      solved.push(data[index].solved); //已治理
      casehandling.push(data[index].casehandling); //已结案
    }

    var myChart = echarts.init(document.getElementById("main"));
    var seriesLabel = {
      normal: {
        show: true,
        textBorderColor: "#FFF",
        textStyle: {
          color: "#FFF"
        },
        textBorderWidth: 1,
        position: "",
        formatter: function(params) {
          if (params.value == 0) {
            return "";
          } else {
            return params.value;
          }
        }
      }
    };
    option = {
      title: {
        text: ""
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985"
          }
        }
      },
      legend: {
        data: ["未治理", "治理中", "已治理", "已结案"]
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: areaname
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "未治理",
          type: "line",
          areaStyle: { normal: {} },
          stack: "总量",
          data: suspending
        },
        {
          name: "治理中",
          type: "line",
          areaStyle: { normal: {} },
          stack: "总量",
          data: handling
        },
        {
          name: "已治理",
          type: "line",
          areaStyle: { normal: {} },
          stack: "总量",
          data: solved
        },
        {
          name: "已结案",
          type: "line",
          areaStyle: { normal: {} },
          stack: "总量",
          data: casehandling
        }
      ]
    };
    myChart.setOption(option);
  }
};
page.init();

var particularYear = "",
  quarter_dataId = "",
  quarter = ""; //年份数字    季度数字   第X季度
var StatisticalTable = {
  init: function() {
    var year = new Date().getFullYear();
    var particularYearHtml = "";
    var years = new Date();
    $("#timer").html(
      "截止" +
        years.getFullYear() +
        "年" +
        (years.getMonth() + 1) +
        "月" +
        years.getDate() +
        "日"
    );
    $("#timerphone").html(
      "截止" +
        years.getFullYear() +
        "年" +
        (years.getMonth() + 1) +
        "月" +
        years.getDate() +
        "日"
    );
    StatisticalTable.queryData(particularYear, quarter_dataId);
    for (let i = year; i >= year - 10; i--) {
      particularYearHtml += "<option value=" + i + ">" + i + "年</option>";
    }
    $("#particularYear").html(particularYearHtml);
    StatisticalTable.listen();
  },
  listen: function() {
    //pc
    $(document).on("click", "#search", function() {
      particularYear = $("#particularYear option:selected").val();
      quarter_dataId = $("#quarter option:selected").attr("data-id");
      StatisticalTable.queryData(particularYear, quarter_dataId);
      var quarter = "";
      switch (quarter_dataId) {
        case "1":
          quarter = "第一季度";
          break;
        case "2":
          quarter = "第二季度";
          break;
        case "3":
          quarter = "第三季度";
          break;
        case "4":
          quarter = "第四季度";
          break;
        case "0":
          quarter = "全年";
          break;
        default:
          break;
      }
      setTimeout(() => {
        $("#titlePc").html(
          "深圳市地面坍塌灾害治理情况统计(" +
            particularYear +
            "年" +
            quarter +
            ")"
        );
      }, 0);
    });
  },
  queryData: function(particularYear, quarter) {
    $.ajax({
      url: localhost + "/dfbinterface/mobile/gisshow/GetGisCountData5",
      type: "POST",
      dataType: "jsonp",
      jsonp: "callback",
      data: {
        year: particularYear,
        quarter: quarter
      },
      success: function(data) {
        if (data.success === "0") {
          StatisticalTable.queryDate(data.result);
        }
      },
      error: function(err) {}
    });
  },
  queryDate: function(data) {
    var tbodyHtmlPc = "",
      sosuSum = 0,
      solvedSum = 0,
      suspendSum = 0;
    for (let i = 0; i < data.length; i++) {
      sosuSum += data[i].solved + data[i].suspend;
      solvedSum += data[i].solved;
      suspendSum += data[i].suspend;
      tbodyHtmlPc +=
        "<tr>" +
        "<td>" +
        data[i].areaname +
        "</td>" +
        "<td>" +
        (data[i].solved + data[i].suspend) +
        "</td>" +
        "<td>" +
        data[i].solved +
        "</td>" +
        "<td>" +
        data[i].suspend +
        "</td>" +
        "<td>" +
        data[i].percent +
        "</td>" +
        "</tr>";
    }
    tbodyHtmlPc +=
      "<tr>" +
      "<td>总计</td>" +
      "<td>" +
      sosuSum +
      "</td>" +
      "<td>" +
      solvedSum +
      "</td>" +
      "<td>" +
      suspendSum +
      "</td>" +
      "<td></td>";
    ("</tr>");
    var sum = sosuSum;
    $(".sum").html("共查询到" + sum + "个灾害点");
    $("#tbodyHtmlPc").html(tbodyHtmlPc);
    $("#tbodyHtmlPhone").html(tbodyHtmlPc);
  }
};
StatisticalTable.init();
$("#change").on("click", function() {
  if ($(this).val() === "列表模式") {
    $(this).val("图表模式");
    $("#map").hide();
    $("#table").show();
  } else if ($(this).val() === "图表模式") {
    $(this).val("列表模式");
    $("#map").show();
    $("#table").hide();
  }
});
