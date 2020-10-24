Page({
  data: {
    baseUrl:"https://gofly.sopans.com",
    wsBaseUrl:"wss://gofly.sopans.com/ws_kefu",
    // baseUrl:"http://127.0.0.1:8081",
    // wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
    visitors:[],
    token:"",
    timer:null,
    wsOpen:false,
  },
  //用户实时上下线
  onlineIntime(){
    var _this=this;
    var timer=null;
    my.connectSocket({
      url: this.data.wsBaseUrl+"?token="+this.data.token,
    });
    my.onSocketClose((res) => {
      clearInterval(timer);
      console.log("WebSocket 连接断开");
    });
    my.onSocketOpen((res) => {
          console.log("WebSocket 连接已打开");;
            let _this=this;
            let mes = {}
            mes.type = "ping";
            mes.data = "";
            timer=setInterval(function () {
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
             _this.removeOfflineUser(redata.data);
              break;
          case "notice":
              break;
          case "message":
            _this.recvMessage(redata.data);
          break;
      }
    });


  },
  addOnlineUser(retData){
      var visitors=this.data.visitors;
      var flag=false;

      for(let i=0;i<visitors.length;i++){
          if(visitors[i].uid==retData.uid){
              flag=true;
          }
      }
      if(!flag){
          visitors.unshift(retData);
      }
      this.setData({
        visitors: visitors,
      });
  },
    //处理当前在线用户列表
  removeOfflineUser:function (retData) {
    var visitors=this.data.visitors;
      for(let i=0;i<visitors.length;i++){
          if(visitors[i].uid==retData.uid){
              visitors.splice(i,1);
          }
      }
      this.setData({
        visitors: visitors,
      });
  },
  //点击
  chatVisitor(e){
    var visitorId=e.target.dataset.uid;
    my.navigateTo({ url: '/pages/detail/detail?visitor_id='+visitorId })
  },
  checkAuth(){
    var _this=this;
    my.request({
        url: this.data.baseUrl+'/userinfo?token='+this.data.token,
        method: 'GET',
        success: function(res) {
        },
        complete: function(res) {
          my.hideLoading();
          var code=res.data.code;
          if(code!=200){
            //my.alert({content: res.data.msg});
            my.navigateTo({ url: '/pages/index/login' });
          }else{
             _this.onlineIntime();;
                
          }
        }
    });
  },
  recvMessage(msg){
    var visitors=this.data.visitors;
    for(let i=0;i<visitors.length;i++){
        if(visitors[i].uid==msg.id){
            visitors[i].last_message=msg.content;
        }
    }
    this.setData({
        visitors: visitors,
    });
  },
  getOnlineUser(){
    let _this=this;
    var baseUrl=this.data.baseUrl;
      my.request({
        url: baseUrl+'/visitors_kefu_online',
        headers: {'token': this.data.token},
        method: 'GET',
        success: function(res) {
        },
        fail: function(res) {
          my.alert({content: 'fail'});
        },
        complete: function(res) {
          my.hideLoading();
          if(!res.data.result){
            return;
          }
          _this.setData({
            visitors: res.data.result,
          });
        }
    });
  },
  onLoad(){
    let _this=this;
    let res = my.getStorageSync({ key: 'app' });
    if(res.data){
      this.setData({token:res.data.token});
    }

  },
  // 页面显示
  onShow() {
    this.checkAuth();;
    this.getOnlineUser();
  },
});
