var details = {
  detailsSpot: function(etc) {
    var data = {
      uuid: etc.uuid
    };
    $.ajax({
      type: "GET",
      url: header + "/dfbinterface/mobile/gisshow/GetSingleDisaster", //后台接口地址
      dataType: "jsonp",
      data: data,
      jsonp: "callback",
      success: function(data) {
        if (data.success == "0") {
          details.detailsSpotHtml(etc, data.result);
        }
      }
    });
  },
  detailsSpotHtml: function(etc, data) {
    console.log(data);
    $("#copytxt").html("http://127.0.0.1:5500/share.html?uuid=" + etc.uuid);
    // 获取天气
    var weatherHtml = "";
    $.ajax({
      // url: headerWeather + "/light/mobile/weather/getWeather",
      url: header240 + "/light/mobile/weather/getJsonpWeather",
      type: "POST",
      async: false,
      dataType: "jsonp",
      jsonp: "callback",
      // dataType: "json",
      data: {
        lon: data.fzsite.lon,
        lat: data.fzsite.lat
      },
      success: function(data) {
        console.log(data);
        if (data.success == "0") {
          for (let i = 0; i < data.result.forecast.dailyArray.length; i++) {
            var skycon = {};
            switch (data.result.forecast.dailyArray[i].skycon) {
              case "CLEAR_DAY":
                skycon = {
                  weatherUrl: "../img/CLEAR_DAY.png",
                  status: "晴天"
                };
                break;
              case "CLEAR_NIGHT":
                skycon = {
                  weatherUrl: "../img/CLEAR_NIGHT.png",
                  status: "晴夜"
                };
                break;
              case "PARTLY_CLOUDY_DAY":
                skycon = {
                  weatherUrl: "../img/PARTLY_CLOUDY_DAY.png",
                  status: "多云"
                };
                break;
              case "PARTLY_CLOUDY_NIGHT":
                skycon = {
                  weatherUrl: "../img/PARTLY_CLOUDY_NIGHT.png",
                  status: "多云"
                };
                break;
              case "CLOUDY":
                skycon = {
                  weatherUrl: "../img/CLOUDY.png",
                  status: "阴"
                };
                break;
              case "RAIN":
                skycon = {
                  weatherUrl: "../img/RAIN.png",
                  status: "雨"
                };
                break;
              case "SNOW":
                skycon = {
                  weatherUrl: "../img/SNOW.png",
                  status: "雪"
                };
                break;
              case "WIND":
                skycon = {
                  weatherUrl: "../img/WIND.png",
                  status: "风"
                };
                break;
              case "HAZE":
                skycon = {
                  weatherUrl: "../img/HAZE.png",
                  status: "雾霾沙尘"
                };
                break;
              default:
                skycon = {
                  weatherUrl: "",
                  status: ""
                };
                break;
            }
            weatherHtml += `<li>
            <p>${data.result.forecast.dailyArray[i].date}</p>
            <p>${data.result.forecast.dailyArray[i].tempMin}/${
              data.result.forecast.dailyArray[i].tempMax
            }℃</p>
            <img src="${skycon.weatherUrl}" alt="">
            <p>${skycon.status}</p>
        </li>`;
          }
        }
      }
    });
    var imgHtml = "";
    var videoHtml = "";
    imgArr = [];
    videoArr = [];
    imgMini = 0;
    videoMini = 0;
    setTimeout(() => {
      for (let i = 0; i < data.attachList.length; i++) {
        if (data.attachList[i].filetype === "1") {
          imgMini++;
          imgArr.push(data.attachList[i].url_path);
          imgHtml += `<li class="imgMin" index="${imgMini - 1}">
        <img width="100%" src="${data.attachList[i].url_path}" alt="暂无图片">
        <a>${config.formatDate(data.attachList[i].createtime)}</a>
        </li>`;
        } else if (data.attachList[i].filetype === "2") {
          videoMini++;
          videoArr.push(data.attachList[i].url_path);
          videoHtml += `<li class="videoMin" index="${videoMini - 1}">
        <video pause="" width="100%" src="${
          data.attachList[i].url_path
        }" class="pause">暂无视频</video>
        <a>${config.formatDate(data.attachList[i].createtime)}</a>
        </li>`;
        }
      }
      if (imgHtml.length == 0) {
        imgHtml =
          "<p style='font-size:14px;line-height:45px;color:#666666;padding-left:14px;'>暂无照片</p>";
      }
      if (videoHtml.length == 0) {
        videoHtml =
          "<p style='font-size:14px;line-height:45px;color:#666666;padding-left:14px;'>暂无视频</p>";
      }
      var detailsHtml = `<div class="details-header">
    <span title=${data.fzsite.secondname}>${data.fzsite.secondname}</span>
    <span>(编号：${data.fzsite.id})</span>
    <span id="close3"><img src="img/close.png" alt=""></span>
</div>
<div class="details-content">
    <div class="address"  title="${data.fzsite.addressname}">
        <span class="lt">灾情地址：</span>
        <span><img id='goto' data=${
          data.fzsite.addressname
        } src="img/goto.png" alt=""></span>
        <span class="rt">${data.fzsite.addressname}</span>
    </div>
    <p class="quyujiedao rt">所属区（街道）：${data.fzsite.areaname}${
        data.fzsite.street
      }<p>
    <div class="disasterPoint">
        <p>
            <span class="lt">灾情概况： <a class="status${
              data.fzsite.managestate
            }">( ${indexPage.status(data.fzsite.managestate)})</a></span>
            <span id="qrButton" class="rt pl30">转发</span>
            <span class="rt" id="inspecting">巡查</span>
        </p>
        <p>
            <span class="lt">上报者</span>
            <span class="rt">${data.fzsite.manager}</span>
        </p>
        <p>
            <span class="lt">联系电话</span>
            <span class="rt">${data.fzsite.managertel}</span>
        </p>
        <p>
            <span class="lt">上报时间</span>
            <span class="rt">${data.fzsite.checkdate}</span>
        </p>
        <p>
            <span class="lt">灾情状况</span>
            <span class="rt">${data.fzsite.remark}</span>
        </p>
    </div>
    <div class="fieldPhoto">
        <p>现场照片</p>
        <div class="fieldPhoto-wrap">
            <ul>
                ${imgHtml}
            </ul>
        </div>
    </div>
    <div class="fieldVideo">
        <p>现场视频</p>
        <div class="fieldVideo-wrap">
            <ul>
                ${videoHtml}
            </ul>
        </div>
    </div>
    <div class="weather">
        <p>未来天气</p>
        <ul>
            ${weatherHtml}
        </ul>
    </div>
    <div class="else">
        <ul lat=${data.fzsite.lat} lon=${data.fzsite.lon}>
            <li class="aroundList" data="学校">
                <img src="img/school.png" alt="">
                <p>学校</p>
            </li>
            <li class="aroundList" data="避难场所">
                <img src="img/refuge.png" alt="">
                <p>
                避难场所
                </p>
            </li>
            <li class="aroundList" data="重要场所">
                <img src="img/ImportantPlace.png" alt="">
                <p>
                    重要场所
                </p>
            </li>
            <li class="aroundList" data="水库">
                <img src="img/reservoir.png" alt="">
                <p>
                    水库
                </p>
            </li>
        </ul>
    </div>
</div>`;
      $("#details").html(detailsHtml);
      $("#details").show();
    }, 300);
  }
};
