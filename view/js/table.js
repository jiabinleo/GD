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
      // console.log($(this).attr("url"));
      // window.open($(this).attr("url"));
      // $("#tableWrap").load($(this).attr("url"))
      $("#tableWrap").load("/view/zxfbt.html");
      // $("#tableWrap").load("/view/yhfbt.html");
      // $("#tableWrap").load("/view/zdfzfbt.html");
      // $("#tableWrap").load("/view/zlqktjt.html");
      // $("#tableWrap").load("/view/cyfx.html");
      $("#tableWrap").show();
    });
  },
  // 获取图表列表
  queryTable: function() {
    $.ajax({
      url: fileUrl.header + "/dfbinterface//mobile/statistic/sysdict",
      // url: fileUrl.header + "/dfbinterface//mobile/statistic/sysdict",

      dataType: "json",
      type: "GET",
      success: function(data) {
        console.log(data);
        if (data.success === "0") {
          table.createTable(data.result);
        }
      }
    });
  },
  createTable: function(data) {
    console.log(data);
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
