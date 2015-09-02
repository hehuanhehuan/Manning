//中行付款

var bank = 'boc';

Task(index);

//监控页面
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if(mutation.type === 'attributes'){
			if(mutation.target.id === 'selectway'&&mutation.attributeName=="visible"&&mutation.oldValue=="false"){
				//第一步操作，选择网银支付
				r(function(local){
					if(local.pay.bank == bank){
						step1();
					}else{
						clue('手动付款或其它银行操作');
					}

				});
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

function index(){
	//银行付款

	save_bank_payment();
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