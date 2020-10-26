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
    wx.connectSocket({
      url: this.data.wsBaseUrl+"?token="+this.data.token,
    });
    wx.onSocketClose((res) => {
      clearInterval(timer);
      console.log("WebSocket 连接断开");
    });
    wx.onSocketOpen((res) => {
          console.log("WebSocket 连接已打开");;
            let _this=this;
            let mes = {}
            mes.type = "ping";
            mes.data = "";
            timer=setInterval(function () {
                  wx.sendSocketMessage({
                      data: JSON.stringify(mes),
                  });
            },5000)
    });
    wx.onSocketMessage((res) => {
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
  chatVisitor(event){
    var visitorId=event.currentTarget.dataset.uid;
    wx.navigateTo({ url: '/pages/detail/detail?visitor_id='+visitorId })
  },
  checkAuth(){
    var _this=this;
    wx.request({
        url: this.data.baseUrl+'/userinfo?token='+this.data.token,
        method: 'GET',
        success: function(res) {
        },
        complete: function(res) {
          var code=res.data.code;
          if(code!=200){
            //wx.alert({content: res.data.msg});
            wx.navigateTo({ url: '/pages/index/login' });
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
      wx.request({
        url: baseUrl+'/visitors_kefu_online',
        header: {'token': this.data.token},
        method: 'GET',
        success: function(res) {
        },
        fail: function(res) {
          wx.alert({content: 'fail'});
        },
        complete: function(res) {
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
    wx.getStorage({
      key: 'app',
      success (res) {
        if(res.data){
          var appData=JSON.parse(res.data);
          _this.setData({token:appData.token});
          _this.checkAuth();;
        }
      },
      fail(){
        _this.checkAuth();;
      }
      })

  },
  // 页面显示
  onShow() {
    let _this=this;
    wx.getStorage({
      key: 'app',
      success (res) {
        if(res.data){
          var appData=JSON.parse(res.data);
          _this.setData({token:appData.token});
          _this.getOnlineUser();
        }
      },
      fail(){
        _this.checkAuth();;
      }
      })
  },
});
