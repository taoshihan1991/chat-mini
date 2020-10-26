Page({
  data: {
    baseUrl:"https://gofly.sopans.com",
    wsBaseUrl:"wss://gofly.sopans.com/ws_kefu",
    // baseUrl:"http://127.0.0.1:8081",
    // wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
    messages:[],
    token:"",
    visitor_id:"",
    kefu_name:"",
    isDisabled:false,
    area:"",
    showArea:false,
    scrollSize:2,
  },
  //用户实时上下线
  onlineIntime(){
    let _this=this;
    var timer=null;
    console.log(this.data.wsBaseUrl+"?token="+this.data.token);
    wx.connectSocket({
      url: this.data.wsBaseUrl+"?token="+this.data.token,
    });
    wx.onSocketClose((res) => {
      console.log("WebSocket 连接断开");
    });
    wx.onSocketOpen((res) => {
          console.log("WebSocket 连接已打开");
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
    if(msg.id!=this.data.visitor_id){
        return;
    }
    var messages=this.data.messages;
    messages.push(msg);
    this.setData({
        messages: messages,
    },function(){
      console.log(messages.length);
        if(messages.length>_this.data.scrollSize){
          _this.pageScrollToBottom();
        }
    });
  },
  onLoad(options){
    console.log(options);
    var visitorId=options.visitor_id;
    let _this=this;
    wx.getStorage({
      key: 'app',
      success (res) {
        if(res.data){
          var appData=JSON.parse(res.data);
          _this.setData({token:appData.token});
          _this.setData({visitor_id:visitorId,token:appData.token,kefu_name:appData.kefu_name});
          _this.getMessage();
        }
      }
      })

  },
  onShow(){
    //this.showArea();
  },
  //
  getMessage(){
      var _this=this;
    var baseUrl=this.data.baseUrl;
      wx.request({
        url: baseUrl+'/2/messages?visitor_id='+this.data.visitor_id,
        method: 'GET',
        success: function(res) {
        },
        fail: function(res) {
        },
        complete: function(res) {
          _this.setData({
            messages: res.data.result,
          },function(){
            if(res.data.result.length>_this.data.scrollSize){
              _this.pageScrollToBottom();
            }

          });
          _this.onlineIntime();
        }
    });
  },
  
  doMsgSecCheck: function () {
    var _this=this;
    var d = Date.now()
    wx.serviceMarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'msgSecCheck',
      data: {
        "Action": "TextApproval",
        "Text": this.data.area
      },
    }).then(res => {
      //var resData=JSON.parse(res.data);
      if(res.data.Response.EvilTokens.length>0){
        wx.showModal({
          title: '警告',
          content:'请勿输入违法词语！',
        });
        return;
      }
      _this.sendContentAPi();
    })
  },
  sendContentAPi(){
    var _this=this;
        wx.request({
        url: this.data.baseUrl+'/2/message',
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data:{
          from_id:this.data.kefu_name,
          to_id:this.data.visitor_id,
          content:this.data.area,
          type:"kefu",
        },
        success: function(res) {
        },
        complete: function(res) {
          _this.setData({
            isDisabled: false,
          });
          var code=res.data.code;
          if(code!=200){
            wx.showModal({
              title: '提示',
              content:res.data.msg,
            });
          }else{
                var messages=_this.data.messages;
                var msg=res.data.result.data;
                msg.mes_type="kefu";
                // var message={
                //   time:msg.time,
                //   name:msg.name,
                //   avator:msg.avator
                //   content:msg.content
                // }
                messages.push(msg);

                _this.setData({
                    area:"",
                    messages: messages,
                },function(){
                  if(messages.length>_this.data.scrollSize){
                    _this.pageScrollToBottom();
                  }
                });
          }
        }
    });
  },
  sendMessage(){
    let _this=this;
    this.setData({
      isDisabled: true,
    });
    var str=_this.data.area;
    if(str.replace(/(^s*)|(s*$)/g, "")==""){
      wx.showModal({
        title: '警告',
        content:'没有输入内容！',
      });
      this.setData({
        isDisabled: false,
      });
      return;
    }
    this.doMsgSecCheck();
    //this.sendContentAPi();
  },
  onItemInput(e) {
    console.log(e.detail.value);

    this.setData({
      [e.target.dataset.field]: e.detail.value,
      isDisabled:false
    });
  },
   pageScrollToBottom: function () {
     var _this=this;
    wx.createSelectorQuery().select('.chatBox').boundingClientRect().exec((rect)=>{
      console.log(rect);
      var height=rect[0].height;
      // // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: height
      })
    });
 },
//  showArea(){
//        var _this=this;
//         wx.request({
//         url: this.data.baseUrl+'/config?key=MiniAppAudit',
//         //url: 'http://127.0.0.1:8081/config?key=MiniAppAudit',
//         success: function(res) {
//         },
//         complete: function(res) {
//           if(res.data.result!="yes"){
//             _this.setData({
//               showArea: true,
//             });
//           }
//         }
//     });
//  }
});
