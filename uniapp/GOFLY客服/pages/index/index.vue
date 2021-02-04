<template>
	<view class="content">
		<uni-list>
		    <uni-list-item title="列表左侧带略缩图" note="列表描述信息" thumb="https://img-cdn-qiniu.dcloud.net.cn/new-page/uni.png"
		     thumb-size="lg" rightText="右侧文字"></uni-list-item>
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
			this.checkAuth();
			this.getOnlineUser();
		},
		onLoad() {
		},
		methods: {
			getOnlineUser(){
			},
			checkAuth(){
				var _this=this;
				uni.request({
					url: _this.baseUrl+'/userinfo?token='+_this.token,
					method: 'GET',
					success: function(res) {
					},
					complete: function(res) {
				
					}
				});
			},
		}
	}
</script>

<style>

</style>
