//中行付款

var bank = 'boc';
var get_deal_code = false;

var bank_user = null;
var bank_code = null;
var bank_password  = null;
var task_order_oid = null;

Task(index);

//监控页面
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		//console.log(mutation.type);
		//console.log(mutation.target);
		//console.log(mutation);
		if(mutation.type === 'childList'){
			if(mutation.target.id === 'txt_netcode_85204'&&mutation.addedNodes.length>0){
				//第二步操作， 密码框显示完毕，输入用户名密码，确定
				r(function(local){
					if(local.pay.bank == bank){
						step2(local);	
					}else{
						clue('手动付款或其它银行操作');
					}
					
				});

			}else if(mutation.target.id === 'epay_security_tool'&&mutation.addedNodes.length>0){
				//第三步，选择账户，安全工具
				r(step3);
			}else if(mutation.target.id === 'txt_dynamiccommand_18060'&&mutation.addedNodes.length>0){
				//第四步，点击获取验证码，等待付款
				r(step4);
			}
		}else if(mutation.type === 'attributes'){
			if(mutation.target.id === 'selectway'&&mutation.attributeName=="visible"&&mutation.oldValue=="false"){
				//第一步操作，选择网银支付
				r(function(local){
					if(local.pay.bank == bank){
						step1();	
					}else{
						clue('手动付款或其它银行操作');
					}
					
				});
			}else if(mutation.target.id == 'captcha-item'&&mutation.oldValue == 'clearfix hide'){
                //显示验证码
                r(function(){
                    if($("#txt_captcha_85223:visible").length > 0){
                        updateHostStatus(1501003);//银行验证码
                    }
                })
            }
		}

	});
});

var observer_config = {
	attributes: true,
	childList: true,
	characterData: true, 
	attributeOldValue: true,
	characterDataOldValue: true,
	subtree: true
};

if($('#div_epayment_container').length){
	observer.observe(document.querySelector('#div_epayment_container'), observer_config);	
}

//中行
function index(local){
	//银行付款
	//updateHostStatus(1501000);

  	save_bank_payment();
}

//选择网银支付 按钮
function step1(){
	
	if($("#webPayA:visible").length > 0){
		clue("3秒，网银支付");
		setTimeout(function(){
			$("#webPayA")[0].click();
		},3000);
	}else{
		console.log("网银支付按钮没有找到.");
	}
}

//填写银行 用户名，密码
function step2(local){
	//填用户名，
	bank_user = local.pay.boc_username;
	bank_code = local.pay.bank;
	bank_password  = local.pay.boc_password;
	task_order_oid = local.task.task_order_oid;
	// $("#txt_epay_name_85211:visible").val(bank_user);//用户名
	// $("#txt_null_63815:visible").val(task_order_oid);//备注 订单号

    if(bank_user==''||bank_password==''){
        updateHostStatus(1501001);
        clue('中行账号信息设置错误','error');
        return false;
    }

	inputUsername(local)

}


//选择账户，安全工具
function step3(){
	$('#sel_payeraccount_85247 ul li a').first()[0].click();//选择银行卡
	$("#rd_choose_security_tool_17637_1").attr('checked',true);//动态口令+手机交易码
	var btn = $("#btn_ok_85262:visible");
	if(btn.length > 0){

		clue("选择 账户/工具，确定");
		btn[0].click();
	}else{
		clue("没有确定");
	}
}

//点击你手机验证码
function step4(){
	if(!get_deal_code){
		get_deal_code = true;
		console.log("发送短信");
		clue("获取手机交易码");
		$('#btn_getdealcode_18056')[0].click();//发送手机验证码按钮
        updateHostStatus(1502000);//等待银行口令

        var body = $("body");
        window.scrollTo(body.width(),body.height());
	}
	
	//确定之后开始查看支付状态
	$("#btn_ok_85304").on("click",function(){
		clue("确定");
		pay_over();
	});
}


function inputUsername(local){
	// $("#txt_epay_name_85211:visible").val(bank_user);//用户名
	writing($("#txt_epay_name_85211:visible"),bank_user,function(){
		inputRemark(local);
	})
}
function inputRemark(local){
	//$("#txt_null_63815:visible").val(task_order_oid);//备注 订单号
	writing($("#txt_null_63815:visible"),local.task.task_order_oid,function(){
		inputPassword(local);
	})
}

function inputPassword(local){
	//检查是否自动登陆
	if(!local.pay.autologin_boc){
		clue("中行自动登陆，未开启");
		return false;
	}else{
		clue("中行自动登陆，已开启");
	}

	if(bank_password.length <= 0){
		clue("没有设置中行密码",'error');
		return false;
	}

	//排队，获取密码状态
	var API = new Api();
	var params = {
		action:'get_use_status',
		host_id: local.host_id,
		username: local.username,
		password: local.password,
		bank_user: bank_user,
		bank_code: bank_code
		
	};

	API.setParams(params);
	API.BankAjaxPOST(function(ret){
		if(ret.success == 1){
			//填写密码
			clue("["+bank_user+"]");
			write_password(bank_password);//写入密码
			console.log(ret);
		}else{
			//当前密码不可用，等待
			clue("[ "+bank_user+" ]正在使用···稍后再试··",'error');
			clue("10秒后，刷新");
			//bank_make_over(local);//调试
			setTimeout(function(){
				location.reload();
			},10000);
			
		}
	},function(){
		clue("稍后刷新重试");
		clue("10秒后，刷新");
		setTimeout(function(){
			location.reload();
		},10000);
	});  	
}

//写入密码
function write_password(p){
	var params = {type: "boc-login",password: p};
	API = new Api();
	API.WritePassword(params,function(){
		//密码正常写入，确定，
		clue("写入密码，确定");
		$("#btn_ok_85213")[0].click();
		
	},function(){
		//写入密码失败， 5秒，刷新
		clue("写入密码，失败");
		clue("5秒，刷新");
		setTimeout(function(){
			location.reload();
		},5000);
	});
}


//支付结束
function pay_over(){
	var finish = false;
	var pay_over_interval = setInterval(function(){

		if(finish){
			clearInterval(pay_over_interval);
			return false;
		}

		//支付成功返回页面
		if($("#btn_return_shop_85498").length > 0){
			finish = true;
			r(bank_make_over);//解除账号占用状态
            updateHostStep(_host_step.save_order_info);//step8 保存订单数据步骤
			$("#btn_return_shop_85498")[0].click();	//支付成功，点击返回按钮
			updateHostStatus(1503000);//报告支付成功状态
		}

		//支付失败 状态
		if($("#btn_fanhuichongxuan_109532").length > 0){
			//支付失败，重新打开付款窗口，关闭当前窗口
			finish = true;
			r(bank_make_over);
			updateHostStatus(1502001);//报告失败状态
            clue("支付失败，页面在10秒后关闭");
            setTimeout(close_this_tab,10000);
		}
	},1000);

}

//保存银行流水信息
function save_bank_payment(){

	var payment = {
		merchant : $("#skipMerchantNo").val(),
		no : $("#skipOrderNo").val(),
		time : $("#skipOrderTime").val(),
		amount : $("#skipOrderAmount").val(),
		seq : $("#skipOrderSeq").val()
	};
	chrome.storage.local.set({'bank_payment':payment},function(){

	});

}
