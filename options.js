$(function(){


	//1.初始化信息
	load_config();

	//2.保存配置
	var $btnSave = $('#btnSave');
	$btnSave.click(function(){
		set_config();
	});

});

function set_config(){
	//用户名
	var worm_username = $("#worm_username").val();
	var worm_password = $("#worm_password").val();
	var host_id = $("#host_id").val();
	if(worm_username==''||worm_password==''||host_id==''){
		alert('用户名密码主机必填');
		return;
	}
	var pay = {
		"ccb_username": $('#ccb_username').val(),
		"ccb_password": $('#ccb_password').val(),
		"boc_username": $('#boc_username').val(),
		"boc_password": $('#boc_password').val(),
		"cmb_mobile": $('#cmb_mobile').val(),
		"cmb_paycard": $('#cmb_paycard').val(),
		"icbc_paycard": $('#icbc_paycard').val(),
		"bank": $('input[name ="bank"]:checked').val(),
		"autologin_boc": $("#autologin_boc:checked").length>0?true:false

	};

	var items = {
		'env': $("#worm_env").val(),
		'username':worm_username,
		'password':worm_password,
		'host_id':host_id,
		'pay': pay

	};

	chrome.storage.local.set(items, function(result){
		alert('保存成功');
	});
}

	//3.初始化信息
function load_config(){

	var items = [
			'username',
			'password',
			'host_id',
            'env',
			'pay'
		];

	chrome.storage.local.get(items, function(result){
        console.log(result);
	    var worm_env = (result['env'] == undefined) ? 0 : result['env'];
	    var username = (result['username'] == undefined) ? '' : result['username'];
	    var password = (result['password'] == undefined) ? '' : result['password'];
	    var host_id = (result['host_id'] == undefined) ? '' : result['host_id'];
	    var pay = (result.pay == undefined) ? '' : result.pay;

        console.log(worm_env);
        $("#worm_env option[value='"+worm_env+"']").prop("selected", true);

		$("#worm_username").val(username);
		$("#worm_password").val(password);
		$("#host_id").val(host_id);

		$('#ccb_username').val(pay.ccb_username?pay.ccb_username:'');
		$('#ccb_password').val(pay.ccb_password?pay.ccb_password:'');
		$('#boc_username').val(pay.boc_username?pay.boc_username:'');
		$('#boc_password').val(pay.boc_password?pay.boc_password:'');
		$('#cmb_mobile').val(pay.cmb_mobile?pay.cmb_mobile:'');
		$('#cmb_paycard').val(pay.cmb_paycard?pay.cmb_paycard:'');
		$('#icbc_paycard').val(pay.icbc_paycard?pay.icbc_paycard:'');
	    $('#bank_' + pay.bank).attr('checked', true);
	    $('#autologin_boc').attr('checked',pay.autologin_boc);
	
	});
}