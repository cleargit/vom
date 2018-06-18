
var edit;
$('.blog-main').append('<div class="cc" data-toggle="tooltip" title="close"> <span class="glyphicon glyphicon-remove" id="myclose""></span></div>');
initdata();

function initdata() {
    layui.use(['jquery','flow','layer'], function () {
        layer.msg("后台进入在登陆那里");
        var $ = layui.jquery;
        var flow = layui.flow;
        $('.amain').detach();
        $('.blog-right').hide();
        $('.blog-right').empty();
        $('.blog-left').animate({
            width: '32%'
        });
        $('.header a').show(500);
        $('.cc').css("display","none")
        flow.load({
            elem: '.blog-right',
            isAuto: false,
            end: '没有更多的文章了~QAQ',
            done: function(page,next) {
                $.ajax({
                    type: 'GET',
                    data: {page:page-1,size: 5},
                    url: "/blog/list.do",
                    success:function(result) {
                        if (result.code==0) {
                            var arts = result.data;
                            var lis = [];
                            for (var i=0; i<arts.length; i++) {
                                var head='';
                                head='<article class="amain shadow">';
                                lis.push(head+
                                    '<div class="aheader">'+
                                    ' <h1 class="atitle">'+arts[i].title+'</h1>'+
                                    '<div class="ameta">'+
                                    '<span class="author">'+"作者:"+arts[i].author+'<a href=""></a></span>'+
                                    '<time class="post-date">'+"时间:"+arts[i].time+'</time>'+
                                    '</div>'+
                                    '</div>'+
                                    '<div class="acontent">'+
                                    '<p>'+arts[i].intro+'</p>'+
                                    '<div class="aread">'+
                                    '<a id="uid'+arts[i].id+'" href="javascript:detail('+arts[i].id+')" class="btn btn-primary">'+"阅读全文"+'</a>'+
                                    '</div>'+
                                    '</div>'+
                                    '</article>'
                                )
                            }
                            if (page==1) {
                                next(lis.join(''), page < parseInt(result.msg));
                            } else {
                                setTimeout(function(){next(lis.join(''), page < parseInt(result.msg));},1000);
                            }
                        } else {
                            layer.msg(result.msg,{anim:6});
                        }
                    }
                });
            }
        });
        $('.blog-right').fadeIn()
    });
}
function detail(aid) {
    var $ = layui.jquery;
    $('.blog-right').hide();
    $('.blog-right').empty();
    $('.blog-left').animate({
        width: '22%'
    });
    $('.header a').hide(500);

    $('.cc').css("display","block")
    $.ajax({
        type: 'GET',
        data: {id: aid},
        url: "/blog/findone.do",
        success: function (result) {
            if (result.code == 0) {
                var arts = result.data;
                var lis = [];
                lis.push(
                    '<div class="article-detail">' +
                    '<div class="article-detail-title">' +
                    '<h1>' + arts.title + '</h1>' +
                    '<div class="article-detail-item">' +
                    '<span class="glyphicon glyphicon-star">' + arts.author + '</span>' +
                    '<span class="glyphicon glyphicon-time">' + arts.time + '</span>' +
                    '</div>' +
                    '</div>' +
                    '<div class="article-detail-content">' +
                    arts.content +
                    '</div>' +
                    '<div id="edit"></div>'+
                    '<div class="reply">'+
                    '<a href="javascript:reply('+aid+')" class="btn btn-primary" id="hello">'+"回复"+'</a>'+
                    '</div>'+
                    '<div class="blog-comment">'+
                    '</div>'+
                    '</div>'
                )
                $('.blog-right').html(lis);
                $("img").addClass("img-responsive");
                initedit(aid);
            } else {
                layer.msg(result.msg, {anim: 6});
            }
        }
    });
    $('.blog-right').fadeIn();
}

$(document).ready(function(){
    $(".cc").on("click",function(){
       initdata();
    });
});
function initedit(aid){
    var E = window.wangEditor;
    var editor = new E('#edit');
    editor.customConfig.uploadImgShowBase64 = true;
    editor.customConfig.menus = [
        'head',
        'bold',
        'italic',
        'underline',
        'foreColor',
        'emoticon'
    ];
    editor.create();
    edit=editor;
    flowReply(aid);
}
function reply(aid){
    var layer = layui.layer;
    var content=edit.txt.html();
    var json = {aid:aid,content:content,isk:""};
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
                    '<span class="time"><i class="glyphicon glyphicon-time"></i>&nbsp;'+msg.time+'</span>'+
                    '<span class="dh">'+
                    '<a class="btn-dzan" href="javascript:dzan(\''+msg.id+'\');" id="dzan_'+msg.id+'"><img src="images/zan.png"></img>'+msg.dzan+'</a>'+
                    '<a class="btn-reply" href="javascript:btnReplyClick(\''+msg.isk+'\')" id="a_'+msg.isk+'");"><img src="images/huifu.png"></img>回复</a>'+
                    '</span>'+
                    '</p>'+
                    '</div>'+
                    '<hr />'+
                    '<div class="replycontainer hide" id="'+msg.isk+'">'+
                    '<form class="" action="">'+
                    '<input type="hidden" name="isk" value="'+msg.isk+'">'+
                    '<div class="layui-form-item">'+
                    '<textarea name="replyContent" lay-verify="replyContent" placeholder="请输入回复内容" style="min-height:80px; width: 80%"></textarea>'+
                    '</div>'+
                    '<div class="">'+
                    '<button class="btn btn-primary">提交</button>'+
                    '</div>'+
                    '</form>'+
                    '</div></li>';
                $('.blog-comment').prepend(html);
                layer.msg("回复成功", { icon: 1 });
        }else{
                layer.msg(result.data,{anim:6,icon:5});
            }
        }
    })
}
function flowReply(aid){
    layui.use(['jquery','flow'], function () {
        var $ = layui.jquery;
        var flow = layui.flow;
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
                                    '<span class="time"><i class="glyphicon glyphicon-time"></i>&nbsp;'+msgs[i].time+'</span>'+
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
                                            '<span class="time"><i class="glyphicon glyphicon-time"></i>&nbsp;'+cs[j].time+'</span>'+
                                            '<span class="dh">'+
                                            '<a class="btn-dzan" href="javascript:dzan(\''+cs[j].id+'\');" id="dzan_'+cs[j].id+'"><img src="images/zan.png"></img>'+cs[j].dzan+'</a>'+
                                            '</span>'+
                                            '</p><hr/>'+
                                            '</div>';
                                    }
                                }
                                html +='<div class="replycontainer hide" id="'+msgs[i].isk+'">'+
                                    '<form role="form" id="'+msgs[i].id+'">'+
                                    '<input type="hidden" name="aid" value="'+aid+'">'+
                                    '<input type="hidden" name="isk" value="'+msgs[i].isk+'">'+
                                    '<div class="form-group">'+
                                    '<textarea name="content"  id="t_'+msgs[i].isk+'" placeholder="请输入回复内容" style="min-height:80px; width: 80%"></textarea>'+
                                    '</div>'+
                                    '</form>'+
                                    '<button class="btn btn-primary" onclick="childreply(\''+msgs[i].id+'\')">提交</button>'+
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
    });
}
function childreply(aid){

    var h=$("#"+aid).serialize()
    $.ajax({
        type: 'POST',
        data: h,
        cache:false,
        async:true,
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
                    '<span class="time"><i class="glyphicon glyphicon-time"></i>&nbsp;'+msg.time+'</span>'+
                    '<span class="dh">'+
                    '<a class="btn-dzan" href="javascript:dzan(\''+msg.id+'\');" id="dzan_'+msg.id+'"><img src="images/zan.png"></img>'+msg.dzan+'</a>'+
                    '</span>'+
                    '</p><hr/>'+
                    '</div>';
                $('#'+aid).parent('.replycontainer').before(html);
                layer.msg("回复成功", { icon: 1 });
            } else {
                layer.msg(result.data,{anim:6,icon:5});
            }
        }
    });
}
function btnReplyClick(elem){
    $('#'+elem).toggleClass('hide');
}
function dzan (elem) {
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
$('#toggle').click(function () {
    var display=$('#ntoggle').css('display');
    if(display=='none'){
        $('#ntoggle').show(500);

    }else {
        $('#ntoggle').hide(500);
    }
})
$(document).ready(function(){
    var uid=window.location.href.split('?')[1];
    if (uid!=null){
        $('#uid'+uid).trigger('click');
    }
})

