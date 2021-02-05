<template>
	<view class="chatBox">
		<view v-for="v in messages" v-bind:class="{'chatBoxMe': v.mes_type=='kefu'}">
			<view class="chatTime" v-bind:class="{'chatTimeHide': v.show_time==false}">{{v.time}}</view>
			<view class="chatLittle">
				<image class="flyAvatar" :src="baseUrl+v.avator"></image>
			</view>
			<view class="chatBig">
				<view class="chatUser">{{v.name}}</view>
				<view class="chatContent" v-html="v.content"></view>
			</view>
			<view class="clear"></view>
		</view>
		<view class="bottom"></view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				baseUrl: "https://gofly.sopans.com",
				wsBaseUrl: "wss://gofly.sopans.com/ws_kefu",
				// baseUrl:"http://127.0.0.1:8081",
				// wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
				messages: [],
				token: "",
				visitor_id: "",
				kefu_name: "",
				isDisabled: false,
				area: "",
				showArea: false,
				scrollSize: 2,
			}
		},
		// 页面显示
		onLoad(options) {
			var res = uni.getStorageSync('app');
			console.log(res);
			if (res) {
				this.token = res.token;
				this.kefu_name = res.kefu_name;
				this.visitor_id = options.visitor_id
			}
			var baseUrl = this.baseUrl;
			uni.showLoading({
				title: "加载中..."
			});
			var _this = this;
			uni.request({
				url: baseUrl + '/2/messages?visitor_id=' + options.visitor_id,
				method: 'GET',
				success: function(res) {
					uni.hideLoading();
					_this.messages = res.data.result;
					if (_this.messages.length > _this.scrollSize) {
						_this.pageScrollToBottom();
					}
					_this.onlineIntime();
				}
			});
		},
		methods: {
			//用户实时上下线
			onlineIntime() {
				let _this = this;
				var timer = null;
				console.log(this.wsBaseUrl + "?token=" + this.token);
				uni.connectSocket({
					url: this.wsBaseUrl + "?token=" + this.token,
				});
				uni.onSocketClose((res) => {
					console.log("WebSocket 连接断开");
				});
				uni.onSocketOpen((res) => {
					console.log("WebSocket 连接已打开");
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
						case "message":
							_this.recvMessage(redata.data);
							break;
						case "notice":
							break;
					}
					//console.log('收到服务器内容 ：' + res.data)
				});


			},
			recvMessage(msg) {
				var _this = this;
				if (msg.id != this.visitor_id) {
					return;
				}
				var messages = this.messages;
				messages.push(msg);
				this.messages = messages;
				if (messages.length > _this.scrollSize) {
					_this.pageScrollToBottom();
				}
			},
			pageScrollToBottom: function() {
				this.$nextTick(() => {
					console.log(111);
					uni.pageScrollTo({
						scrollTop: 9999999
					})
				});
			
			},
		}
	}
</script>

<style>
	.flyAvatar {
		display: inline-block;
		box-sizing: border-box;
		text-align: center;
		color: #fff;
		background: #C0C4CC;
		width: 40px;
		height: 40px;
		line-height: 40px;
		border-radius: 50%;
		margin-top: 5px;
	}

	.chatUser {
		line-height: 24px;
		font-size: 12px;
		white-space: nowrap;
		color: #999;
		text-align: left;
	}

	.chatLittle {
		width: 12.5%;
		float: left;
	}

	.chatBig {
		width: 87.5%;
		float: right;
	}

	.chatBoxMe .chatContent {
		float: right;
		background-color: rgb(152, 225, 101);
		border: 1px solid rgb(145, 215, 96);
	}

	.chatBoxMe .chatContent:after {
		border-top-color: rgb(152, 225, 101);
	}

	.chatBoxMe .chatLittle {
		width: 12.5%;
		float: right;
		text-align: right;
	}

	.chatBoxMe .chatUser {
		text-align: right
	}

	.chatBoxMe .chatContent:after {
		left: auto;
		right: -10px;
	}

	.chatContent {
		background-color: rgb(166, 212, 242);
		color: #000;
		border: 1px solid rgb(152, 199, 230);
		padding: 8px 15px;
		word-break: break-all;
		position: relative;
		border-radius: 5px;
		display: inline-block;
		margin-left: 6px;
	}

	.chatTime {
		text-align: center;
		color: #bbb;
		margin: 5px 0;
		font-size: 12px;
	}

	.clear {
		clear: both;
	}
</style>
