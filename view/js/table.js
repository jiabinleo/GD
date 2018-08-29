//关闭图表列表
$("#close2").on("click", function() {
  $("#tableList").hide();
  $(".tableList")
    .removeClass("retrieval-hide")
    .addClass("retrieval-show");
});
var table = {
  init: function() {
    table.listen();
  },
  listen: function() {
    table.queryTable();
  },
  // 获取图表列表
  queryTable: function() {
    $.ajax({
      url: fileUrl.header + "/dfbinterface//mobile/statistic/sysdict",
      dataType: "json",
      type: "GET",
      success: function(data) {
        if (data.success === "0") {
          // tableListHtml
          table.createTable(data.result);
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
table.init();
