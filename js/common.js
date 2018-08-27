var StartingPoint = "",
  endPoint = "",
  layers = [new AMap.TileLayer.Satellite()],
  map,
  ruler1,
  ruler2,
  infoWindow,
  satellite = true,
  jsonData,
  numPage = 1,
  numPageS,
  dtype = [],
  gradename = [],
  areaname = [],
  dtypes = "", //灾情
  warnlevel = "", //等级
  historyData, //巡查历史记录数据
  imgArr = [], //存储照片视频上下切换
  videoArr = [],
  indexImgVideo = 0, // 当前显示第几张
  nextNum = 0, //切换下一张的最大数量
  imgYes = true, //当前弹框是img还是video
  allData; //搜索部分所有数据
map = new AMap.Map("container", { resizeEnable: true, layers: layers });
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
