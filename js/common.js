var common = {
  //根据条件查询数据
  queryData: function(data, layers) {
    $.ajax({
      type: "GET",
      url: header + "/dfbinterface/mobile/gisshow/GetGisDisasterdata", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        if (data.success === "0") {
          jsonData = data.result;
          allData = data.result;
          numPage = 1; //重置为第一页
          indexPage.paging(data.result.length);
          indexPage.tableList(jsonData, numPage);
          indexPage.showPoint(data.result, layers);
        }
      }
    });
  }
};
