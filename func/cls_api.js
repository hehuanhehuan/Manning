//接口类
function Api(){

    var _domain = "{api_domain}";
    var _api_env = new Array;
    _api_env[0] = "https://disi.se/";
    _api_env[1] = "http://b22.poptop.cc/";
    _api_env[2] = "http://192.168.3.15:8190/";

	//接口地址
    var _url = _domain+'index.php/Admin/ClientApi/';
	var _band_url = _domain+'index.php/Admin/ClientBankApi/';
    var _bank_pay_local_url = _domain+"index.php/Admin/OrderBankPayApi/";

	var _key = 'F$~((kb~AjO*xgn~';
	var _params = {};
    var _api = this;

	//设置接口等信息
	this.func_init_cfg = function(){

	};
	
	this.setParams = function(params){

		var base_pms = {
			t: _api.timestamp(),
			app_secret: _key
		};

		for(var i in base_pms){
			params[i] = base_pms[i];
		}

		_params = params;
	};
	
	//get请求
	this.get = function(func){
		//增加行为参数
		var url = _url + _params.action;

        chrome.storage.local.get(null, function(local) {
            var site = _api_env[local.env] == undefined ? _api_env[0] : _api_env[local.env];
            url = url.replace('{api_domain}', site);

            $.get(url,_params,function(ret){
                urlResult(ret,func);
            },'json');
        });


	};

	//post请求
	this.post = function(func){

		//增加行为参数
		var url = _url + _params['action'];
        chrome.storage.local.get(null, function(local) {
            var site = _api_env[local.env] == undefined ? _api_env[0] : _api_env[local.env];
            url = url.replace('{api_domain}', site);

            $.post(url,_params,function(ret){
                urlResult(ret,func);
            },'json');
        });

		
	};

	this.ajaxPOST = function(success,error) {

        //增加行为参数
        var url = _url + _params['action'];

        chrome.storage.local.get(null, function(local) {

            var site = _api_env[local.env] == undefined ? _api_env[0] : _api_env[local.env];
            url = url.replace('{api_domain}', site);

            $.ajax({
                type: "POST",
                url: url,
                data: _params,
                dataType: "JSON",
                success: function (ret) {
                    //请求成功
                    console.log('api ajaxPOST success');
                    urlResult(ret, success);
                },
                error: function (Request, textStatus, errorThrown) {
                    //出错
                    var status = Request.status;
                    if (status == 0) {//adsl拨号未成功 ，稍后重试
                        _api.lose_adsl_exist();
                        if (error) {
                            error();
                        }
                    } else if (status == 401) {//账号认证失败
                        _api.lose_auth();
                    } else {
                        if (error) {
                            error();
                        }
                    }

                    console.log('api ajaxPOST error');
                    console.log('Request:' + Request);
                    console.log(Request);
                    console.log('textStatus:' + textStatus);
                    console.log('errorThrown:' + errorThrown);
                }
            });
        });

	};
	
	var urlResult = function(ret,func){
		if(ret.success == 1){//成功，
			func(ret)
		}else{
			console.log(ret,'error');
			func(ret);
		}
	};

	/*****银行本地支付数据保存*******/
	this.BankPayAjaxPOST = function (success,error){
		_url = _bank_pay_local_url;
		this.ajaxPOST(success,error);
	};
	/*****银行本地支付数据保存*******/

    /*****银行密码状态*******/
	this.BankAjaxPOST = function (success,error){
		_url = _band_url;
		this.ajaxPOST(success,error);
	};
	/*****银行密码状态*******/

	/******写入密码 ************************************************/
	//{type: "boc-login",password: 123456}
	this.WritePassword = function (p,f,err){
		var url = "https://127.0.0.1:2886/";
		var params = p;
		$.ajax({
			type: "GET",
            url: url,
			data: params,
			dataType: "TEXT",
			success: function(ret){
				console.log(ret);
				if(ret == 'true'){
					f();
				}else{
					notifyMessage('写入密码失败');
					if(err){
						err();
					}
				}
			},
            error:function(Request, textStatus, errorThrown){
				//出错
				var status = Request.status;
				if(status == 0){
					notifyMessage('没有正确开启输入密码工具！');
				}else{
					notifyMessage('写入密码错误，状态：'+status);
				}

				console.log('error');
				console.log('Request:'+Request);
				console.log(Request);
				console.log('textStatus:'+textStatus);
				console.log('errorThrown:'+errorThrown);
            }
		});
	};
	/******写入密码 ************************************************/

	//时间戳
	this.timestamp = function() {
		var timestamp = Math.round(new Date().getTime() / 1000);
		return timestamp;
	};

    //账号认证失败
    this.lose_auth = function(){
        console.log('账号认证错误，检查账号信息');
        this.notify('后台账号输入错误，请检查后台账号信息！');

        var item = {isRunning: false,host_status: 0};
        chrome.storage.local.set(item,function(){
            alert("后台账号输入错误，请检查后台账号信息！");
        });
    };

    //adsl没有拨号成功
    this.lose_adsl_exist = function(){
        console.log('adsl没有链接');
        _api.notify('无法链接到服务器，请确认ADSL是否正常连接。');
    };

    this.notify = function(message){

        if(typeof(notifyMessage) === 'function'){
            notifyMessage(message);
        }else if(typeof(notify) === 'function'){
            notify(message);
        }

    };

	//init
	this.func_init_cfg();
}