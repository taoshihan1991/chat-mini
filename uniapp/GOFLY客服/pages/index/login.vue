<template>
	<view class="loginBox">
		<uni-forms :value="formData" ref="form">
			<uni-easyinput class="loginInput" type="text" v-model="formData.username" placeholder="请输入用户名" />
			<uni-easyinput class="loginInput" type="password" v-model="formData.password" placeholder="请输入密码" />
			<button class="loginInput" @click="submitForm" type="primary">登录</button>
		</uni-forms>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				formData: {
					username: '',
					password: ''
				},
				baseUrl: getApp().globalData.baseUrl,
				timer: null
			}
		},
		methods: {
			submitForm(form) {
				
				this.$refs.form.submit().then((res) => {
					if(this.formData.username==""||this.formData.username==""){
						uni.showModal({
							content: "请输入用户名或密码"
						});
						return;
					}
					uni.showLoading({
						title: '验证中...'
					});
					let _this = this;
					uni.request({
						url: _this.baseUrl + '/check',
						method: 'POST',
						header: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						data: {
							username: this.formData.username,
							password: this.formData.password
						},
						success: function(res) {},
						complete: function(res) {
							uni.hideLoading();
							var code = res.data.code;
							if (code != 200) {
								uni.showModal({
									content: res.data.msg
								});
							} else {
								uni.setStorageSync("app", {
									kefu_name: _this.formData.username,
									token: res.data.result.token,
									ref_token: res.data.result.ref_token,
								});
								uni.switchTab({
									url: '/pages/index/index'
								});
							}
						}
					});
				})
			}
		}
	}
</script>

<style>
	.loginBox {
		padding: 20px;
	}

	.loginInput {
		margin-bottom: 10px;
	}
</style>
