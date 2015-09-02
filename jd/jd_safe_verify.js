//京东 激活账户页面
Task(index);

function index(local){
    var task = local.task;

    var sendMobileCode = $("#sendMobileCode");
    if(sendMobileCode.length > 0){
        //账号需要验证
        updateHostStatus(1000002);

        //自动重置账号操作
        setTimeout(function(){
            sendMessageToBackground('task_order_user_reset', '[manning]账户存在风险，需手机验证');
        }, 3000);


    }
}