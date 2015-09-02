//worm
$(function () {

    //初始化
    init_cfg(function () {
        //chrome系统设置
        chromeContentSetting();

        //页面消息 侦听
        chrome_message_listener();

        //302控制
        chromeRedirectListener();

        //关闭所有下载
        chromeDownloadsCancel();

        //看门狗计时器执行
        watchDogTimer();
    });
});

/**
 * 初始化 stroage 数据
 * @param callback
 */
function init_cfg(callback) {
    console.log('XSS background init...');
    setLocal(_cfg, function () {
        callback && callback();
    });
}

// 增加监听事件
function chrome_message_listener() {
    console.log('XSS background message listener');
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        last_watchdog_time = new Date().getTime();
        //console.log('message receive:', msg);

        switch (msg.act) {

            case 'start_host':
                //重新开始
                startHost();
                break;
            case 'status':
                //设置主机状态
                setHostStatus(msg.val);
                break;
            case 'host_step':
                //设置主机步骤
                setHostStep(msg.val);
                break;
            case 'watch_dog':
                //重置看门狗计时器
                last_watchdog_time = new Date().getTime();
                break;
            case 'close_tab_by_url':
                //关闭tab
                closeTabByUrl(msg.val);
                break;
            case 'create_tab_by_url':
                //打开tab
                sendResponse();
                create_tab_by_url(msg.val);
                break;
            case 'create_incognito_window_by_url':
                //打开隐身window
                sendResponse();
                create_incognito_window_by_url(msg.val);
                break;
            case 'notify':
                //桌面提醒
                notify(msg.val);
                break;
            case 'order_operate':
                //订单操作 重置，异常
                client_task_order_operate(msg.val);
                break;
            case 'update_tab_pinned':
                //固定 标签页面
                update_tab_pinned(sender);
                break;
            case 'remove_useragent_listener':
                change_useragent_removelistener(sendResponse);
                break;
            case 'icbc_change_useragent_start':
                icbc_change_useragent_addlistener();
                break;
            case 'icbc_change_useragent_end':
                icbc_change_useragent_removelistener();
                break;
            case 'tabs_get_cookies':
                //tabs标签页面获取cookie
                getCookies(msg.details, function (cookies) {
                    console.log(msg, cookies);
                    chrome.tabs.sendMessage(sender.tab.id, {act: 'tab_get_cookies_response', cookies: cookies});
                });
                break;
            case 'tabs_remove_cookies': //tab页面删除相关联cookie
                removeCookies(msg.val);
                break;
            case 'https_tabs_verify_code': //https打码，传入img地址
                httpsTabsVerifyCode(msg, sender);
                break;
            case 'https_tabs_verify_code_by_base': //https打码，传入base64编码
                httpsTabsVerifyCodeByase64(msg, sender);
                break;
            case 'https_tabs_verify_fail': //https打码错误，报错
                httpsTabsVerifyFail(msg);
                break;
            case 'save_host_task_order_detail': //保存订单详情数据
                useLocal(function(local){
                    local.task.business_slug;
                    if(local.task.business_slug == 'jd'){
                        saveUserCookiesToRemote('jd.com', saveHostTaskOrderDetail);
                    }else if(local.task.business_slug == 'yhd'){
                        saveUserCookiesToRemote('yhd.com', saveHostTaskOrderDetail);
                    }else{
                        saveHostTaskOrderDetail();
                    }
                });
                break;
            case 'reset_host_by_step': //插件步骤重置功能
                watchDogTimeOut();
                break;
            case 'intercept_ccb_form':  //建行截获form
                ccbFormDataIntercepted();
                break;
            case 'save_user_cookies_to_remote':  //保存平台用户cookie到远程 ，传入平台主域名
                saveUserCookiesToRemote(msg.val);
                break;
            case 'task_order_user_reset': //重置账号，并重新开始
                client_task_order_reset(msg.val);
                break;
            case 'task_order_set_exception': //订单标记异常
                client_task_order_exception_reset();
                break;
            case 'get_business_account_password':
                getBusinessAccountPassword(sender, sendResponse);
                break;

            default:
                break;

        }

        sendResponse && sendResponse();

    });
}

/**
 * 任务执行状态 核对
 */
function statusInterval() {
    var OFF_report = true;//暂停时报告状态
    setInterval(function () {
        useLocal( function (local) {
            //console.log(local);

            if (local.isRunning) {
                OFF_report = true;
                var host_status = local.host_status;
                var reported_status = local.reported_status;
                //console.log(host_status);
                if (host_status > 0) {//运行
                    //console.log(host_status);
                    if (reported_status != host_status) {
                        console.log(reported_status + '!=' + host_status);
                        //任务运行状态报告
                        setReportedStatus(host_status);
                    } else {
                        //保存数据
                        if (host_status == 20011) {//请求服务器任务失败，重新请求
                            setHostStatus(10032, getTask);
                        } else if (host_status == 90020) {//90020确认付款，保存数据
                            setHostStatus(90030, save_host_task_info);

                        } else if (host_status == 100010 || host_status == 100001) {//100010任务完成
                            //初始化客户端状态
                            setHostStatus(0);

                        }


                    }

                } else {

                    //最后一单否
                    if (local.last_order) {
                        //最后一单，暂停 ，不继续领单
                        setLocal({isRunning: false}, function () {
                            setLocal({last_order: false}, function () {
                            });
                        });

                    } else {
                        GetTaskStatus = false;
                        StartTaskOpenUrl = false;
                        //不是最后一单继续领单，
                        //初始化客户端  关闭所有窗口 准备开始任务
                        setHostStatus(10001, CloseWindowsAll);//正式使用

                    }

                }

            } else {
                console.log('OFF');
                //暂停状态
                if (OFF_report) {
                    OFF_report = false;
                    statusReport();
                }

            }
        });
    }, 1000);
}


/**
 * 桌面提醒
 * @param message
 */
function notify(message) {
    opt = {
        type: 'basic',
        title: '',
        message: message,
        iconUrl: 'image/easyicon.png'
    };

    chrome.notifications.create('', opt, function (id) {
        setTimeout(function () {
            chrome.notifications.clear(id, function () {

            });
        }, 10000);
    });
}

/**
 * 确认ip格式
 * @param value
 * @returns {boolean}
 */
function validate_ip_address(value) {
    var re = new RegExp(/^\d+\.\d+\.\d+\.\d+$/)
    return re.test(value)
}

/**
 * 设置一号店cookie  收货地区，选择 ,按照省份设置
 * @param province
 * @param func
 */
function yhd_set_cookie_province_id(province, func) {

    var province_id = gbl_const_yhd_address_map[province];
    if (province_id == undefined) {
        province_id = 1;//如果 没有要设置的cookie值，就默认为 1 上海
        province = "上海"
    }

    if (province_id != undefined) {
        notify("设置一号店收货地区 " + province);
        console.log('设置地址provinceId = ' + province);


        var province_cookie = {
            url: 'http://www.yhd.com',
            name: 'provinceId',
            value: province_id.toString(),
            domain: 'yhd.com',
            path: '/'
        };

        chrome.cookies.set(province_cookie, function () {

            var item_province_cookie = {
                url: 'http://item.yhd.com',
                name: 'provinceId',
                value: province_id.toString(),
                domain: 'yhd.com',
                path: '/'
            };
            chrome.cookies.set(item_province_cookie, function () {

                if (func) {
                    func();
                }
            });

        });

    }
}


//清除cookie 
function clearCookies(func) {
    useLocal( function (data) {
        var OldStorage = data;
        var TmpStorage = {
            "env": OldStorage.env ? OldStorage.env : 0,
            "isRunning": OldStorage.isRunning ? OldStorage.isRunning : false,
            "host_id": OldStorage.host_id ? OldStorage.host_id : '',
            "host_status": OldStorage.host_status ? OldStorage.host_status : 0,
            "host_step": OldStorage.host_step ? OldStorage.host_step : 0,
            "reported_status": OldStorage.reported_status ? OldStorage.reported_status : 0,
            "username": OldStorage.username ? OldStorage.username : 0,
            "password": OldStorage.password ? OldStorage.password : 0,
            "pay": OldStorage.pay ? OldStorage.pay : '',
            "last_ip": OldStorage.last_ip ? OldStorage.last_ip : 0,
            "proxy_ip": ''
        };
        chrome.storage.local.clear();
        chrome.browsingData.remove(
            {
                originTypes: {
                    unprotectedWeb: true,
                    protectedWeb: true
                }
            }, {
                cookies: true,
                appcache: true,
                cache: true,
                history: true,
                indexedDB: true,
                localStorage: true
            },
            function () {
                setLocal(TmpStorage, func);
            }
        );


    });
}

//关闭标签tab
function closeTabByUrl(url) {

    chrome.tabs.query({
        url: url
    }, function (tabs) {

        if (tabs.length > 0) {
            chrome.tabs.remove(tabs[0].id, function () {

            });
        }

    });
}

//打开新的标签
function create_tab_by_url(url) {
    chrome.tabs.create({
        url: url
    }, function (tabs) {

    });
}

//更新标签为固定状态
function update_tab_pinned(sender) {

    var tid = sender.tab.id;
    chrome.tabs.update(tid, {pinned: true}, function () {

    });

}

//创建隐身窗口
function create_incognito_window_by_url(url, f) {
    chrome.windows.create({
        url: url,
        incognito: true
    }, function () {

    });
}

/**
 * 保存主机订单任务相关信息
 */
function saveHostTaskOrderDetail() {

    API = new Api();
    useLocal( function (local) {

        console.log(local);
        if (local.task && local.orderinfo) {
            var submit = {
                action: 'task_order_submit',
                host_id: local.host_id,//
                username: local.username,//
                password: local.password,//

                task_order_id: local.task.task_order_id,//   任务 id

                business_oid: local.orderinfo.order_id,//   订单id
                business_discount_fee: local.orderinfo.discount_fee,// 用券金额(折扣)
                business_payment_fee: local.orderinfo.payment_fee,//  券扣金额(实际银行支付的金额)
                business_freight_fee: local.orderinfo.yunfei,//  运费

                //consignee_province: local.order_consignee.province,//
                //consignee_city: local.order_consignee.city,//
                //consignee_area: local.order_address !== undefined ? local.order_address.area : '',//区，没有为空
                //consignee_short_address: local.order_consignee.short_address,//

                consignee_name: local.orderinfo.consignee_user,// 收货人姓名
                consignee_mobile: local.orderinfo.consignee_mobile,//  收货人电话
                consignee_address: local.orderinfo.consignee_address// 收货人地址
            };

            API.setParams(submit);
            API.post(function (ret) {

                //设置保存成功
                if (ret.success == 1) {

                    setLocal({task_finish_show: true}, function () {
                        console.log('数据保存成功');
                        notify("数据保存成功");
                        setHostStatus(2000000, startHost);//任务完成
                    });

                } else {
                    console.log(ret.message);
                    notify(ret.message);
                    if (ret.message != '已完成订单不能重复提交') {
                        var item = {isRunning:0};
                        setLocal(item,function(){
                            notify(ret.message);
                        });
                    }

                }


            });
        } else {
            console.log("数据不完整");
            console.log(local);
        }

    });
}

//订单操作
function client_task_order_operate(act) {
    if (act == 'client_task_order_reset') {
        client_task_order_reset();
    } else if (act == 'client_task_order_exception_reset') {
        client_task_order_exception_reset();
    } else if (act == 'client_host_status_reset') {
        //重新开始
        startHost();
    }
}


//订单重置账号接口
function client_task_order_reset(remark) {
    setHostStatus(2);//报道订单重置状态
    remark = remark ? remark : '未知';
    API = new Api();
    useLocal( function (local) {
        //console.log(local);
        var params = {
            action: 'task_order_reset',
            host_id: local.host_id,
            username: local.username,
            password: local.password,
            task_order_id: local.task.task_order_id,
            remark: remark
        };

        API.setParams(params);
        API.post(function (ret) {
            if (ret.success == 1) {
                console.log('账号重置成功，，重置账号');
                notify("账号重置成功！");

                //重置账号，，成功后，任务重新开始
                startHost();


                //if (local.task.is_mobile == 1) {//手机单重置账号后 ，直接重跑
                //    //初始化
                //    setHostStatus(0);
                //} else {
                //
                //    if (ret.data.username && ret.data.password) {
                //        local.task.username = ret.data.username;
                //        local.task.password = ret.data.password;
                //        setLocal({task: local.task}, function () {
                //            //账号重置完成 激活页面 返回上一页 刷新
                //            safe_verify_go_back();
                //        });
                //    } else {
                //        console.log("没有账号信息！");
                //    }
                //    ;
                //
                //}

            } else {
                console.log('账号重置失败');
                notify("账号重置 失败(" + ret.message + ")");
            }

        });

    });
}

//订单异常
function client_task_order_exception_reset() {
    setHostStatus(3);//报道订单异常状态
    API = new Api();
    useLocal( function (local) {
        //console.log(local);
        var params = {
            action: 'task_order_exception_reset',
            host_id: local.host_id,
            username: local.username,
            password: local.password,
            task_order_id: local.task.task_order_id
        };

        API.setParams(params);
        API.post(function (ret) {
            if (ret.success == 1) {
                console.log('标记订单异常成功');
                notify("标记订单异常成功");
                startHost();//重新开始
            } else {
                console.log('标记订单异常 失败');
                notify("标记订单异常 失败");
            }

        });

    });
}

//搜索京东激活页面并返回上一页 、 重置账号成功后的操作
function safe_verify_go_back() {
    //http://safe.jd.com/dangerousVerify/index.action
    chrome.tabs.query({url: "*://safe.jd.com/dangerousVerify/index.action*"}, function (tabs) {
        if (tabs.length > 0) {
            var tab_id = tabs[0].id;
            chrome.tabs.executeScript(tab_id, {
                    code: "history.go(-1);",
                    allFrames: true
                }, function (result) {
                    //console.log(result);
                }
            );
        } else {
            console.log('没有找到账号激活页面！');
            notify("没有找到账号激活页面！");
        }

    });

}