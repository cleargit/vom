$.ajax({
    type: 'POST',
    url: "../user/auth.do",
    success: function (data) {

    }
});
$.ajaxSetup( {
//设置ajax请求结束后的执行动作
    complete :
        function(XMLHttpRequest, textStatus) {

            var sessionstatus = XMLHttpRequest.getResponseHeader("sessionstatus");
            if (sessionstatus == "TIMEOUT") {
                var win = window;
                while (win != win.top){
                    win = win.top;
                }
                win.location.href= XMLHttpRequest.getResponseHeader("URL");
            }
        }
});