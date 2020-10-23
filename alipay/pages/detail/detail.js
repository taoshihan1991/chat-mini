Page({
  data: {
    baseUrl:"https://gofly.sopans.com",
    wsBaseUrl:"wss://gofly.sopans.com/ws_kefu",
    // baseUrl:"http://127.0.0.1:8081",
    // wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
    messages:[],
    token:"",
  },
  login(){
    my.alert({ title: 'You click reset' });
  },
  //用户实时上下线
  onlineIntime(){
    let _this=this;
    var timer=null;
    console.log(this.data.wsBaseUrl+"?token="+this.data.token);
    my.connectSocket({
      url: this.data.wsBaseUrl+"?token="+this.data.token,
    });
    my.onSocketClose((res) => {
      console.log("WebSocket 连接断开");
    });
    my.onSocketOpen((res) => {
          console.log("WebSocket 连接已打开");
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
          case "message":
            _this.recvMessage(redata.data);
          break;
          case "notice":
              break;
      }
      //console.log('收到服务器内容 ：' + res.data)
    });


  },
  recvMessage(msg){
    var _this=this;
    var messages=this.data.messages;
    messages.push(msg);
    this.setData({
        messages: messages,
    },function(){
        _this.pageScrollToBottom();
    });
  },
  onLoad(options){
    let _this=this;
    let res = my.getStorageSync({ key: 'app' });
    if(res.data){
      this.setData({token:res.data.token});
    }
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
          },function(){
            _this.pageScrollToBottom();

          });
          _this.onlineIntime();
        }
    });
  },
   pageScrollToBottom: function () {
     console.log(11111);
    my.createSelectorQuery().select('#chatDetail').boundingClientRect().exec((rect)=>{
      console.log(rect);;
      // 使页面滚动到底部
      my.pageScrollTo({
        scrollTop: rect[0].bottom
      })
    });
    console.log(222);
 },
});
