Page({
  data: {
    baseUrl:"https://gofly.sopans.com",
    //baseUrl:"http://127.0.0.1:8081",
    username:"kefu2",
    password:"123",
    timer:null,
    error: ''
  },
  login(e){
    let _this=this;
    wx.request({
        url: this.data.baseUrl+'/check',
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data:{
          username:this.data.username,
          password:this.data.password
        },
        success: function(res) {
        },
        complete: function(res) {
          wx.hideLoading();
          var code=res.data.code;
          if(code!=200){
            _this.setData({
              error: res.data.msg,
            });
          }else{
            var data={
              kefu_name:_this.data.username,
              token: res.data.result.token,
              ref_token:  res.data.result.ref_token,
            }
            console.log(data);
            wx.setStorage({
              key: 'app',
              data: JSON.stringify(data)
            });
            wx.navigateTo({ url: '/pages/index/index' });
          }
        }
    });
  },
  
  onLoad(){
    let _this=this;
  },
  onItemInput(e) {
    console.log(e.detail.value);

    this.setData({
      [e.target.dataset.field]: e.detail.value,
    });
  },
  onClear(e) {
    this.setData({
      [e.target.dataset.field]: '',
    });

  },
});
