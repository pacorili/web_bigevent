//注意:每次调用 $.get() 或 $.post() 或 $.ajax()的时候
//会先调用ajaxPrefilter这个函数
//在这个函数中，可以拿到我们给Ajax提供的配置对象
//options 是调Ajax时，传递的配置对象
$.ajaxPrefilter(function (options) {
  //在发起真正的Ajax请求前，统一拼接请求的根路径
  options.url = "http://www.liulongbin.top:3007" + options.url;
  console.log(options.url);

  //同一为有权限的接口设置 headers 请求头
  if (options.url.indexOf("/my/") !== -1) {
    options.headers = {
      Authorization: localStorage.getItem("token") || "",
    };
  }

  //全局同一挂载 complete 回调函数
  options.complete = function(res){
    //   console.log("执行了 complete 回调");
    //   console.log(res);
    //在 complete  回调函数中，可以使用 res.responseJSON 拿到服务器响应回来的数据
    if (
      res.responseJSON.status === 1 &&
      res.responseJSON.message === "身份认证失败！"
    ) {
      //1.强制清空 token
      localStorage.removeItem("token");
      //2.强制跳转到登录页面
      location.href = "/paco_code/login.html";
    }
  };
});
