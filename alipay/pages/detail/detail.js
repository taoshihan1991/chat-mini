Page({
  data: {
    //baseUrl:"https://gofly.sopans.com",
    baseUrl:"http://127.0.0.1:8081",
    wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVfdGltZSI6MTYwMzI1OTk2Niwia2VmdV9pZCI6MSwibmFtZSI6ImtlZnUyIiwicm9sZV9pZCI6MSwidHlwZSI6ImtlZnUifQ.RRA69WaopRRL4rtxetXRh85nvDhYWFnKeOUlKCdLSNw",
    //wsBaseUrl:"wss://gofly.sopans.com/ws_kefu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVfdGltZSI6MTYwMzI1OTk2Niwia2VmdV9pZCI6MSwibmFtZSI6ImtlZnUyIiwicm9sZV9pZCI6MSwidHlwZSI6ImtlZnUifQ.RRA69WaopRRL4rtxetXRh85nvDhYWFnKeOUlKCdLSNw",
    messages:[],
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
          console.log("WebSocket 连接已打开");
    });
    my.onSocketMessage((res) => {
      var redata = JSON.parse(res.data);
      switch (redata.type){
          case "message":
              break;
          case "notice":
              break;
      }
      //console.log('收到服务器内容 ：' + res.data)
    });


  },


  //点击
  chatVisitor(){
    
  },
  onLoad(options){
    let _this=this;
    var baseUrl=this.data.baseUrl;
      my.request({
        url: baseUrl+'/2/messages?visitor_id='+options.visitor_id,
        method: 'GET',
        success: function(res) {
        },
        fail: function(res) {
          my.alert({content: 'fail'});
        },
        complete: function(res) {
          my.hideLoading();
          _this.setData({
            messages: res.data.result,
          });
          _this.onlineIntime();
        }
    });
  }
});
