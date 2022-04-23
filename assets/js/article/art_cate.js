//调用 jQuery 入口函数
$(function () {
  var layer = layui.layer;
  var form = layui.form

  initArtCateList();

  //获取文章分类的列表
  function initArtCateList() {
    $.ajax({
      method: "GET",
      url: "/my/article/cates",
      success: function (res) {
        //接收两个参数，
        //1.是模板的 id，注意不用#
        //2.模板的数据
        let htmlStr = template("tpl-table", res);
        $("tbody").html(htmlStr);
      },
    });
  }

  //制作添加类别的弹出层
  //为添加类别按钮绑定点击事件
  let indexAdd = null;
  $("#btnAddCate").on("click", function () {
    indexAdd = layer.open({
      type: 1,
      area: ["500px", "250px"],
      title: "添加文章分类",
      content: $("#dialog-add").html(),
    });
  });

  //因为form表单是动态添加的，点击按钮才有form表单，所以直接选择form 表单选不上
  //通过代理的形式为 form-add表单绑定submit事件
  $("body").on("submit", "#form-add", function (e) {
    e.preventDefault();
    $.ajax({
      method: "POST",
      url: "/my/article/addcates",
      //请求体通过data指定，获取表单里的数据
      data: $(this).serialize(),
      //指定success 成功的回调函数
      success: function (res) {
        if (res.status !== 0) {
          // console.log(res);
          return layer.msg("新增分类失败");
        }
        //成功之后 获取数据 上面的函数
        initArtCateList();
        layer.msg("新增分类成功");
        // 根据索引，关闭对应的弹出层
        layer.close(indexAdd);
      },
    });
  });


  //通过代理的形式，为 btn-edit 按钮绑定点击事件
  let indexEdit = null
  $("tbody").on("click", ".btn-edit",function(e) {
    //弹出一个修改文章信息的层
     indexEdit = layer.open({
       type: 1,
       area: ["500px", "250px"],
       title: "修改文章分类",
       content: $("#dialog-edit").html(),
     });

     var id = $(this).attr("data-id");
    //  console.log(id);
    //发起请求 获取对应分类的数据
    $.ajax({
      method: "GET",
      url: "/my/article/cates/"+id,
      success:function (res) {
        // console.log(res);
        form.val("form-edit",res.data);
      }
    });
  });


  //通过代理的形式，为修改分类的表单绑定 submit 事件
  $("body").on("submit","#form-edit",function(e){
    e.preventDefault();
    $.ajax({
      method: "POST",
      url: "/my/article/updatecate",
      //快速拿到表单中的数据
      data:$(this).serialize(),
      success:function(res){
        if (res.status !== 0) {
          return layer.msg("更新分类信息失败");
        }
        //成功之后 获取数据 上面的函数
        initArtCateList();
        layer.msg("更新分类信息成功");
        // 根据索引，关闭对应的弹出层
        layer.close(indexEdit);
      }
    });
  });

  //删除按钮
  //通过代理模式，为删除按钮绑定点击事件
  $("tbody").on("click", ".btn-delete",function(e){
    //attr('')获取那个属性的值
    //拿到要删除数据的id
    let id = $(this).attr("data-id");
    //弹出框 提示用户是否要删除
    layer.confirm("确认删除?", { icon: 3, title: "提示" }, function (index) {
      //发请求调用数据
      $.ajax({
        method: "GET",
        url: "/my/article/deletecate/"+id,
        //监听success 成功的回调函数
        success: function (res) {
          if(res.status !== 0){
            return layer.msg("删除文章分类失败")
          }
          layer.msg("删除文章分类成功");
          //关闭删除的层
          layer.close(index);
          //刷新列表数据
          initArtCateList();
        }
      });
      
    });
  });
});
