<script>
	export default {
		onLaunch: function() {
		},
		onShow: function() {
		},
		onHide: function() {
		},
		globalData: {
			"baseUrl":"https://jd.sopans.com",
			"wsBaseUrl":"wss://jd.sopans.com/ws_kefu",
			// "baseUrl":"http://127.0.0.1:8081",
			// "wsBaseUrl":"ws://127.0.0.1:8081/ws_kefu"
		}
	}
 
</script>

<style>
	/*每个页面公共css */
	a{
		text-decoration: none;
	}
	.flyNotice{
		text-align: center;
		padding-top: 80px;
		color: #808080;
	}
	.flyNoticeBar{
		height: 25px;
		line-height: 25px;
		background-color: #DD524D;
		color: #fff;
		padding: 0 4px;
		position: fixed;
		top: 0px;
		left: 0px;
		right: 0px;
		z-index: 999;;
	}
</style>
