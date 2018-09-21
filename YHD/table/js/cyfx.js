
var particularYear = "",
  quarter_dataId = "",
  quarter = ""; //年份数字    季度数字   第X季度
var StatisticalTable = {
  init: function () {
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
    $("#year-type").html(particularYearHtml)

    StatisticalTable.listen();
  },
  listen: function () {
    //pc

    $("#search").on("click", function () {
      var particularYear = $("#particularYear option:selected").val();
      var quarter_dataId = $("#quarter option:selected").attr("data-id");
      var quarter = $("#quarter option:selected").val();
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
          particularYear + "年" + quarter + "灾害治理情况统计"
        );
      }, 0);
    });
  },
  queryData: function (particularYear, quarter) {
    $.ajax({
      url: localhost + "/dfbinterface/mobile/gisshow/GetGisCountData4",
      type: "POST",
      dataType: "jsonp",
      jsonp: "callback",
      data: {
        year: particularYear,
        quarter: quarter
      },
      success: function (data) {
        if (data.success === "0") {
          var arr = [];
          for (const key in data.result[0]) {
            if (data.result[0].hasOwnProperty(key)) {
              arr.push(data.result[0][key]);
            }
          }
          StatisticalTable.queryDate(arr);
        }
      },
      error: function (err) {}
    });
  },
  queryDate: function (data) {
    var tbodyHtmlPc = "",
      datacountSum = 0;
    for (let i = 0; i < data.length; i++) {
      datacountSum += data[i].datacount;
      tbodyHtmlPc +=
        "<tr>" +
        "<td>" +
        (i + 1) +
        "</td>" +
        "<td>" +
        data[i].dataname +
        "</td>" +
        "<td>" +
        data[i].datavalue +
        "</td>" +
        "<td>" +
        data[i].datacount +
        "</td>" +
        "<td>" +
        data[i].percent +
        "</td>" +
        "</tr>";
    }
    tbodyHtmlPc +=
      "<tr>" +
      "<td colspan='2'>总计</td>" +
      "<td></td>" +
      "<td>" +
      datacountSum +
      "</td>" +
      "<td>100%</td>" +
      "</tr>";

    var sum = datacountSum;
    $(".sum").html("合计" + sum + "个发灾点");
    $("#tbodyHtmlPc").html(tbodyHtmlPc);
  }
};
StatisticalTable.init();
var page = {
  init: function () {
    page.listen();
    page.querysxt(2018)
  },
  listen: function () {
    $("#year-type").change(function (event) {
      page.querysxt($("option:selected").attr("value"))
      $("#title").html($("option:selected").attr("value") + "年度深圳市地面坍塌原因分析")
    })
  },
  querysxt: function (years) {
    //原因分析
    $.ajax({
      url: localhost + "/dfbinterface/mobile/gisshow/GetGisCountData4",
      type: "GET",
      dataType: "jsonp",
      jsonp: "callback",
      data: {
        year: years
      },
      success: function (data) {
        // data = JSON.parse(data);
        page.myChart2(data.result[0]);
      },
      error: function (err) {}
    });
  },
  queryData: function (dateStart, dateEnd) {
    $.ajax({
      url: localhost + "/dfbinterface/mobile/gisshow/GetGisCountData2",
      type: "GET",
      dataType: "jsonp",
      jsonp: "callback",
      data: {
        dateStart: dateStart,
        dateEnd: dateEnd
      },
      success: function (data) {
        page.queryEcharts(data);
      },
      error: function (err) {}
    });
  },
  myChart2: function (data) {
    var datas = [];
    for (const key in data) {
      datas.unshift(data[key]);
    }
    var dataname = [],
      datacount = [];
    for (let i = 0; i < datas.length; i++) {
      dataname.push(datas[i].dataname);
      if (datas[i].color == undefined) {
        datas[i].color = "";
      }
      datacount.push({
        value: datas[i].datacount,
        name: datas[i].dataname,
        itemStyle: {
          color: datas[i].color
        }
      });
    }
    var myChart2 = echarts.init(document.getElementById("main2"));
    option2 = {
      title: {
        text: "",
        x: "center",
        textStyle: {
          verticalAlign: "bottom",
          fontWeight: "normal"
        }
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
        textStyle: {}
      },
      legend: {
        orient: "vertical",
        right: "5%",
        top: "20%",
        data: dataname,
        itemWidth: 40,
        itemHeight: 26,
        itemGap: 30,
        textStyle: {
          color: "#000",
        }
      },
      series: [{
        name: "访问来源",
        type: "pie",
        radius: ["20%", "70%"],
        center: ["45%", "48%"],
        label: {
          normal: {
            position: "inner",
            formatter: "{d}%",
            textStyle: {
              color: "#FFF",
            }
          }
        },
        data: datacount,
        itemStyle: {
          emphasis: {
            shadowBlur: 50,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          },
          normal: {
            borderColor: "#fff",
            borderWidth: 2
          }
        }
      }]
    };
    myChart2.setOption(option2);
  }
};
page.init();
$(document).on("click", "#change", function () {
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