<template>
	<view class="content">
		<uni-list>
			<uni-list-item v-for="item in visitors" :key="item.id" :note="showLastMessage(item.last_message)+'\n'+formatTime(item.updated_at)" :title="item.id+'|'+item.username"  :thumb="baseUrl+item.avator"
			 thumb-size="lg" clickable @click="chatVisitor($event,item.visitor_id)"></uni-list-item>
		</uni-list>
		<view class="flyNotice" v-show="visitors.length==0">暂无数据</view>
		<view class="flyNoticeBar" v-show="noticeContent">{{noticeContent}}</view>
	</view>

</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',
				baseUrl: getApp().globalData.baseUrl,
				wsBaseUrl: getApp().globalData.wsBaseUrl,
				// baseUrl:"http://127.0.0.1:8081",
				// wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
				visitors: [],
				token: "",
				timer: null,
				wsOpen: false,
				noticeContent:"",
				page:1,
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
			this.getOnlineUser(this.page);
		},
		onLoad() {
		},
		onPullDownRefresh(){
			console.log('refresh');
			this.getNewOnlineUser(1)
			setTimeout(function () {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onReachBottom(){
			console.log('1');
			this.page++;
			this.getOnlineUser(this.page)
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
						case "userOnline":
							_this.showNoticeBar(redata.data.username+"来了");
							break;
						case "userOffline":
							_this.showNoticeBar(redata.data.name+"离线");
							break;
					}
				});
			},
			getOnlineUser(page) {
				let _this = this;
				var baseUrl = this.baseUrl;
				uni.request({
					url: baseUrl + '/visitors?page='+page+'&pagesize=14&token=' + _this.token,
					method: 'GET',
					success: function(res) {
						console.log(res);
						if (!res.data.result.list) {
							return;
						}
						var list=res.data.result.list
						if(_this.visitors.length==0){
							_this.visitors=list;
						}else{
							_this.visitors=_this.visitors.concat(_this.visitors,list);
						}
						_this.visitors=_this.removeRepeat(_this.visitors);
					},
					fail: function(res) {}
				});
			},
			getNewOnlineUser(page) {
				let _this = this;
				var baseUrl = this.baseUrl;
				uni.request({
					url: baseUrl + '/visitors?page='+page+'&pagesize=14&token=' + _this.token,
					method: 'GET',
					success: function(res) {
						if (!res.data.result.list) {
							return;
						}
						var list=res.data.result.list
						_this.visitors=list;
					},
				});
			},
			//点击
			chatVisitor(e, visitorId) {
				uni.navigateTo({
					url: '/pages/index/detail?visitor_id=' + visitorId
				})
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
			removeRepeat(arr){
				var i = 0,
					j = arr.length,
					cache = {},
					key, result = [];
				for (; i < j; i++) {
					key = arr[i].id;
					key = typeof(key) + key;
					if (!cache[key]) {
						cache[key] = 1;
						result.push(arr[i]);
					}
				}
				return result;

			},
			showLastMessage(mes){
				if(mes==""){
					return "无消息";
				}
				return mes
			},
			formatTime(time, fmt) {
				if (time == null) {
					return;
				}
				var fmt = fmt ? fmt : 'yyyy-MM-dd hh:mm:ss';
				var time = new Date(time);
				var z = {
						M: time.getMonth() + 1, 
						d: time.getDate(), 
						h: time.getHours(),
						m: time.getMinutes(),
						s: time.getSeconds()
					};
				fmt = fmt.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
						return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2);
					});
				return fmt.replace(/(y+)/g, function(v) {
						return time.getFullYear().toString().slice(-v.length);
					});
			}
		}
	}
</script>

<style>

</style>
