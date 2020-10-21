Page({
  data: {
    //baseUrl:"https://gofly.sopans.com",
    baseUrl:"http://127.0.0.1:8081",
    wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVfdGltZSI6MTYwMzI1OTk2Niwia2VmdV9pZCI6MSwibmFtZSI6ImtlZnUyIiwicm9sZV9pZCI6MSwidHlwZSI6ImtlZnUifQ.RRA69WaopRRL4rtxetXRh85nvDhYWFnKeOUlKCdLSNw",
    //wsBaseUrl:"wss://gofly.sopans.com/ws_kefu?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVfdGltZSI6MTYwMzI1OTk2Niwia2VmdV9pZCI6MSwibmFtZSI6ImtlZnUyIiwicm9sZV9pZCI6MSwidHlwZSI6ImtlZnUifQ.RRA69WaopRRL4rtxetXRh85nvDhYWFnKeOUlKCdLSNw",
    visitors:[],
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
            let _this=this;
            let mes = {}
            mes.type = "ping";
            mes.data = "";
            setInterval(function () {
                  my.sendSocketMessage({
                      data: JSON.stringify(mes),
                  });
            },5000)

    });
    my.onSocketMessage((res) => {
      var redata = JSON.parse(res.data);
      switch (redata.type){
          case "allUsers":
              break;
          case "userOnline":
              _this.addOnlineUser(redata.data);
              break;
          case "userOffline":
            
              break;
          case "notice":
          
              break;
      }
      //console.log('收到服务器内容 ：' + res.data)
    });


  },
  addOnlineUser(retData){
      var visitors=this.data.visitors;
      var flag=false;
      retData.last_message="新访客";
      retData.name=retData.username;
      for(let i=0;i<visitors.length;i++){
          if(visitors[i].uid==retData.uid){
              flag=true;
          }
      }
     console.log(visitors,retData);
      if(!flag){
          visitors.unshift(retData);
      }
      this.setData({
        visitors: visitors,
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
