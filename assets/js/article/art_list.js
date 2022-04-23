//先定义jQuery入口函数
$(function () {
  let layer = layui.layer;
  let form = layui.form;
  let laypage = layui.laypage;

  //定义美化时间的过滤器
  template.defaults.imports.dataFormat = function (date) {
    const dt = new Date(date);

    let y = dt.getFullYear();
    let m = padZero(dt.getMonth() + 1);
    let d = padZero(dt.getDate());

    let hh = padZero(dt.getHours());
    let mm = padZero(dt.getMinutes());
    let ss = padZero(dt.getSeconds());

    return y + "-" + m + "-" + d + "-" + " " + hh + ":" + mm + ":" + ss;
  };

  //定义补零的函数
  function padZero(n) {
    return n > 9 ? n : "0" + n;
  }

  //定义一个查询对象（请求对象）
  //将来发起请求的时候，需要把这个请求参数对象提交到服务器
  let q = {
    pagenum: 1, //页码值，默认请求第一页的数据
    pagesize: 2, //每页显示几条数据，默认每页显示2条
    cate_id: "", //文章分类的 Id
    state: "", //文章的状态，可选值有：已发布、草稿
  };

  initTable();
  initCate();

  //发起请求 获取文章列表数据 并渲染
  //获取文章列表数据的方法
  function initTable() {
    $.ajax({
      method: "GET",
      url: "/my/article/list",
      data: q,
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取文章列表失败");
        }
        // console.log('ok');
        // console.log(res);
        //使用模板引擎渲染页面的数据
        let htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
        //调用渲染分页的方法
        renderPage(res.total);
      },
    });
  }

  //初始化文章分类的方法 并渲染
  function initCate() {
    $.ajax({
      method: "GET",
      url: "/my/article/cates",
      success: function (res) {
        if (res.status !== 0) {
          return layer.msg("获取分类数据失败");
        }
        //调用模板引擎 渲染分类的可选项
        let htmlStr = template("tpl-cate", res);

        $("[name=cate_id]").html(htmlStr);
        //通知layui 重新渲染表单区域的UI结构
        form.render();
      },
    });
  }

  // 为筛选表单绑定 submit 提交事件 把数据渲染过来
  $("#form-search").on("submit", function (e) {
    e.preventDefault();
    // 通过属性选择器 拿到表单里的值
    //获取表单中选中项的值
    let cate_id = $("[name=cate_id]").val();
    let state = $("[name=state]").val();
    //为查询参数对象 q 中，对应的属性赋值
    q.cate_id = cate_id;
    q.state = state;
    //根据最新的筛选条件 重新渲染表单数据
    initTable();
  });

  //定义渲染分页的方法
  function renderPage(total) {
    //调用  laypage.render() 方法来渲染分页的结构
    laypage.render({
      elem: "pageBox", // 分页容器的 Id
      count: total, // 总数据条数
      limit: q.pagesize, //每页显示几条数据
      curr: q.pagenum, //设置默认被选中的分页
      layout: ["count", "limit", "prev", "page", "next", "skip"],
      limits: [2, 3, 5, 10],
      //分页发生切换时，触发jump回调
      //触发 jump回调的方式有两种：
      //1.点击页码的时候会触发 jump 回调
      //2.只要调用了 laypage.render() 方法，就会触发jump回调
      jump: function (obj, first) {
        //可以通过 first 的值，来判断时通过哪种方式，触发的 jump 回调
        //如果 first 的值为 true,证明是方式2触发的
        //如果 first 的值为undefined ，证明是方式1触发的
        console.log(first);
        console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
        //把最新的页码值，赋值到 q 这个查询参数对象中
        q.pagenum = obj.curr;
        //把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
        q.pagesize = obj.limit;
        //根据最新的q获取对应的数据列表，并渲染表格
        if (!first) {
          initTable();
        }
      },
    });
  }

  //通过代理的形式，为删除按钮绑定点击事件处理函数
  $("tbody").on("click", ".btn-delete", function () {
      //获取删除按钮的个数
      let len = $(".btn-delete").length;
    //   console.log(len);
    // 获取到文章的 id
    let id = $(this).attr("data-id");
    //询问用户是否要删除数据
    layer.confirm("确认删除?", { icon: 3, title: "提示" }, function (index) {
      //发 ajax 删除数据
      $.ajax({
        method: "GET",
        url: "/my/article/delete/" + id,
        success: function (res) {
          if (res.status !== 0) {
            return layer.msg("删除文章失败");
          }
          layer.msg("删除文章成功");
          //当数据删除完成后 ，需要判断这页中，是否还有剩余的数据
          //如果没有剩余的数据，则让页码值 -1 之后，再重新调用 initTable() 方法
          if(len===1){
              //如果len 的值等于 1  ,证明删除完毕之后，页面上就没有任何数据了
              //页码值最小必须是 1
              q.pagenum = q.pagenum===1?1:q.pagenum-1
          }
          initTable();
        },
      });

      layer.close(index);
    });
  });
});
