<template>
	<view class="chatContext">
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
		</view>
		<view class="chatBoxSend">
			<textarea class="chatArea" v-model="messageContent" v-on:keyup.enter.native="chatToUser" placeholder="请输入信息"></textarea>
			<view class="btnArea">
				<button v-on:click="chatToUser" type="primary" size="mini">发送</button>
			</view>
		</view>
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
				messageContent: "",
				sendDisabled: false,
				token: "",
				visitor_id: "",
				kefu_name: "",
				isDisabled: false,
				area: "",
				showArea: false,
				scrollSize: 2,
				faceTitles: ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]",
					"[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]",
					"[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]",
					"[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]",
					"[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]",
					"[蜡烛]", "[蛋糕]"
				],
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
					var messages = res.data.result
					for (var i in messages) {
						messages[i]['content'] = _this.replaceContent(messages[i]['content'], _this.baseUrl);
					}
					console.log(messages);
					_this.messages = messages;
					setTimeout(function() {
						_this.pageScrollToBottom();
					}, 2000);
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
				msg.mes_type = msg.is_kefu == "yes" ? "kefu" : "visitor";
				msg.content = _this.replaceContent(msg.content, _this.baseUrl);
				var messages = this.messages;
				messages.push(msg);
				this.messages = messages;
				_this.pageScrollToBottom();
			},
			pageScrollToBottom: function() {
				this.$nextTick(() => {
					uni.pageScrollTo({
						scrollTop: 99999999999999999
					})
				});
			},
			placeFace() {
				var faces = [];
				for (var i = 0; i < this.faceTitles.length; i++) {
					faces[this.faceTitles[i]] = "/static/images/face/" + i + ".gif";
				}
				return faces;
			},
			replaceContent(content, baseUrl) { // 转义聊天内容中的特殊字符
				if (typeof baseUrl == "undefined") {
					baseUrl = "";
				}
				var faces = this.placeFace();
				var html = function(end) {
					return new RegExp('\\n*\\[' + (end || '') +
						'(pre|div|span|p|table|thead|th|tbody|tr|td|ul|li|ol|li|dl|dt|dd|h2|h3|h4|h5)([\\s\\S]*?)\\]\\n*', 'g');
				};
				content = (content || '').replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
					.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;') // XSS
					.replace(/face\[([^\s\[\]]+?)\]/g, function(face) { // 转义表情
						var alt = face.replace(/^face/g, '');
						return '<img alt="' + alt + '" title="' + alt + '" src="' + baseUrl + faces[alt] + '">';
					})
					.replace(/img\[([^\s\[\]]+?)\]/g, function(face) { // 转义图片
						var src = face.replace(/^img\[/g, '').replace(/\]/g, '');;
						return '<img @click="bigPic(\"' + baseUrl + src + '\",true)" src="' + baseUrl + src +
							'" style="max-width: 100%"/></div>';
					})
					.replace(/file\[([^\s\[\]]+?)\]/g, function(face) { // 转义图片
						var src = face.replace(/^file\[/g, '').replace(/\]/g, '');;
						return '<div class="folderBtn" onclick="window.open(\'' + src + '\')"  style="font-size:25px;"/></div>';
					})
					.replace(/\[([^\s\[\]]+?)\]+link\[([^\s\[\]]+?)\]/g, function(face) { // 转义超链接
						var text = face.replace(/link\[.*?\]/g, '').replace(/\[|\]/g, '');
						var src = face.replace(/^\[([^\s\[\]]+?)\]+link\[/g, '').replace(/\]/g, '');
						return '<a href="javascript:void(0)" onclick="window.open(\'' + src + '\')" />【' + text + '】</a>';
					})
					.replace(/\n/g, '<br>') // 转义换行

				return content;
			},
			bigPic(src, isVisitor) {
				if (isVisitor) {
					window.open(src);
					return;
				}
			},
			//发送给客户
			chatToUser() {
				var _this = this;
				this.messageContent = this.messageContent.trim("\r\n");
				if (this.messageContent == "" || this.messageContent == "\r\n" || this.currentGuest == "") {
					uni.showModal({
						content: "内容不能为空"
					});
					return;
				}
				uni.showLoading({
					title: "发送中..."
				})
				uni.request({
					url: _this.baseUrl + '/2/message',
					method: 'POST',
					header: {
						'Content-Type': 'application/x-www-form-urlencoded'
					},
					data: {
						from_id: _this.kefu_name,
						to_id: _this.visitor_id,
						content: _this.messageContent,
						type: "kefu",
					},
					success: function(res) {
						_this.isDisabled = false,
							uni.hideLoading();
						var code = res.data.code;
						if (code != 200) {
							uni.showModal({
								content: res.data.msg
							});
						} else {
							_this.messageContent = "";
							// var messages = _this.messages;
							// var msg = res.data.result.data;
							// msg.mes_type = "kefu";
							// messages.push(msg);
							_this.pageScrollToBottom();
						}
					}
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

	.chatArea {
		float: left;
		width: 70%;
		height: 50px;
		margin: 4px 0 0 4px;
		border-color: #C0C4CC;
		padding: 1px 5px;
		background: #fff;
		border-radius: 4px;
	}

	.btnArea {
		width: 20%;
		float: right;
		margin-top: 15px;
	}

	.visitorFaceBox {
		position: absolute;
		bottom: 70px;
	}

	.chatBoxSend {
		background: #f5f5f5;
		position: fixed;
		bottom: 0px;
		left: 0px;
		width: 100%;
		height: 70px;
	}

	.chatContext {
		width: 100%;
		text-align: left;
		position: relative;
		padding-bottom: 70px;
	}

	.clear {
		clear: both;
	}
</style>
