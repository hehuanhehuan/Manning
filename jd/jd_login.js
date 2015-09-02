//京东登陆  --- 弹出登录窗口用到

Task(index);

addListenerMessage(function (request) {
    console.log(request);
    if (request.act == 'business_account_ready') {
        useLocal(function(local){
            inputUsername(local.task);
        });
    }
});


function index(local) {
    var task = local.task;

    sendMessageToBackground('get_business_account_password');

    // $('#loginname').val(task.username)
    // $('#nloginpwd').val(task.password)
    // $('input[name=chkRememberMe]').prop('checked', true)

    // lazy(submit);

    $('#authcode').on('keyup', function () {
        if ($('#authcode').val().length >= 4) {
            $('#loginsubmit')[0].click()
        }
    }).focus();

    $('#JD_Verification1').on('click', function () {
        $('#authcode').focus()
    })
}


function inputUsername(task) {

    //$('#loginname').val(task.username);
    writing($("#loginname"), task.username, function () {
        inputPassword(task);
    });
}

function inputPassword(task) {
    writing($("#nloginpwd"), task.password, function () {
        submit();
    });
}

function submit() {
    if ($('#authcode:visible').length > 0) {
        updateHostStatus(1301001);
    }
    //登录按钮
    var $loginsubmit = $('#loginsubmit');

    var $loginsubmitframe = $('#loginsubmitframe');

    var $btnSubmit = null;

    if ($loginsubmit.length > 0) {
        $btnSubmit = $loginsubmit;
    } else {
        $btnSubmit = $loginsubmitframe;
    }


    $btnSubmit[0].click();

}