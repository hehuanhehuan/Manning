Task(index);
function index(local) {

    console.log("支付结果页面");

    if($(".result-success .result-box-title:contains('支付成功')").length > 0){
        updateHostStep(_host_step.save_order_info);//step8 保存订单数据

        updateHostStatus(1504000);
        //是工商银行操作，取消ua替换
        if (local.pay.bank == 'icbc') {
            sendMessageToBackground('icbc_change_useragent_end');
        } else {
            //工行不解除占用
            bank_make_over(local);
        }

        setTimeout(close_this_tab, 10000);
        console.log("京东支付返回页面");
    }


}