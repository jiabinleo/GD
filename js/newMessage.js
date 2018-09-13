var newMessage = {
  queryData: function() {
    $.ajax({
      url: fileUrl.header88 + "/light/message/getNewMessageList", //后台接口地址
      type: "GET",
      dataType: "json",
      success: function(data) {
        if (data.success == true) {
          newMessage.updateMessage(data.result);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  },
  updateMessage: function(data) {
    console.log(data)
    var flag = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i].isread === "0") {
        flag = true;
      }
    }
    if (flag) {
      $("#message")
        .removeClass("message")
        .addClass("messageYes");
    } else {
      $("#message")
        .removeClass("messageYes")
        .addClass("message");
    }
  }
};
$(function() {
  setInterval(function() {
    newMessage.queryData();
  }, 5000);
});
