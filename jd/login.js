//京东登陆
var submit_username = null;
var submit_password = null;
var user_disabled = false;

Task(index);

var observer_config = {
    //attributes: true,
    childList: true,
    //characterData: true,
    //attributeOldValue: true,
    //characterDataOldValue: true,
    subtree: true
};
addMutationObserver($(".login-box")[0],function(mutation){
    //console.log(mutation.type);
    //console.log(mutation.target);
    //console.log(mutation);

    if(mutation.type == 'childList'){
        if(mutation.target.className == 'msg-wrap' && mutation.addedNodes.length > 0){
            Run(function(local){
                var msg_error = $(".msg-wrap .msg-error").text();
                if(msg_error.indexOf("请刷新页面后重新提交") != -1){
                    //存在多余cookie _t
                    clue("等待删除多余cookie, 稍后刷新");
                    sendMessageToBackground('tabs_remove_cookies', {url: document.location.href, name: "_t"});
                    lazy(function(){
                        location.reload(true);
                    });
                }else if(msg_error.indexOf("账户名与密码不匹配，请重新输入") != -1 || msg_error.indexOf('账户名不存在，请重新输入') != -1){
                    //提示账号密码错误，
                    if(local.task.username == submit_username && local.task.password == submit_password){
                        //账号重置
                        if(!user_disabled){
                            user_disabled = true;
                            console.log('账号重置');
                            sendMessageToBackground('task_order_user_reset', '[Manning]'+msg_error);
                        }

                    }
                }
            });

        }

    }
},observer_config);

addListenerMessage(function (request) {
    console.log(request);
    if (request.act == 'business_account_ready') {
        useLocal(inputUsername);
    }
});

function index(local) {
    updateHostStatus(1301000);

    //自动登录
    $("#autoLogin").prop("checked", true);

    loginReady();

    $('#authcode').on('keyup', function () {
        if ($('#authcode').val().length >= 4) {
            $('#loginsubmit')[0].click()
        }
    }).focus();

    $('#JD_Verification1').on('click', function () {
        $('#authcode').focus()
    })
}

function inputUsername(local) {
    writing($('#loginname'), local.task.username, function () {

        inputPassword(local);

    });
}
function inputPassword(local) {
    writing($('#nloginpwd'), local.task.password, submit);
}
function submit() {
    if($('#authcode:visible').length > 0){
        updateHostStatus(1301001);
    }
    submit_username = $("#loginname").val();
    submit_password = $("#nloginpwd").val();

    $('#loginsubmit')[0].click();
}

function loginReady(){
    sendMessageToBackground('get_business_account_password', '', function(res){

    });
}
