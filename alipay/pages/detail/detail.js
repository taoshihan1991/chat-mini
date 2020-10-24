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
    if(msg.id!=this.data.visitor_id){
        return;
    }
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
      this.setData({visitor_id:options.visitor_id,token:res.data.token,kefu_name:res.data.kefu_name});
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
  //
  filterTxt(){
    var _this=this;
      my.request({
					//获取access_token
					url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=yifBhtwr1lKvp5GMGLrQLxna&client_secret=2gedlLVa28Kfq9ADjVSDEihZ6VrNBK8S',
					method: 'GET',
					data: {},
					success: res => {
					//文本内容审核
						my.request({
							url:'https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token='+res.data.access_token,
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							data:{
								'text':_this.data.area
							},
							success: res => {
								console.log(res)
								if(res.data.conclusionType==1){
                   //状态为1 内容合规 没有敏感词 则提交
                   _this.sendContentAPi();
								}else{
									my.alert({
										content: '内容含有敏感信息'
									});
								}
							},
							fail: () => {
								console.log(Error)
							},
							complete: () => {}
						});
					},
					fail: () => {
						console.log(Error)
					},
					complete: () => {}
				});
  },
  sendContentAPi(){
    var _this=this;
        my.request({
        url: this.data.baseUrl+'/2/message',
        method: 'POST',
        headers: {
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
          my.hideLoading();
          var code=res.data.code;
          if(code!=200){
            my.alert({content: res.data.msg});
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
                    _this.pageScrollToBottom();
                });
          }
        }
    });
  },
  sendMessage(){
    let _this=this;
    this.filterTxt();
  },
  onItemInput(e) {
    console.log(e.detail.value);

    this.setData({
      [e.target.dataset.field]: e.detail.value,
    });
  },
   pageScrollToBottom: function () {
     var _this=this;
    my.createSelectorQuery().select('.chatBox').boundingClientRect().exec((rect)=>{
      console.log(rect);
      var height=rect[0].height;
      // // 使页面滚动到底部
      my.pageScrollTo({
        scrollTop: height
      })
    });
    console.log(222);
 },
});
