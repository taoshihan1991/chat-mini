<template>
	<view>
		<button class="mInput" type="default" @click="logout">退出登录</button>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			logout(){
				uni.removeStorageSync("app");
				uni.navigateTo({
					url: '/pages/index/login'
				});
			}
		}
	}
</script>

<style>
	.mInput {
		margin-top: 10px;
	}
</style>
