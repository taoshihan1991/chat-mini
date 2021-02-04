<template>
    <view class="">
        <uni-forms :value="formData" ref="form">
            <uni-forms-item label="用户名" name="name">
                <uni-easyinput type="text" v-model="formData.name" placeholder="请输入姓名" />
            </uni-forms-item>
			<uni-forms-item label="密码" name="password">
			    <uni-easyinput type="text" v-model="formData.password" placeholder="请输入密码" />
			</uni-forms-item>
            <button @click="submitForm">Submit</button>
        </uni-forms>
    </view>
</template>

<script>
	export default {
		data() {
			return {
				formData:{
					name:'',
					password:''
				},
			}
		},
		methods: {
			submitForm(form) {
				// 手动提交表单
				this.$refs.form.submit().then((res)=>{
					console.log('表单返回得值：', res)
				})
			}
		}
	}
</script>

<style>
	.uni-input-border,
	.uni-textarea-border {
		flex: 1;
		font-size: 14px;
		color: #666;
		border: 1px #e5e5e5 solid;
		border-radius: 5px;
		/* #ifndef APP-NVUE */
		box-sizing: border-box;
		/* #endif */
	}

	.uni-input-border {
		padding: 0 10px;
		height: 35px;
	}

	.uni-textarea-border {
		padding: 10px;
		height: 80px;
	}

	.label-box {
		margin-right: 10px;
	}

	.transform-scale {
		transform: scale(0.7);
	}

	.button {
		margin: 5px 10px;
	}
</style>
