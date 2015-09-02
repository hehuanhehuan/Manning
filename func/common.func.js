/*****************worm*****************
 * @describe	页面公用方法库文件
 * @file 		common.func.js
 * @version		2015-5-7 16:40:28 1.0
 *****************worm*****************/

/**
 * 页面开始运行任务
 * @param callback
 * @constructor
 */
function Task(callback) {
    chrome.storage.local.get(null, function (local) {
        if (local.isRunning) {
            console.log("XSS init ... ");
            if (local.task) {
                console.log('XSS task init ... ');
                callback && callback(local);
            } else {
                console.log("XSS 没有任务");
            }
        } else {
            console.log("XSS task 暂停");
        }

    });
}

/**
 * 页面监控 继续执行使用 ，增加有延迟时间
 * @param func
 * @constructor
 */
function Run(func) {
    chrome.storage.local.get(null, function (local) {
        if (local.isRunning) {//运行中
            lazy(function () {
                func(local);
            });
        } else {
            console.log("暂停，监控操作停止-Run");
        }

    });
}

/**
 * 页面监控 继续执行使用 ，不增加有延迟时间
 * @param func
 * @constructor
 */
function r(callback) {
    chrome.storage.local.get(null, function (local) {
        if (local.isRunning) {//运行中
            callback(local);
        } else {
            console.log("暂停-r");
        }

    });
}

/**
 * 使用stroage中的local数据
 * @param callback
 */
function useLocal(callback){
    chrome.storage.local.get(null, function (local) {
        callback && callback(local);
    });
}

/**
 * 向storage的local中保存数据
 * @param i
 * @param callback
 */
function setLocal(i, callback) {
    chrome.storage.local.set(i, function () {
        callback && callback();
    });
}
/**
 * 删除storage中local里的某一个数据
 * @param k
 * @param callback
 */
function localDel(k, callback) {
    chrome.storage.local.remove(k, function () {
        callback && callback();
    });
}



/**
 * 生成一个随机数
 * @param {start} [随机数的开始值]
 * @param {end} [随机数的结束值]
 * @returns {number} [返回随机的结果]
 */
function random(start, end) {
    return Math.round(Math.random() * (end - start) + start);
}
//延迟操作
function lazy(callback, time) {
    if (time == undefined) {
        var t = random(_t.lazy_rand_time_start, _t.lazy_rand_time_end);
    } else {
        var t = time;
    }

    alertify.log(':)  ' + t, 'log', t * 1000);
    setTimeout(function () {
        callback();
    }, t * 1000);
}

//是否在数组中
function in_array(find, array) {
    for (var i = 0; i < array.length; i++) {
        if (find == array[i]) {
            return true;
        }
    }
    return false;
}

/**
 * 是否直辖市
 * @param province [省份]
 * @returns {boolean}
 */
function is_municipality(province) {
    //如果是直辖市
    if (province == '北京' || province == '上海' || province == '天津' || province == '重庆') {
        return true;
    } else {
        return false;
    }

}

/**
 * background sendMessageTobackground ，tab发送数据到background
 * @param act
 * @param val
 */
function sendMessageToBackground(act, val, callback) {
    var data = {
        'act': act,
        'val': val == undefined ? 'val' : val
    };
    chrome.runtime.sendMessage(data, function (response) {
        callback && callback(response);
    });
}
/**
 * 发送数据到background 关闭当前的tab页面
 */
function close_this_tab() {
    chrome.runtime.sendMessage({'act': 'close_tab_by_url','val': window.location.href}, function (response) {  });
}

/**
 * 报告运行状态
 * @param v
 */
function updateHostStatus(v) {
    chrome.runtime.sendMessage({act: 'status', val: v});
}

/**
 * 更新主机当前步骤
 * @param v
 */
function updateHostStep(v) {
    chrome.runtime.sendMessage({act: 'host_step', val: v});
}

/**
 * 从当前步骤重置主机运行
 * @param v
 */
function resetHostByStep() {
    chrome.runtime.sendMessage({act: 'reset_host_by_step'});
}


/**
 * 重置看门狗计时器
 */
function resetWatchDogTimer() {
    chrome.runtime.sendMessage({act: 'watch_dog'});
}


/**
 * 发送消息到background 进行桌面提醒
 * @param v
 */
function notifyMessage(v) {
    chrome.runtime.sendMessage({act: 'notify', val: v}, function (response) {  });
}
/**
 * 发送消息到background 固定标签页面
 */
function pinned_this_tab() {
    chrome.runtime.sendMessage({act: 'update_tab_pinned'}, function () { });
}

/**
 * tabs页面增加message监听，
 * @param {callback}
 */
function addListenerMessage(callback) {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
            callback && callback(request);
        }
    );
}

/**
 * 页面元素变动监控
 * @param target
 * @param callback
 * @param config
 */
function addMutationObserver(target,callback,config){
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // console.log(mutation.type);
            // console.log(mutation.target);
            // console.log(mutation);

            callback(mutation);

        });
    });

    if(config){
        var observer_config = config;
    }else{
        var observer_config = {
            attributes: true,
            childList: true,
            characterData: true,
            attributeOldValue: true,
            characterDataOldValue: true,
            subtree: true
        }
    }

    observer.observe(target, observer_config);

    //var observer_config = {
    //    attributes: true,
    //    childList: true,
    //    characterData: true,
    //    attributeOldValue: true,
    //    characterDataOldValue: true,
    //    subtree: true
    //}
    //addMutationObserver($("#p-box")[0],function(mutation){
    //    // console.log(mutation.type);
    //    // console.log(mutation.target);
    //    // console.log(mutation);
    //},observer_config);
}


/**
 * 提示信息 alertify
 * @param {message} [提示内容]
 * @param {type} [提示类型，log，error，success]
 * @param {sec} [提示停留时间，默认不关]
 */
function clue(message, type, sec) {
    type = type ? type : 'log';
    sec = sec && sec > 0 ? sec : 0;
    alertify.log(message, type, sec);
}

//触发 对象的change事件，js原生对象
function change_event(o) {
    var changeEvent = document.createEvent("MouseEvents");
    changeEvent.initEvent("change", true, true);
    o.dispatchEvent(changeEvent);
}
function click_event(o) {
    var changeEvent = document.createEvent("MouseEvents");
    changeEvent.initEvent("click", true, true);
    o.dispatchEvent(changeEvent);
}

//解除银行账号占用状态
function bank_make_over(local) {

    //检查是否自动登陆
    if (!local.pay.autologin_boc) {
        clue("中行自动登陆，未开启，无需解除");
        return false;
    }

    //填用户名，
    var bank_user = local.pay.boc_username;
    var bank_code = local.pay.bank;

    //排队，获取密码状态
    var API = new Api();
    var params = {
        action: 'set_use_status',
        host_id: local.host_id,
        username: local.username,
        password: local.password,
        bank_code: bank_code,
        bank_user: bank_user
    };

    API.setParams(params);
    API.BankAjaxPOST(function (ret) {
        if (ret.success == 1) {
            notifyMessage("[" + bank_user + "] 已解除占用");
        } else {
            //解除占用失败，稍后再试
            notifyMessage("[" + bank_user + "] 解除占用失败," + ret.message);
        }
    }, function () {
        notifyMessage("[" + bank_user + "] 解除占用失败," + ret.message);
    });

}

/**
 * 输入内容
 * @param {target} [需要输入内容的对象jq]
 * @param {string} [输入的字符串]
 * @param {callback} [输入完成后，回调函数]
 * @returns {boolean} [错误，]
 */
function writing(target, string, callback) {
    //string = "伊子凡2015春装新款 春秋装 韩版女装衣服时尚修身两件套雪纺条纹背心连衣裙";
    if (target.length <= 0) {
        console.log("wirte object not exist.", 'error');
        return false;
    }

    if (string.length <= 0) {
        console.log("string error", 'error');
        return false;
    }

    var arr = string.split('');
    var len = string.length;

    var eventClick = new MouseEvent('click', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventMove = new MouseEvent('mousemove', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventDown = new MouseEvent('mousedown', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventUp = new MouseEvent('mouseup', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventBlur = new MouseEvent('blur', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventKeydown = new MouseEvent('keydown', {'view': window, 'bubbles': true, 'cancelable': true});
    var eventKeyup = new MouseEvent('keyup', {'view': window, 'bubbles': true, 'cancelable': true});
    this.get = function () {
        if (arr.length > 0) {
            var str = arr.shift();
            setTimeout(function () {
                this.setValue(str);
            }, random(_t.write_rand_msec_start, _t.write_rand_msec_end));

        } else {
            target[0].dispatchEvent(eventBlur);
            callback && callback();
        }
    }
    this.setValue = function (str) {
        var value = target.val();
        if(value.length < len && string.indexOf(value) == 0){
            var val = value + str;
        }else{
            var val = string.substr(0,string.indexOf(arr.toString().replace(/,/g,""))) + str;
        }

        //target.val(value.length < len && string.indexOf(value) == 0 ? value + str : str);
        target.val(val);

        target[0].dispatchEvent(eventKeydown);
        target[0].dispatchEvent(eventKeyup);

        this.get();
    }

    target[0].dispatchEvent(eventMove);
    target[0].dispatchEvent(eventDown);
    target[0].dispatchEvent(eventClick);
    target[0].dispatchEvent(eventUp);

    target.val('');
    setTimeout(function () {
        target.val('');
        this.get();
    }, 2000);
}

/**
 * 点击
 * @param {object} [需要点击的对象]
 */
function clicking(object) {

    var evt_over = document.createEvent("MouseEvents");
    evt_over.initEvent("mouseover", true, true);

    //鼠标按下事件
    var evt_down = document.createEvent("MouseEvents");
    evt_down.button = 0;
    evt_down.initEvent("mousedown", true, true);
    //click
    var evt_click = document.createEvent("MouseEvents");
    evt_click.initEvent("click", true, true);

    //鼠标 弹起
    var evt_up = document.createEvent("MouseEvents");
    evt_up.button = 0;
    evt_up.initEvent("mouseup", true, true);

    if (object.length > 0) {
        object[0].dispatchEvent(evt_over);
        setTimeout(function () {
            object[0].dispatchEvent(evt_down);
            object[0].dispatchEvent(evt_click);
            object[0].dispatchEvent(evt_up);
        }, 500);


    } else {
        console.log("clicking object not exist.", 'error');
    }
}

/**
 * 检查订单是否已经提交
 * @param local
 * @returns {boolean}
 */
function taskOrderExist(local) {
    if (local.order_id === undefined) {
        return false;
    } else {
        updateHostStatus(1000001);
        clue('已经提交过订单', 'error');
        //clue('需要重新下单，请【重新开始】');
        setTimeout(resetHostByStep, 2000);
        return true;
    }
}




//保存收货地址到服务器
function saveAddressToRemote(callback){
    var API = new Api();
    useLocal(function(local){

        if(local.order_address !== undefined) {
            clue("保存到服务器后跳转");
            var params = {
                "action": "task_save_consignee",
                "host_id": local.host_id,
                "username": local.username,
                "password": local.password,
                "task_order_id": local.task.task_order_id,

                "name": local.order_address.name,
                "mobile": local.order_address.mobile,
                "province": local.order_address.province,
                "city": local.order_address.city,
                "area": local.order_address.area,
                "street": local.order_address.street,
                "address": local.order_address.short_address
            };
            API.setParams(params);
            API.ajaxPOST(function (ret) {

                if (ret.success == 1) {
                    clue('地址更新成功', 'success');
                    callback && callback();

                }else{
                    clue("<p>地址更新失败! 5秒刷新后重试 </p><p>"+ret.message+"</p>", 'error');
                    lazy(function(){
                        location.reload();
                    },5);
                }

            }, function () {
                clue("地址更新出错，5秒刷新后重试", 'error');
                lazy(function(){
                    location.reload();
                },5);
            });
        }else{
            clue("保存到服务器de收货地址没找到，未修改");
            console.log("保存到服务器的收货地址是",local.order_address);
            callback && callback();
        }
    })
}

/**
 * 订单缺货不刷标记异常
 * @param message
 */
function reportProductStockout(message){
    clue("<p>"+message+"</p><p>标记异常</p>", "error");
    var API = new Api();
    useLocal(function(local){

        var params = {
            "action": "task_set_exception",
            "host_id": local.host_id,
            "username": local.username,
            "password": local.password,
            "task_order_id": local.task.task_order_id,
            "remark": message
        };
        API.setParams(params);
        API.ajaxPOST(function (ret) {
            if (ret.success == 1) {
                clue('产品无货标记完成，重新开始任务', 'error');
                //callback && callback();
                //任务重新开始
                sendMessageToBackground('start_host');
            }else{
                clue("<p>"+ret.message+"</p><p>产品无货标记失败，10秒后重试</p>", 'error');
                setTimeout(function(){
                    reportProductStockout(message);
                },10000);
            }

        }, function () {
            clue('产品无货标记出现错误，5秒后刷新重试', 'error');
            lazy(function(){
                location.reload();
            },5)
        });

    })
}

/**
 * 任务添加备注
 * @param message
 */
function addTaskOrderRemark(message, callback){
    clue("<p>添加任务备注</p><p>"+message+"</p>");
    var API = new Api();
    useLocal(function(local){

        var params = {
            "action": "task_add_remark",
            "host_id": local.host_id,
            "username": local.username,
            "password": local.password,
            "task_id": local.task.task_id,
            "remark": message
        };
        API.setParams(params);
        API.ajaxPOST(function (ret) {
            if (ret.success == 1) {
                clue('任务添加备注完成', 'success');
                callback && callback();
            }else{
                clue("任务添加备注失败，10秒后重试", 'error');
                setTimeout(function(){
                    addTaskOrderRemark(message);
                },10000);
            }

        }, function () {
            clue('任务添加备注出现错误，5秒后刷新重试', 'error');
            lazy(function(){
                location.reload();
            },5)
        });

    })
}

/**
 * 实现自动喂狗功能
 * @param time {int}[自动喂狗时长,毫秒数]
 */
function autoResetWatchDogTimer(time){

    time = time == undefined ? 0 : time;
    setTimeout(function(){
        var spare = time - 30000;
        if(spare > 0){
            resetWatchDogTimer();
            autoResetWatchDogTimer(spare);
        }else{
            resetWatchDogTimer();
        }

    },30000)

}

function getBlobImg(img){
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL;

    //dataURL to Blob
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function base64ToBlob(dataURL){
    //dataURL to Blob
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}