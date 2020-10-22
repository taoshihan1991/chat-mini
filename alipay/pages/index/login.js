Page({
  data: {
    //baseUrl:"https://gofly.sopans.com",
    baseUrl:"http://127.0.0.1:8081",
    username:"",
    password:""
  },
  login(e){
    let _this=this;
    my.request({
        url: this.data.baseUrl+'/check',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data:{
          username:this.data.username,
          password:this.data.password
        },
        success: function(res) {
        },
        complete: function(res) {
          my.hideLoading();
          var code=res.data.code;
          if(code!=200){
            my.alert({content: res.data.msg});
          }else{
            my.setStorageSync({
              key: 'app',
              data: {
                token: res.data.result.token,
                ref_token:  res.data.result.ref_token,
              }
            });
            my.navigateTo({ url: '/pages/index/index' });
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
