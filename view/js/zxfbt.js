
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
      // StatisticalTable.TimePlugIn()
    },
    listen: function() {
      // $("#dateSure").on("click", function () {
      //pc
      $("#search").on("click", function() {
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
          $("#titlePc").html(particularYear + "年" + quarter + "灾险情统计表");
        }, 0);
      });
      //移动端
      $(document).on("click", "#dateSure", function() {
        particularYear = $("#dateSelectorOne").attr("data-year");
        quarter_dataId = $("#dateSelectorOne").attr("data-month");
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

          default:
            break;
        }
        setTimeout(() => {
          $("#titlePhone").html(
            particularYear + "年" + quarter + "灾险情统计表"
          );
        }, 0);
      });
    },
    queryData: function(particularYear, quarter_dataId) {
        
      $.ajax({
        url: fileUrl.header + "/dfbinterface/mobile/gisshow/GetGisCountData3",
        type: "POST",
        dataType: "jsonp",
        jsonp: "callback",
        data: {
          year: particularYear,
          quarter: quarter_dataId
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
      var tbodyHtml = "",
        phoneHtml = "",
        warnlevelSum = 0, //灾险情总数
        warnlevel1Sum = 0, //隐患Ⅰ级总数
        warnlevel2Sum = 0, //隐患Ⅱ级总数
        warnlevel3Sum = 0, //隐患Ⅲ级总数
        warnlevel4Sum = 0; //隐患Ⅳ级总数

      for (let i = 0; i < data.length; i++) {
        warnlevelSum +=
          data[i].warnlevel1 +
          data[i].warnlevel2 +
          data[i].warnlevel3 +
          data[i].warnlevel4;
        warnlevel1Sum += data[i].warnlevel1;
        warnlevel2Sum += data[i].warnlevel2;
        warnlevel3Sum += data[i].warnlevel3;
        warnlevel4Sum += data[i].warnlevel4;
        tbodyHtml +=
          "<tr>" +
          "<td>" +
          (i + 1) +
          "</td>" +
          "<td>" +
          data[i].areaname +
          "</td>" +
          "<td>" +
          (data[i].warnlevel1 +
            data[i].warnlevel2 +
            data[i].warnlevel3 +
            data[i].warnlevel4) +
          "</td>" +
          "<td>" +
          data[i].warnlevel1 +
          "</td>" +
          "<td>" +
          data[i].warnlevel2 +
          "</td>" +
          "<td>" +
          data[i].warnlevel3 +
          "</td>" +
          "<td>" +
          data[i].warnlevel4 +
          "</td>" +
          "</tr>";

        phoneHtml +=
          "<tr>" +
          "<td>" +
          data[i].areaname +
          "</td>" +
          "<td>" +
          data[i].warnlevel1 +
          "次</td>" +
          "<td>" +
          data[i].warnlevel2 +
          "次</td>" +
          "<td>" +
          data[i].warnlevel3 +
          "次</td>" +
          "<td>" +
          data[i].warnlevel4 +
          "次</td>" +
          "</tr>";
      }
      tbodyHtml +=
        "<tr>" +
        "<td colspan='2'>总计</td>" +
        "<td>" +
        warnlevelSum +
        "</td>" +
        "<td>" +
        warnlevel1Sum +
        "</td>" +
        "<td>" +
        warnlevel2Sum +
        "</td>" +
        "<td>" +
        warnlevel3Sum +
        "</td>" +
        "<td>" +
        warnlevel4Sum +
        "</td>" +
        "</tr>";

      phoneHtml +=
        "<tr>" +
        "<td>合计</td>" +
        "<td>" +
        warnlevel1Sum +
        "次</td>" +
        "<td>" +
        warnlevel2Sum +
        "次</td>" +
        "<td>" +
        warnlevel3Sum +
        "次</td>" +
        "<td>" +
        warnlevel4Sum +
        "次</td>" +
        "</tr>";
      var sum = warnlevel1Sum + warnlevel2Sum + warnlevel3Sum + warnlevel4Sum;
      $(".sum").html("共查询到" + sum + "条灾险情");
      $("#tbodyHtml").html(tbodyHtml);
      $("#phoneHtml").html(phoneHtml);
    }
    // TimePlugIn: function () {
    //     new Mdate("dateSelectorOne");
    // }
  };
  StatisticalTable.init();
});
