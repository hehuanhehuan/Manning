//background.func.js

function chromeContentSetting(){
    console.log('XSS Content Settings');
    //图片设置允许所有, 一号店例外
    chrome.contentSettings.images.set({primaryPattern: '<all_urls>', setting: 'allow'});
    chrome.contentSettings.images.set({primaryPattern: '*://*.yhd.com/*', setting: 'block'});
    chrome.contentSettings.images.set({primaryPattern: '*://*.yihaodianimg.com/*', setting: 'block'});
    chrome.contentSettings.images.set({primaryPattern: '*://passport.yhd.com/*', setting: 'allow'});//yhd登陆验证码需要显示

}
//替换请求 函数
function onBeforeSendHeadersListener(details){
	for (var i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name === 'User-Agent') {
			//console.log(details.requestHeaders[i]);
		    //details.requestHeaders.splice(i, 1);
			if(UserAgent){
				// console.log(UserAgent);
			  	details.requestHeaders[i].value = UserAgent;
			}
			break;
		}
	}
	return {requestHeaders: details.requestHeaders};
}

//替换手机useragent
function change_useragent_addlistener(){
	console.log('change mobile user agent');
	
	var ua_l = _MobileUserAgent.length;
	var i = parseInt(Math.random()*ua_l);
	UserAgent = _MobileUserAgent[i];
	//console.log(UserAgent);
	//console.log(i);
	//UserAgent = 'Mozilla/5.0 (Linux; Android 5.0.1; Nexus 5 Build/LRX22C) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile Safari/537.36 MicroMessenger/6.1.0.56_r1021013.540 NetType/WIFI';
	chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeadersListener,
	{urls: ["<all_urls>"]},
	["blocking", "requestHeaders"]);
}

//取消替换手机useragent
function change_useragent_removelistener(callback){
	console.log('删除useragent  onBeforeSendHeaders.removelistener');
	chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);
	
	if(callback){
		callback();
	}
}

//302控制处理
function chromeRedirectListener(){
    chrome.webRequest.onBeforeRedirect.addListener(function(details){
        //console.log(details);

        if(details.redirectUrl == 'http://www.jd.com/'){
            if(details.url.indexOf('order.jd.com/normal/item.action?orderid=')!=-1){
                //订单详情重定向到首页，重新打开订单详情
                console.log('订单详情重定向到首页，重新打开订单详情');
                chrome.tabs.update(details.tabId,{url: details.url});
            }else{
                console.log('页面 重定向到首页，重新打开 ', details);
                chrome.tabs.update(details.tabId,{url: details.url});
            }
        }else if(details.redirectUrl == 'http://trade.jd.com/orderBack.html'){
            if(details.url.indexOf('trade.jd.com/shopping/order/getOrderInfo.action')!=-1){
                //提交订单重定向到刷新频繁，跳转到订单列表
                console.log('提交订单重定向到刷新频繁，跳转到订单列表');
                chrome.tabs.update(details.tabId,{url: "http://order.jd.com/center/list.action"});
            }

        }

    },{urls: ["*://*.jd.com/*"]})
}



//工行替换ua
function icbcOnBeforeSendHeadersListener(details){
	// console.log(details);
	//console.log("icbc user agent");
	if(details.url.indexOf('icbc.com.cn') >= 0){
		for (var i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name === 'User-Agent') {
				// console.log(details.requestHeaders[i]);
			    // console.log(details.requestHeaders[i].value);
			    var icbc_useragent = details.requestHeaders[i].value.replace(/Chrome\S+/,'Chrome/24.0');
			    details.requestHeaders[i].value = icbc_useragent;
				break;
			}
		}
	}
	return {requestHeaders: details.requestHeaders};
}
//工商银行替换useragent
function icbc_change_useragent_addlistener(){
	//console.log('工商银行切换UserAgent');
	console.log('icbc change user agent listener');
	chrome.webRequest.onBeforeSendHeaders.addListener(icbcOnBeforeSendHeadersListener,
	{urls: ["<all_urls>"]},
	["blocking", "requestHeaders"]);
}
function icbc_change_useragent_removelistener(){
	//console.log('删除工商银行UserAgent替换');
	console.log('clear icbc change user agent listener');
	chrome.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeadersListener);
}


//拦截ccb form data
function ccbFormDataIntercepted(){
    console.log('ccb form data intercepted');
    chrome.webRequest.onBeforeRequest.addListener(function(details){
        console.log(details);

        var form_data = details.requestBody.formData;
        var form_action = details.url;

        var bank_order_id = form_data.ORDERID[0];
        var body = {form_action: form_action, form_data: form_data};

        saveCcbFormToRemote(bank_order_id, body);

    }, {urls: [
            "https://ibsbjstar.ccb.com.cn/app/ccbMainAliPayPlatV5",//yhd建行付款
            "https://ibsbjstar.ccb.com.cn/app/ccbMain"//jd建行付款
        ], types: ["main_frame"]
    }, ["blocking", "requestBody"]);
}

function saveCcbFormToRemote(bank_order_id, body){
    chrome.storage.local.get(null, function(local){
        var API = new Api();
        var params = {
            action: 'ccb',
            host_id: local.host_id,
            username: local.username,
            password: local.password,
            task_order_id: local.task.task_order_id,
            bank_order_number: bank_order_id,
            body: body
        };

        API.setParams(params);
        API.BankPayAjaxPOST(function (ret) {
            if(ret.success == 1){

            }else{
                setTimeout(function(){
                    saveCcbFormToRemote(bank_order_id, body);
                },10000)
            }
        }, function(ret){
            setTimeout(function(){
                saveCcbFormToRemote(bank_order_id, body);
            },10000)
        });
    });
}


function chromeDownloadsCancel(){
    console.log('XSS background download cancel listener');
    chrome.downloads.onCreated.addListener(function(data){
        console.log(data);
        chrome.downloads.cancel(data.id);

        //if(data.url.indexOf('jd.com') != -1){
        //    chrome.downloads.cancel(data.id);
        //}
    })
}

/**
 * 获取对应域cookie
 * @param details
 * @param callback
 */
function getCookies(details,callback){
    //details = {domain: "taobao.com"}
    chrome.cookies.getAll(details, function(cookies) {
        // console.log(cookies);
        callback && callback(cookies);
    });
}

/**
 * 设置对应域cookie
 * @param details
 * @param callback
 */
function setCookies(details,callback){
    chrome.cookies.set(details, function (cookie){
        console.log('set cookies result', cookie);
        callback && callback();
    });
}

/**
 * 删除对应域cookie
 * @param details
 * @param callback
 */
function removeCookies(details, callback){
    chrome.cookies.remove(details, function (cookie){
        console.log('remove cookies result', cookie);
        callback && callback();
    });
}


/**
 * https页面打码
 * @param request object 包含图片的地址
 * @param sender object 请求验证码的sender
 */
function httpsTabsVerifyCode(request,sender){
    console.log('https_tabs_verify_code_result');
    //chrome.tabs.sendMessage(sender.tab.id, {act: 'https_tabs_verify_code_result', cid: 123, text: 'text'});

    var dama = new DaMa();
    dama.submit(request.imgsrc, function (cid, text) {
        chrome.tabs.sendMessage(sender.tab.id, {act: 'https_tabs_verify_code_result', cid: cid, text: text});
    }, function () {
        chrome.tabs.reload(sender.tab.id);
    }, request.cookie);

}

/**
 * https页面打码
 * @param request object 包含图片的地址
 * @param sender object 请求验证码的sender
 */
function httpsTabsVerifyCodeByase64(request,sender){
    console.log('https_tabs_verify_code_by_base_result');
    //chrome.tabs.sendMessage(sender.tab.id, {act: 'https_tabs_verify_code_result', cid: 123, text: 'text'});

    var dama = new DaMa();
    dama.submitByBase64(request.base, function (cid, text) {
        chrome.tabs.sendMessage(sender.tab.id, {act: 'https_tabs_verify_code_result', cid: cid, text: text});
    }, function () {
        chrome.tabs.reload(sender.tab.id);
    }, request.cookie);

}

/**
 * https打码错误，报错
 * @param request object 包含验证码报错使用的cid
 */
function httpsTabsVerifyFail(request){
    console.log('https_tabs_verify_fail');
    var dama = new DaMa();
    dama.report(request.cid, function () {});
}


/**
 * 设置任务运行状态
 * @param status
 */
function setHostStatus(status, callback){
    setLocal({host_status: status}, function () {
        statusReport(status, callback);
    });
}
/**
 * 设置主机运行步骤
 * @param step
 */
function setHostStep(step, callback){
    setLocal({host_step: step}, function(){
        callback && callback();
    });
}

/**
 * 插件状态报告，发送
 * @param callback
 */
function statusReport(status,callback) {

    var API = new Api();

    last_watchdog_time = new Date().getTime();

    useLocal(function(local){

        var host_status_result = _host_status[status];

        console.log(status,host_status_result,local);

        if(local.task != undefined && local.task.task_order_id > 0 && status < 2000000) {
            var params = {
                //action: 'task_order_report_status',
                action: 'app_task_order_report_status',
                host_id: local.host_id,
                username: local.username,
                password: local.password,
                task_order_id: local.task.task_order_id,
                host_finish_result: host_status_result
            };

            API.setParams(params);
            API.post(function (ret) {
                callback && callback();
            });
        } else {
            callback && callback();
        }
    });

}

/**
 * 状态设置为0的时候需要执行的，开始或重新开始或下一单
 */
function startHost(){
    useLocal(function(local){
        //最后一单否
        if (local.last_order) {
            //最后一单，暂停 ，不继续领单
            notify("最后一单，暂停，不继续领单");
            setLocal({isRunning: false , host_status: 0}, function () {
                setLocal({last_order: false}, function () {  });
            });

        } else {
            GetTaskStatus = false;
            StartTaskOpenUrl = false;
            //不是最后一单继续领单，
            //初始化客户端  关闭所有窗口 准备开始任务
            setHostStatus(1001000, CloseWindowsAll);
        }
    });

}

//关闭所有窗口
function CloseWindowsAll() {
    setHostStatus(1101000);
    console.log('close window all');
    chrome.windows.getAll(function (wins) {
        var winsLength = wins.length;
        var index = 0;
        for (var i = 0; i < winsLength; i++) {
            chrome.windows.remove(wins[i].id, function () {
                index++;
                if (winsLength == index) {
                    //清除所有历史信息 10秒之后打开adsl拨号
                    setTimeout(function () {
                        clearCookies(function () {
                            setTimeout(openAdsl, 10000);
                        });
                    }, 10000);

                }

            });

        }

    });
}

/**
 * ADSL拨号
 */
function openAdsl() {
    setHostStatus(1102000);last_watchdog_time = new Date().getTime();
    console.log('open adsl');
    chrome.windows.create({
        url: 'adsl:adsl'
    }, function (win) {
        if (win.id) {
            chrome.windows.update(win.id, {state: "maximized"}, function () {
                //ip重复判断 开始任务
                setTimeout(verifyIP, 10000);
            });
        }

    });

}

/**
 * adsl后验证ip
 */
function verifyIP() {
    last_watchdog_time = new Date().getTime();
    console.log('verify ip');
    useLocal( function (local) {
        setHostStatus(1103000);
        var lastIp = local.last_ip;
        $.ajax({url: 'http://b1.poptop.cc/remote_addr', timeout: 3000}).done(function (data) {
            //console.log(data);
            if (validate_ip_address(data)) {
                if (data == lastIp && local.env != 2) {
                    //ip相同重新拨号
                    notify('IP重复，准备重新拨号');
                    setHostStatus(1103001, function () {
                        setTimeout(CloseWindowsAll, 10000);
                    });

                } else {
                    notify('IP正常，准备 开始刷单！！');
                    closeTabByUrl("adsl:adsl");
                    //ip可用，打开连接 开始刷单
                    setLocal({'last_ip': data}, function () {
                        setHostStatus(1104000, function () {
                            setTimeout(getTask, 10000);
                        });
                    });
                }
            } else {
                notify('服务器返回IP地址格式不正确，重新执行更换IP');
                setHostStatus(1103002, function () {
                    setTimeout(CloseWindowsAll, 10000);
                });
            }
        }).fail(function () {
            //请求IP失败
            console.log('get ip fail');
            setTimeout(verifyIP, 10000);
        });
    });
}

/**
 * 客户端 获取web任务 开始执行任务
 */
function getTask() {
    last_watchdog_time = new Date().getTime();
    console.log('get task');
    if (GetTaskStatus === true) {
        console.log('已经去过');
        return false;
    }
    GetTaskStatus = true;
    setHostStatus(1201000);
    useLocal( function (local) {
        //领单计时
        var get_task_start_time = new Date().getTime();
        var API = new Api();
        var params = {
            "action": "get_app_pay_task_order",
            "host_id": local.host_id,
            "username": local.username,
            "password": local.password
        };
        API.setParams(params);
        API.ajaxPOST(function (webTask) {
            var get_task_end_time = new Date().getTime();
            var get_task_use_time = get_task_end_time - get_task_start_time;
            notify("自动领单耗时："+get_task_use_time+"毫秒");
            if (webTask.success == 1) {
                var task_data = webTask.data;
                if(task_data && task_data.task_id){
                    setHostStep(_host_step.check_address_login);//主机步骤
                    setHostStatus(1202000);//得到服务器任务
                    var task = webTask.data;

                    setLocal({"task": task}, function(){
                        beginTask(task);
                    });
                }else{
                    //无任务
                    console.log(webTask.message);
                    notify(webTask.message+"，10秒后重新领任务");
                    setLocal({host_status: 1202001}, function () {
                        GetTaskStatus = false;
                        setTimeout(getTask, 10000);
                    });
                }
            } else {
                //请求服务器任务失败
                console.log(webTask.message);
                notify(webTask.message+"，10秒后重新领任务");
                setLocal({host_status: 1202001}, function () {
                    GetTaskStatus = false;
                    setTimeout(getTask, 10000);
                });
            }
        }, function () {
            //错误，10秒后重新请求
            GetTaskStatus = false;
            setTimeout(getTask, 10000);

        });

    });

}


/**
 * 任务开始前准备
 * @param task
 * @returns {boolean}
 */
function beginTask(task){
    if (StartTaskOpenUrl === true) {
        console.log('已经打开窗口');
        return false;
    }
    StartTaskOpenUrl = true;
    var list_action = {
      jd:'http://order.jd.com/center/list.action'
    };
    ////得到任务 操作 任务正常
    //var create_url = task.promotion_url;

    //区分是否是手机单
    if (task.is_mobile == 1) {//任务为手机单，开启修改useragent
        console.log('mobile task');
        notify("手机订单");
        change_useragent_addlistener();
    }

    //if (task.business_slug == 'jd') {
    //    create_url = jd_revise_address_login_url;
    //}else{
    //    create_url = yhd_revise_address_login_url;
    //}

    chrome.windows.create({url: "about:blank", incognito: true}, function(w){
        if(task.cookies){
            var cookies_set = true;
            var username_label = task.business_slug == 'jd' ? "alpin" : "ac";
            var cookies_length = task.cookies.length;
            while(cookies_length--){
                var cookie = task.cookies[cookies_length];
                if(cookie.name == username_label){
                    if(decodeURIComponent(cookie.value) != task.username){
                        cookies_set = false;
                        break;
                    }
                    break;
                }
            }

            if(cookies_set){
                setUserCookiesToWindows(task.cookies);
            }


        }

        chrome.tabs.create({windowId: w.id, url:list_action[task.business_slug]}, function (tab) {
            if (task.business_slug == 'yhd') {//一号店设置cookie
                console.log("yhd set cookies");
                yhd_set_cookie_province_id(task.consignee.province);
            }

            if (w.id) {//窗口最大化
                chrome.windows.update(w.id, {state: "maximized"});
            }
            //任务开始执行
            setHostStatus(1203000);
        });


    });





}


/**
 * 看门狗计时器
 */
function watchDogTimer(){
    chrome.storage.local.get(null, function (local) {
        var step = local.host_step;
        if(last_watchdog_time && local.isRunning === true){
            console.log('step-' + step, 'dog-' + last_watchdog_time);
            var time = new Date().getTime();
            if((time - last_watchdog_time) > watchdog_timeout_time){
                //喂狗超时
                console.log('step-' + step, 'dog timeout - ' + watchdog_timeout_count);

                if (last_watchdog_timeout_step == step) {
                    watchdog_timeout_count += 1;//没人喂
                } else {
                    watchdog_timeout_count = 0;//有人喂
                }

                //	超过3次没人喂
                if (watchdog_timeout_count > 3) {
                    //超时3次，不处理，，，，
                    //watchdog_timeout_count = 0;
                    last_watchdog_time = new Date().getTime();
                    console.log("当前超时已多于三次");
                    notify("当前超时已多于三次");
                    timeoutReset();
                } else {
                    watchDogTimeOut();

                    last_watchdog_timeout_step = step;
                    last_watchdog_time = time;
                }

            }

        }else{
            //插件暂停，自动喂狗
            last_watchdog_time = new Date().getTime();
        }

        setTimeout(watchDogTimer, 3000);
    })
}

function timeoutReset(){
    chrome.tabs.create({url:'http://order.jd.com/center/list.action',selected:true}, function(tab){
        console.log(tab);
        chrome.tabs.query({}, function(tabs) {
            if(tabs){
                for(var i=0;i<tabs.length;i++){
                    var remove_tab = tabs[i];
                    if(remove_tab.id == tab.id){

                    }else{
                        chrome.tabs.remove(remove_tab.id, function () {

                        });
                    }

                }
            }
        });
    });
}

/**
 * 插件重新按照当前步骤自动处理（看门狗计时器超出时执行）
 */
function watchDogTimeOut(){
    var action_url = null;
    chrome.storage.local.get(null, function(local){

        var task = local.task;
        var step = local.host_step;

        if(step == 0){
            notify("当前状态为0, 10秒后重新开始");
            setTimeout(startHost, 10000);
            return false;
        }

        console.log("step" + step);
        console.log("task.business_slug" + task.business_slug);
        console.log("task.is_mobile" + task.is_mobile);
        action_url = _host_step_action_url[step][task.business_slug][task.is_mobile];

        if(step == 3){
            console.log("task.promotion_url" + task.promotion_url);
            action_url = task.promotion_url;
        }else if(step == 4){
            console.log("task.item_id" + task.item_id);
            action_url = action_url.replace('{item_id}', task.item_id);
        }

        if(!action_url){ console.log("action_url 错误", action_url); return false;}
        //action_url = "http://order.jd.com/center/list.action";
        chrome.tabs.create({url: action_url}, function(tab){
            console.log(tab);
            var create_id = tab.id;
            chrome.tabs.query({windowId: tab.windowId}, function(tabs){
                console.log(tabs);
                for(var i = 0; i<tabs.length; i++){
                    var tab_id = tabs[i].id;
                    if(tab_id != create_id){
                        chrome.tabs.remove(tab_id);
                    }

                }
            });
        });

    })

}


/**
 * 保存平台用户cookie到远程服务器
 * @param domain
 * @param callback
 */
function saveUserCookiesToRemote(domain, callback){
    console.log("set cookies", domain);
    var details = {domain: domain};
    getCookies(details, function (cookies) {
        useLocal(function (local) {
            var API = new Api();
            console.log(cookies);
            var params = {
                action: 'task_order_save_cookies',
                host_id: local.host_id,
                username: local.username,
                password: local.password,
                task_order_id: local.task.task_order_id,
                cookies: cookies
            };
            API.setParams(params);
            API.ajaxPOST(function (ret) {
                if(ret.success == 1){
                    notify('cookies 保存成功');
                    callback && callback();
                }else{
                    notify(ret.message + " <不保存>");
                    callback && callback();
                }
            }, function(){
                notify("cookie保存失败，重新保存");
                saveUserCookiesToRemote(domain, callback);
            });
        })

    })
}


function setUserCookiesToWindows(cookies) {
    if (cookies === null || cookies === undefined) {
        console.log('cookies is null or undefined');
        return false;
    }
    if (cookies === null) {
        console.log("cookies is null");
        return false;
    }
    console.log("set cookies", cookies);

    var cookies_length = cookies.length;
    while(cookies_length--){
        var fullCookie = cookies[cookies_length];

        //seesion, hostOnly 值不支持设置,
        var newCookie = {};
        var host_only = fullCookie.hostOnly == "false" ? false : true;
        newCookie.url = "http" + ((fullCookie.secure) ? "s" : "") + "://" + fullCookie.domain + fullCookie.path;
        newCookie.name = fullCookie.name;
        newCookie.value = fullCookie.value;
        newCookie.path = fullCookie.path;
        newCookie.httpOnly = fullCookie.httpOnly == "false" ? false : true;
        newCookie.secure = fullCookie.secure == "false" ? false : true;
        if(!host_only){ newCookie.domain = fullCookie.domain; }
        if (fullCookie.session === "true" && newCookie.expirationDate) { newCookie.expirationDate = parseFloat(fullCookie.expirationDate); }

        console.log(newCookie);
        setCookies(newCookie);
    }

}

function getBusinessAccountPassword(sender){
    useLocal(function(local){
        var API = new Api();
        var params = {
            "action": "business_account_get",
            "account_id": local.task.business_account_id
        };
        API.setParams(params);
        API.get(function (ret) {
            if (ret.success == 1) {
                console.log('获取最新账号信息');
                useLocal(function(local){
                    var task = local.task;
                    task.username = ret.data.username;
                    task.password = ret.data.password;
                    task.pay_password = ret.data.pay_password;
                    setLocal({task: task}, function(){
                        chrome.tabs.sendMessage(sender.tab.id, {act: 'business_account_ready'});
                    })
                })

            }else{
                console.log("获取最新账号信息失败，自动刷新重试", 'error');
                chrome.tabs.reload(sender.tab.id);
            }

        }, function () {
            console.log('获取最新账号信息错误，自动刷新重试', 'error');
            chrome.tabs.reload(sender.tab.id);
        });
    });

}