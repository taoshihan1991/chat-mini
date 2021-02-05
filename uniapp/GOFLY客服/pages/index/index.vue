<template>
	<view class="content">
		<uni-list>
		    <uni-list-item v-for="item in visitors" key="item.uid" :title="item.username" :note="item.last_message" :thumb="baseUrl+item.avator"
		     thumb-size="lg" clickable @click="chatVisitor($event,item.uid)" ></uni-list-item>
		</uni-list>
	</view>

</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				baseUrl:"https://gofly.sopans.com",
				wsBaseUrl:"wss://gofly.sopans.com/ws_kefu",
				// baseUrl:"http://127.0.0.1:8081",
				// wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
				visitors:[],
				token:"",
				timer:null,
				wsOpen:false,
			}
		},
		// 页面显示
		onShow() {
			let _this=this;
			let res = uni.getStorageSync('app');
			console.log(res);
			if(res){
			  this.token=res.token;
			}
			this.checkAuth();
			this.getOnlineUser();
		},
		onLoad() {
		},
		methods: {
			//用户实时上下线
			onlineIntime(){
			  var _this=this;
			  var timer=null;
			  uni.connectSocket({
			    url: this.wsBaseUrl+"?token="+this.token,
			  });
			  uni.onSocketClose((res) => {
			    clearInterval(timer);
			    console.log("WebSocket 连接断开");
			  });
			  uni.onSocketOpen((res) => {
			        console.log("WebSocket 连接已打开");;
			          let _this=this;
			          let mes = {}
			          mes.type = "ping";
			          mes.data = "";
			          timer=setInterval(function () {
			                uni.sendSocketMessage({
			                    data: JSON.stringify(mes),
			                });
			          },5000)
			
			  });
			  uni.onSocketMessage((res) => {
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
			getOnlineUser(){
				let _this=this;
				var baseUrl=this.baseUrl;
				uni.request({
					url: baseUrl+'/visitors_kefu_online?token='+_this.token,
					method: 'GET',
					success: function(res) {
						console.log(res);
						if(!res.data.result){
							return;
						}
						_this.visitors=res.data.result;
					},
					fail: function(res) {
					}
				});
			},
			addOnlineUser(retData){
			    var visitors=this.visitors;
			    var flag=false;
			    for(var i=0;i<visitors.length;i++){
			        if(visitors[i].uid==retData.uid){
			            flag=true;
			        }
			    }
			    if(!flag){
			        visitors.unshift(retData);
			    }
			    this.visitors= visitors;
			},
			  //处理当前在线用户列表
			removeOfflineUser:function (retData) {
			  var visitors=this.visitors;
			    for(var i=0;i<visitors.length;i++){
			        if(visitors[i].uid==retData.uid){
			            visitors.splice(i,1);
			        }
			    }
			    this.visitors=visitors;
			},
			//点击
			chatVisitor(e,visitorId){
				console.log(visitorId);
			  uni.navigateTo({ url: '/pages/index/detail?visitor_id='+visitorId })
			},
			checkAuth(){
				var _this=this;
				uni.request({
					url: _this.baseUrl+'/userinfo?token='+_this.token,
					method: 'GET',
					success: function(res) {
						var code=res.data.code;
						if(code!=200){
						  uni.navigateTo({ url: '/pages/index/login' });
						}else{
						   _this.onlineIntime();
						}
					}
				});
			},
		}
	}
</script>

<style>

</style>
