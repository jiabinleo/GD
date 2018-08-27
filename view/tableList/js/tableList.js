//获取图表列表
var tableList = {
  init: function() {
    tableList.listen();
  },
  listen: function() {
    tableList.queryTable();
    //关闭图表列表
    $("#close2").on("click", function() {
      $("#tableList").hide();
      $(".tableList")
        .removeClass("retrieval-hide")
        .addClass("retrieval-show");
    });
  },
  queryTable: function() {
    $.ajax({
      url: header240 + "/dfbinterface//mobile/statistic/sysdict",
      dataType: "json",
      type: "GET",
      success: function(data) {
        if (data.success === "0") {
          tableList.createTable(data.result);
        }
      }
    });
  },
  createTable: function(data) {
    var tableListHtml = "";
    for (let i = 0; i < data.length; i++) {
      tableListHtml += `<tr url="${data[i].datacode}">
          <td>${data[i].id}</td>
          <td>${data[i].dataname}</td>
      </tr>`;
    }
    $("#tableListHtml").html(tableListHtml);
  }
};
tableList.init();
