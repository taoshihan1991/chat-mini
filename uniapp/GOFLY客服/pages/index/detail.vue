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
			<view class="flyNotice" v-show="messages.length==0">暂无消息记录</view>
			<view class="flyNoticeBar" v-show="noticeContent">{{noticeContent}}</view>
		</view>
		<view class="chatBoxSend">
			<view class="chatBoxSendIcons">
				<uni-icons v-on:click="uploadImage" type="image" size="30" color="#a5a5a5"></uni-icons>
			</view>
			<textarea class="chatArea" v-model="messageContent" v-on:keyup.enter.native="chatToUser" placeholder="请输入信息"></textarea>
			<view class="btnArea">
				<button v-on:click="chatToUser" type="primary">发送</button>
			</view>
		</view>
	</view>

</template>

<script>
	export default {
		data() {
			return {
				baseUrl: getApp().globalData.baseUrl,
				wsBaseUrl: getApp().globalData.wsBaseUrl,
				// baseUrl:"http://127.0.0.1:8081",
				// wsBaseUrl:"ws://127.0.0.1:8081/ws_kefu",
				messages: [],
				messageContent: "",
				sendDisabled: false,
				token: "",
				visitor_id: "",
				visitor_name: "",
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
				noticeContent:"",
			}
		},
		// 页面显示
		onLoad(options) {
			var res = uni.getStorageSync('app');
			if (res) {
				this.token = res.token;
				this.kefu_name = res.kefu_name;
			}
			this.visitor_id = options.visitor_id;
			this.checkAuth();
			this.getVisitor();
			this.getMessages();
		},
		methods: {
			getVisitor() {
				var baseUrl = this.baseUrl;
				var _this = this;
				uni.request({
					url: baseUrl + '/visitor?visitorId=' + this.visitor_id + '&token=' + _this.token,
					method: 'GET',
					success: function(res) {
						var code = res.data.code;
						if (code == 200) {
							_this.visitor_name = res.data.result.name;
							uni.setNavigationBarTitle({
								title: _this.visitor_name
							});

						}
					}
				});
			},
			getMessages() {
				uni.showLoading({
					title: "加载中..."
				});
				var baseUrl = this.baseUrl;
				var _this = this;
				uni.request({
					url: baseUrl + '/2/messages?visitor_id=' + this.visitor_id,
					method: 'GET',
					success: function(res) {
						uni.hideLoading();
						var messages = res.data.result
						for (var i in messages) {
							messages[i]['content'] = _this.replaceContent(messages[i]['content'], _this.baseUrl);
						}
						_this.onlineIntime();
						if(messages.length<=0){
							return;
						}
						_this.messages = messages;
						setTimeout(function() {
							_this.pageScrollToBottom();
						}, 1000);
					}
				});
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
						}
					}
				});
			},
			//用户实时上下线
			onlineIntime() {
				let _this = this;
				var timer = null;
				console.log(this.wsBaseUrl + "?token=" + this.token);
				uni.connectSocket({
					url: this.wsBaseUrl + "?token=" + this.token,
				});
				uni.onSocketClose((res) => {
				});
				uni.onSocketOpen((res) => {
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
						case "inputing":
							if (redata.data.from != _this.visitor_id) {
								return;
							}
							if (redata.data.content == "") {
								uni.setNavigationBarTitle({
									title: "[在线]:" + _this.visitor_name
								});
							} else {
								uni.setNavigationBarTitle({
									title: '[输入]:' + redata.data.content
								});
							}

							break;
						case "userOffline":
							_this.showNoticeBar(redata.data.name + "离线");
							if (redata.data.uid != _this.visitor_id) {
								return;
							}
							uni.setNavigationBarTitle({
								title: "[离线]:" + _this.visitor_name
							});
							break;
						case "userOnline":
							//_this.showNotice(redata.data.username + "来了");
							_this.showNoticeBar(redata.data.username + "来了");
							if (redata.data.uid != _this.visitor_id) {
								return;
							}
							uni.setNavigationBarTitle({
								title: "[在线]:" + _this.visitor_name
							});
							break;
					}
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
				this.showNotice(msg.name + ":" + msg.content);
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
				if (_this.isDisabled) {
					return
				}
				uni.showLoading({
					title: "发送中..."
				});
				_this.isDisabled = true;
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
			showNotice(msg) {
				// if (uni.getSystemInfoSync().platform == "android") {
				// 	if (window.plus) {
				// 		plus.push.createMessage(msg);
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
			uploadImage(){
				var _this=this;
				uni.chooseImage({
				    success: (chooseImageRes) => {
				        const tempFilePaths = chooseImageRes.tempFilePaths;
				        uni.uploadFile({
				            url:  _this.baseUrl + '/uploadimg?token='+ _this.token,
				            filePath: tempFilePaths[0],
				            name: 'imgfile',
				            success: (res) => {
								console.log(res);
								var data=JSON.parse(res.data)
								_this.messageContent+='img[/' + data.result.path + ']';
								_this.chatToUser();
				            }
				        });
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

	.chatBox {
		padding: 0 4px;
	}
	.chatContent a{
		text-decoration: none;
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
		margin-left: 4px;
	}

	.chatBoxMe .chatContent {
		margin-right: 4px;
	}

	.chatTime {
		text-align: center;
		color: #bbb;
		margin: 5px 0;
		font-size: 12px;
	}

	.chatArea {
		float: left;
		width: calc(100% - 80px);
		height: 38px;
		line-height: 38px;
		border:1px solid #e2e2e2;
		padding: 1px 5px;
		background: #fff;
		border-radius: 4px;
		margin-left: 5px;
	}

	.btnArea {
		float: right;
		margin-right: 5px;
	}
	.btnArea uni-button{
		width: 55px;
		height: 40px;
		line-height: 40px;
		text-align: center;
		font-size: 13px;
	}
	.chatBoxSendIcons{
		padding:0px 5px;
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
	}

	.chatContext {
		width: 100%;
		text-align: left;
		position: relative;
		padding-bottom: 75px;
	}

	.clear {
		clear: both;
	}
</style>
