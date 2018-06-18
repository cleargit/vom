layui.use(['form','layedit','flow'],function () {
    var $=layui.jquery,
        form=layui.form,
        flow=layui.flow,
        layedit=layui.layedit;

    var editIndex = layedit.build('remarkEditor', {
        height: 150,
        tool: ['link', '|','strong','italic', 'del','left', 'face', 'right', '|', 'center'],
    });
    var arrt=window.location.href.split('?')[1];
    var aid=0;
    if (typeof(arrt) != "undefined"){
        aid=arrt.split('=')[1];
    }




    layui.form.verify({
        content: function (value) {
            value = $.trim(layedit.getText(editIndex));
            if (value == "") return "至少得有一个字吧";
            layedit.sync(editIndex);
        }
    });

    flow.load({
        elem: '.blog-comment', //流加载容器
        isAuto: false,
        done: function(page,next) {
            $.ajax({
                type: 'GET',
                data: {aid:aid,page:page-1,size:'5'},
                url: "../bbs/get.do",
                success:function(result) {
                    if (result.code==0) {
                        var msgs = result.data;
                        var lis = [];
                        for (var i=0; i<msgs.length; i++) {
                            var html = '<li>'+
                                '<div class="comment-parent">'+
                                '<img src="'+msgs[i].img+'"/>'+
                                '<div class="info">'+
                                '<span class="username">'+msgs[i].name+'</span>'+
                                '</div>'+
                                '<div class="content">'+
                                msgs[i].content+
                                '</div>'+
                                '<p class="info">'+
                                '<span class="time"><i class="fa fa-clock-o"></i>&nbsp;'+msgs[i].time+'</span>'+
                                '<span class="dh">'+
                                '<a class="btn-dzan" href="javascript:dzan(\''+msgs[i].id+'\');" id="dzan_'+msgs[i].id+'"><img src="images/zan.png"></img>'+msgs[i].dzan+'</a>'+
                                '<a class="btn-reply" href="javascript:btnReplyClick(\''+msgs[i].isk+'\')" id="a_'+msgs[i].isk+'");"><img src="images/huifu.png"></img>回复</a>'+
                                '</span>'+
                                '</p>'+
                                '</div>'+
                                '<hr />';
                            var cs = msgs[i].list;
                            if (cs!=null && cs.length>0) {
                                for (var j=0; j<cs.length; j++) {
                                    html += '<div class="comment-child">'+
                                        '<img src="'+cs[j].img+'" alt="Absolutely" />'+
                                        '<div class="info">'+
                                        '<span class="username">'+cs[j].name+'</span><span class="contentchild">'+cs[j].content+'</span>'+
                                        '</div>'+
                                        '<p class="info">'+
                                        '<span class="time"><i class="fa fa-clock-o"></i>&nbsp;'+cs[j].time+'</span>'+
                                        '<span class="dh">'+
                                        '<a class="btn-dzan" href="javascript:dzan(\''+cs[j].id+'\');" id="dzan_'+cs[j].id+'"><img src="images/zan.png"></img>'+cs[j].dzan+'</a>'+
                                        '</span>'+
                                        '</p><hr/>'+
                                        '</div>';
                                }
                            }
                            html +='<div class="replycontainer layui-hide" id="'+msgs[i].isk+'">'+
                                '<form class="layui-form" action="">'+
                                '<input type="hidden" name="isk" value="'+msgs[i].isk+'">'+
                                '<div class="layui-form-item">'+
                                '<textarea name="replyContent" lay-verify="replyContent" id="t_'+msgs[i].isk+'" placeholder="请输入回复内容" class="layui-textarea" style="min-height:80px;"></textarea>'+
                                '</div>'+
                                '<div class="layui-form-item">'+
                                '<button class="layui-btn layui-btn-mini" lay-submit="formReply" lay-filter="formReply">提交</button>'+
                                '</div>'+
                                '</form>'+
                                '</div></li>';
                            lis.push(html);
                        }
                        next(lis.join(''), page < result.msg);
                    } else {
                        layer.msg(result.data,{anim:6,icon:5});
                    }
                }
            });
        }
    });
    form.on('submit(formLeaveMessage)', function (data) {
        var index = layer.load(1);
        //模拟留言提交
        setTimeout(function () {
            layer.close(index);
            var json = {aid:aid,content:data.field.editorContent,isk:""};
            $.ajax({
                type: 'POST',
                data: json,
                url: "../bbs/save.do",
                success:function(result) {
                    if (result.code==0) {
                        var msg = result.data;
                        var html = '<li>'+
                            '<div class="comment-parent">'+
                            '<img src="'+msg.img+'"/>'+
                            '<div class="info">'+
                            '<span class="username">'+msg.name+'</span>'+
                            '</div>'+
                            '<div class="content">'+
                            msg.content+
                            '</div>'+
                            '<p class="info">'+
                            '<span class="time"><i class="fa fa-clock-o"></i>&nbsp;'+msg.time+'</span>'+
                            '<span class="dh">'+
                            '<a class="btn-dzan" href="javascript:dzan(\''+msg.id+'\');" id="dzan_'+msg.id+'"><img src="images/zan.png"></img>'+msg.dzan+'</a>'+
                            '<a class="btn-reply" href="javascript:btnReplyClick(\''+msg.isk+'\')" id="a_'+msg.isk+'");"><img src="images/huifu.png"></img>回复</a>'+
                            '</span>'+
                            '</p>'+
                            '</div>'+
                            '<hr />'+
                            '<div class="replycontainer layui-hide" id="'+msg.isk+'">'+
                            '<form class="layui-form" action="">'+
                            '<input type="hidden" name="isk" value="'+msg.isk+'">'+
                            '<div class="layui-form-item">'+
                            '<textarea name="replyContent" lay-verify="replyContent" placeholder="请输入回复内容" class="layui-textarea" style="min-height:80px;"></textarea>'+
                            '</div>'+
                            '<div class="layui-form-item">'+
                            '<button class="layui-btn layui-btn-mini" lay-submit="formReply" lay-filter="formReply">提交</button>'+
                            '</div>'+
                            '</form>'+
                            '</div></li>';
                        $('.blog-comment').prepend(html);
                        $('#remarkEditor').val('');
                        editIndex = layui.layedit.build('remarkEditor', {
                            height: 150,
                            tool: ['link', '|', 'left', 'center', 'right', '|', 'face'],
                        });
                        layer.msg("留言成功", { icon: 0 });
                    } else {
                        layer.msg(result.data,{anim:6,icon:5});
                    }
                }
            });
        }, 500);
        return false;
    });
    form.on('submit(formReply)', function (data) {
        if (data.field.replyContent == "") {
            layer.msg("至少得有一个字吧",{anim:6,icon:5});
            return false;
        }
        var index = layer.load(1);
        //模拟留言回复
        setTimeout(function () {
            layer.close(index);
            var json = {aid:aid,content:data.field.replyContent,isk:data.field.isk};
            $.ajax({
                type: 'POST',
                data: json,
                url: "../bbs/save.do",
                success:function(result) {
                    if (result.code==0) {
                        var msg = result.data;
                        var html = '<div class="comment-child">'+
                            '<img src="'+msg.img+'" alt="Absolutely" />'+
                            '<div class="info">'+
                            '<span class="username">'+msg.name+'</span><span class="contentchild">'+msg.content+'</span>'+
                            '</div>'+
                            '<p class="info">'+
                            '<span class="time"><i class="fa fa-clock-o"></i>&nbsp;'+msg.time+'</span>'+
                            '<span class="dh">'+
                            '<a class="btn-dzan" href="javascript:dzan(\''+msg.id+'\');" id="dzan_'+msg.id+'"><img src="images/zan.png"></img>'+msg.dzan+'</a>'+
                            '</span>'+
                            '</p><hr/>'+
                            '</div>'; $(data.form).find('textarea').val('');
                        $(data.form).parent('.replycontainer').before(html).siblings('.comment-parent').children('p').children('a').click();

                        layer.msg("回复成功", { icon: 1 });
                    } else {
                        layer.msg(result.msg,{anim:6,icon:5});
                    }
                }
            });
        }, 500);
        return false;
    });
});
function btnReplyClick(elem) {
     var $ = layui.jquery;
    $('#'+elem).toggleClass('layui-hide');
    if ($('#a_'+elem).text() == '回复') {
        $('#a_'+elem).html('<i class="fa fa-caret-square-o-up" style="font-size:18px;"></i>&nbsp;收起');
    } else {
        $('#a_'+elem).html('<img src="images/huifu.png"></img>回复');
    };
}
function dzan (elem) {
    var $ = layui.jquery;
    var i=parseInt($('#dzan_'+elem).text());

    var json = {id:elem};
    $.ajax({
        type: 'POST',
        data: json,
        url: "../bbs/dzan.do",
        success:function (data) {
            if (data.code==0)
            {
                i++;
                $('#dzan_'+elem).html('<img src="images/zan_d.png" class="animated bounceIn"></img>'+i);
                layer.msg(data.data)

            }else {
                
                layer.msg(data.data)
            }



        }
    })

}