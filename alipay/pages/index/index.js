Page({
  data: {
    baseUrl:"https://gofly.sopans.com",
    wsBaseUrl:"wss://gofly.sopans.com/ws_kefu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVfdGltZSI6MTYwMzI1OTk2Niwia2VmdV9pZCI6MSwibmFtZSI6ImtlZnUyIiwicm9sZV9pZCI6MSwidHlwZSI6ImtlZnUifQ.RRA69WaopRRL4rtxetXRh85nvDhYWFnKeOUlKCdLSNw",
    visitors:[]
  },
  login(){
    my.alert({ title: 'You click reset' });
  },
  //用户实时上下线
  onlineIntime(){
    let _this=this;
    my.connectSocket({
      url: this.data.wsBaseUrl,
    });
    my.onSocketClose((res) => {
      my.alert({content: '连接已关闭！'});
    });
    my.onSocketOpen((res) => {
					console.log("WebSocket 连接已打开1");
		});

    my.onSocketMessage((res) => {
      var visitors=_this.data.visitors;
      console.log('收到服务器内容 ：' + res.data)
    });
  },
  onLoad(){
    let _this=this;
    var baseUrl=this.data.baseUrl;
      my.request({
        url: baseUrl+'/visitors_online',
        method: 'GET',
        success: function(res) {
        },
        fail: function(res) {
          my.alert({content: 'fail'});
        },
        complete: function(res) {
          my.hideLoading();
          _this.setData({
            visitors: res.data.result.ws,
          });
          _this.onlineIntime();
        }
    });
  }
});
