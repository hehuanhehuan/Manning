//京东支付页面
var btnSubmitNum = 0;
var btnSubmit = $('#paySubmit');

Task(index);

function index(local){
    //updateHostStatus(1414000);

    $('#paySubmit').hide();//隐藏 支付按钮
    //
    ////保存订单号
    //var order_id = {order_id:$("#orderId").val()};
    //setLocal(order_id,function(){
    //    updateHostStep(_host_step.payment);//step7 去付款;
    //});

    console.log(local);

    var task = local.task;
    var order_id = task.business_oid;
    var pay = local.pay;
    if(pay !=''){

        if('bank' in pay&&pay.bank=='null'){
            clue('手动选择付款');
            $('#paySubmit').show();//显示 支付按钮
        }else{
            var bank = local.pay.bank;
            console.log(bank);

            if(bank == 'icbc'){
                console.log('工商银行替换UserAgent');
                chrome.runtime.sendMessage({act: 'icbc_change_useragent_start'}, function(response){ });
            }else if(bank == 'ccb'){
                sendMessageToBackground('intercept_ccb_form');//建行截获form数据
            }

            var li_bank = $('#ebankPaymentListDiv li[clstag="payment|keycount|bank|c-'+bank+'"]');
            clue(li_bank.text());
            li_bank[0].click();

            var select_id = $("#seletedAgencyCode").next().attr('id');
            if(select_id === ("bank-"+bank)){
                btnSubmitNum++;
                if(btnSubmitNum == 1){
                    btnSubmit.click();
                }

                setTimeout(function(){
                    pay_finish();
                },2000);
            }
        }
    }else{
        console.log("没有设置银行用户信息！");
        //updateHostStatus(1414001);
        notifyMessage("没有设置银行用户信息！");
    }
}

//点击支付完成
function pay_finish(){
	
	var payFinishInterval = setInterval(function(){
		if($("#wangyinPaySuccess:visible").length > 0){
			$("#wangyinPaySuccess .wangyin-payed-success .wps-button a")[0].click();
			clearInterval(payFinishInterval);
		}
	},500);
}
