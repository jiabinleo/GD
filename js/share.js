$("#downloadApp").qrcode({
  text: "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
});
$("#PublicNumber").qrcode({
  text: "http://a3.rabbitpre.com/m2/aUe1ZjN35c?&lc=1&sui=TmugHNBC#from=share"
});
$.ajax({
  url: header240 + "/dfbinterface/mobile/handle/GetSingleHandle", //后台接口地址
  type: "POST",
  dataType: "json",
  data: { disasterid: getRequest().uuid },
  success: function(data) {
    console.log(data);
    if (data.success == "0") {
      htmlL(data.result);
    }
  },
  error: function(err) {
    console.log(err);
  }
});

function htmlL(data) {
  console.log(data);
//   $("#ids").html("编号（" + data.handle.id + "）");
//   $("#address").html(data.fzsite.addressname);
//   $("#liShu").html(data.fzsite.areaname);
//   $("#time").html(data.fzsite.checkdate);
}
