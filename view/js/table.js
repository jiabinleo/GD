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
    table.queryTable();
  },
  listen: function() {
    // 表单跳转
    $(document).on("click", "#tableListHtml > tr", function() {
      window.open($(this).attr("url"));
    });
  },
  // 获取图表列表
  queryTable: function() {
    console.log(fileUrl.header88);
    $.ajax({
      url: fileUrl.header88 + "/light/sysdict/loadChartUrl",
      type: "GET",
      // dataType: "jsonp",
      // jsonp: "callback",
      dataType: "json",
      success: function(data) {
        console.log(data);
        if (data.success === true) {
          table.createTable(data.result);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  },
  createTable: function(data) {
    var tableListHtml = "";
    for (let i = 0; i < data.length; i++) {
      tableListHtml += `<tr url="${data[i].datacode}">
      <td>${i + 1}</td>
      <td>${data[i].dataname}</td>
  </tr>`;
    }
    $("#tableListHtml").html(tableListHtml);
  }
};
table.init();
