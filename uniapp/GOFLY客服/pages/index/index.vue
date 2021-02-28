<template>
	<view class="content">
		<uni-list>
			<uni-list-item v-for="item in visitors" :key="item.uid" :title="item.username" :note="item.last_message" :thumb="baseUrl+item.avator"
			 thumb-size="lg" clickable @click="chatVisitor($event,item.uid)"></uni-list-item>
		</uni-list>
		<view class="flyNotice" v-show="visitors.length==0">暂无在线访客</view>
		<view class="flyNoticeBar" v-show="noticeContent">{{noticeContent}}</view>
	</view>

</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				baseUrl: "https://gofly.sopans.com",
				wsBaseUrl: "wss://gofly.sopans.com/ws_kefu",
				// baseUrl:"http://127.0.0.1:8081",
				// wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
				visitors: [],
				token: "",
				timer: null,
				wsOpen: false,
				noticeContent:"",
			}
		},
		// 页面显示
		onShow() {
			let _this = this;
			let res = uni.getStorageSync('app');
			console.log(res);
			if (res) {
				this.token = res.token;
			}
			this.checkAuth();
			this.getOnlineUser();
		},
		onLoad() {
			this.initPush();
		},
		methods: {
			//用户实时上下线
			onlineIntime() {
				var _this = this;
				var timer = null;
				uni.connectSocket({
					url: this.wsBaseUrl + "?token=" + this.token,
				});
				uni.onSocketClose((res) => {
					clearInterval(timer);
					console.log("WebSocket 连接断开");
				});
				uni.onSocketOpen((res) => {
					console.log("WebSocket 连接已打开");;
					let _this = this;
					let mes = {}
					mes.type = "ping";
					mes.data = "";
					timer = setInterval(function() {
						uni.sendSocketMessage({
							data: JSON.stringify(mes),
						});
					}, 5000)

				});
				uni.onSocketMessage((res) => {
					var redata = JSON.parse(res.data);
					switch (redata.type) {
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
			getOnlineUser() {
				let _this = this;
				var baseUrl = this.baseUrl;
				uni.request({
					url: baseUrl + '/visitors_kefu_online?token=' + _this.token,
					method: 'GET',
					success: function(res) {
						console.log(res);
						if (!res.data.result) {
							return;
						}
						_this.visitors = res.data.result;
					},
					fail: function(res) {}
				});
			},
			addOnlineUser(retData) {
				var visitors = this.visitors;
				var flag = false;
				for (var i = 0; i < visitors.length; i++) {
					if (visitors[i].uid == retData.uid) {
						flag = true;
					}
				}
				if (!flag) {
					visitors.unshift(retData);
				}
				this.visitors = visitors;
				this.showNoticeBar(retData.username+"来了");
				//this.showNotice(retData.username+"来了");
			},
			//处理当前在线用户列表
			removeOfflineUser: function(retData) {
				var visitors = this.visitors;
				for (var i = 0; i < visitors.length; i++) {
					if (visitors[i].uid == retData.uid) {
						visitors.splice(i, 1);
					}
				}
				this.visitors = visitors;
				this.showNoticeBar(retData.name+"离线");
			},
			//点击
			chatVisitor(e, visitorId) {
				uni.navigateTo({
					url: '/pages/index/detail?visitor_id=' + visitorId
				})
			},
			recvMessage(msg) {
				var visitors = this.visitors;
				for (let i = 0; i < visitors.length; i++) {
					if (visitors[i].uid == msg.id) {
						visitors[i].last_message = msg.content;
					}
				}
				this.visitors = visitors;
				this.showNotice(msg.name+":"+ msg.content);
			},
			initPush(){
				var _this=this;
				//#ifdef APP-PLUS
				    // 页面加载时触发  
					setTimeout(function(){
						if(plus){
							var pinf = plus.push.getClientInfo();
							var cid = pinf.clientid;//客户端标识 
							console.log("app client_id:"+cid);
							_this.registerClient(cid);
							 //监听系统通知栏消息点击事件
							 plus.push.addEventListener('click', function(msg){  
								 console.log("app click");
							     //处理点击消息的业务逻辑代码  
							 }, false);  
							 //监听接收透传消息事件  
							 plus.push.addEventListener('receive', function(msg){  
								 console.log(msg);;
							     //处理透传消息的业务逻辑代码  
								 var options = {cover:false};
								 plus.push.createMessage(msg,"RemoteMSG",options);
							 }, false);
						}
					},4000);
				//#endif
			},
			showNotice(msg){
				// if (uni.getSystemInfoSync().platform == "android") {
				// 	if(window.plus){
				// 		var options = {cover:false};
				// 		plus.push.createMessage(msg,"LocalMSG",options);
				// 	}
				// 	if(uni.vibrate){
				// 		uni.vibrate({
				// 		    success: function () {
				// 		        console.log('success');
				// 		    }
				// 		});
				// 	}
				// }
			},
			showNoticeBar(msg){
				var _this=this;
				_this.noticeContent=msg;
				setTimeout(function(){
					_this.noticeContent="";
				},3000);
			},
			checkAuth() {
				var _this = this;
				uni.request({
					url: _this.baseUrl + '/userinfo?token=' + _this.token,
					method: 'GET',
					success: function(res) {
						var code = res.data.code;
						if (code != 200) {
							uni.navigateTo({
								url: '/pages/index/login'
							});
						} else {
							_this.onlineIntime();
						}
					}
				});
			},
			registerClient(clientId) {
				let _this = this;
				var baseUrl = this.baseUrl;
				uni.request({
					url: baseUrl + '/kefuinfo_client?token='+_this.token,
					data:{client_id:clientId},
					method: 'POST',
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					success: function(res) {
						console.log(res);
					}
				});
			},
		}
	}
</script>

<style>

</style>
