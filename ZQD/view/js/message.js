var msg = {
  init: function() {
    msg.listen();
    msg.queryData();
  },
  listen: function() {
    $(document).on("click", "#msgSection > li", function() {
      $("#msgDetails_title").html(
        $(this)
          .find(".msgTitle")
          .text()
      );
      $("#msgDetails_content").html(
        $(this)
          .find(".msgContent")
          .text()
      );
      $("#msgDetails_publisher").html(
        $(this)
          .find(".msgPublisher")
          .attr("data")
      );
      $("#msgDetails_time").html(
        $(this)
          .find(".msgTimes")
          .text()
      );
      $("#msgWrap_list").hide();
      $("#msgWrap_details").show();
      if ($(this).attr("isreads") === "0") {
        msg.readNewMessage($(this).attr("data-id"));
      }
    });
    $(document).on("click", "#closeDetails", function() {
      $("#msgWrap_details").hide();
      $("#msgWrap_list").show();
    });
    $(document).on("click", "#closeList", function() {
      $("#msgWrap").hide();
    });
  },
  queryData: function() {
    $.ajax({
      url: fileUrl.header88 + "/light/message/getNewMessageList", //后台接口地址
      type: "POST",
      dataType: "json",
      success: function(data) {
        if (data.success == true) {
          msg.messNewList(data.result);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  },
  messNewList: function(data) {
    var readYes = [],
      readYes = [],
      readNo = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].isread === "0") {
        readNo.push(data[i]);
      } else if (data[i].isread === "1") {
        readYes.push(data[i]);
      }
    }
    readAll = readNo.concat(readYes);
    msg.listHtml(readAll);
  },
  listHtml: function(data) {
    var isreadStatus = "read0";
    var msgListHtml = "";
    var isRead = "";
    for (let i = 0; i < data.length; i++) {
      switch (data[i].isread) {
        case "0":
          isRead = "未读";
          isreadStatus = "read0";
          break;
        case "1":
          isRead = "已读";
          isreadStatus = "read1";
          break;
      }
      msgListHtml += `<li isreads = "${data[i].isread}" data-id = "${
        data[i].id
      }" name="${i}">
          <div class="msgLeft">
          <span class="${isreadStatus}">
          ${isRead}
          </span>
          </div>
          <div class="msgRight">
          <p><span class="msgTitle">${
            data[i].title
          }</span><span class="msgTimes">${config.formatDate(
        data[i].pushtime
      )}</span></p>
          <p class="msgContent">${data[i].message}</p>
          <p><span class="msgPublisher" data="${
            data[i].publish
          }">查看详情</span></p>
          </div>
          </li>`;
    }
    $(".read0").css({ "background-color": "#50bbfb" });
    $("#msgSection").html(msgListHtml);
  },
  //更新阅读状态
  readNewMessage: function(id) {
    $.ajax({
      url: fileUrl.header88 + "/dfbinterface/mobile/message/updateMessage",
      type: "POST",
      dataType: "json",
      data: {
        id: id,
        isread: "1"
      },
      success: function(data) {
        console.log(data);
        if (data.success == "0") {
          msg.queryData(data.result);
        }
      },
      error: function(err) {
        console.log(err);
      }
    });
  }
};
msg.init();
