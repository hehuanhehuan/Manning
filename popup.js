var bgPage = chrome.extension.getBackgroundPage();

$(function () {
    chrome.storage.local.get(null, function (data) {
        console.log(data);
        //if(data.host_id == ''){
        //    $(".task_show").first().html("没有设置主机信息");
        //    $(".task_show").first().show();
        //    return false;
        //}
        //显示任务相关信息
        $("#host_id").html(data.host_id);
        if (data.task != undefined && data.task.task_id != undefined && data.task.task_id > 0) {
            $(".task_show").show();

            //$("#search_link").html(data.task.keyword);//把 搜索 替换为 关键词
            $("#task_order_id").html(data.task.task_tid);
            $("#business_order_id").html(data.task.task_order_oid);

            $("#task_item_id").html(data.task.item_id);
            $("#task_keyword").html(data.task.keyword);

            $("#task_product_name").html(data.task.product_name);
            $("#task_amount").html('( ' + data.task.amount + ' )');

            $("#task_username").html(data.task.username);
            $("#task_password").html(data.task.password);
            $("#task_pay_password").html(data.task.pay_password);
            var address = data.task.consignee;
            $("#task_consignee").html(address.name+" "+address.mobile+' '+address.province+address.city+(address.area?address.area:'')+(address.street?address.street:'')+address.short_address);

            if (data.task_finish_show) {
                $(".task_finish_show").show();
            }

        }
        /*    if(data.order_id){
         $("#business_order_id").html(data.order_id);
         }*/

        if ("isRunning" in data && data.isRunning) {

            $('#task-span').html($("<a href='javascript:;'></a>").text('停止任务')
                .on('click', function () {
                    chrome.storage.local.set({
                        isRunning: false
                    }, function () {
                        window.location.reload()
                    })
                }))
        } else {
            $('#task-span').html($("<a href='javascript:;'></a>").text('开始任务')
                .on('click', function () {

                    if (data.username == '' || data.password == '' || data.host_id == '') {
                        alert("没有设置账号");
                        return false;
                    } else {
                        // window.location.reload()
                        chrome.storage.local.set({
                            isRunning: true
                        }, function () {
                            // bgPage.current_tab_reload()
                            //开始任务，如果状态是0就执行开始任务
                            if(data.host_status == 0){
                                bgPage.startHost();
                            }
                            window.location.reload()
                        })
                    }

                })
            )
        }

        //显示最后一单状态
        if ('last_order' in data && data.last_order != undefined) {
            $("#client_host_last_task_order_checkbox").prop('checked', data.last_order);
        }

        if ("host_status" in data) {
            $("#task").append("<table><tbody>")
            append_tr("运行状态：", data.isRunning ? '运行中：' + _host_status[data.host_status] : '暂停')
            $("#task").append("</tbody></table>")
        } else {
            $("#task").append("当前没有任务")
        }


    })

    $("#tasks-link").on("click", function () {
        var url = "https://disi.se/index.php/Admin/Task/my_task_orders"
        chrome.tabs.query({
            url: url
        }, function (tabs) {
            for (var i = 0, tab; tab = tabs[i]; i++) {
                if (tab.url && tab.url.indexOf(url) == 0) {
                    chrome.tabs.update(tab.id, {
                        highlighted: true
                    });
                    return
                }
            }
            chrome.tabs.create({
                url: url
            })
        })
    })

    $('#client_host_step_timeout').on("click", function () {
        bgPage.watchDogTimeOut();
    });

    $('#remove-cookies').on("click", function () {
        bgPage.clearCookies()
    });

    $("#client_host_last_task_order_checkbox").click(function () {

        var checked = $(this).prop('checked');
        if (checked) {
            chrome.storage.local.set({last_order: true}, function () {
                alert("不在继续领单！");
            });
        } else {
            chrome.storage.local.remove('last_order', function () {
                alert("继续领单！");
            });
        }
    });

    $("#client_host_status_reset").click(function () {
        if (confirm("确定重跑 任务 操作？\n >>>重跑注意：商品数量，重复下单<<<")) {
            orderOperateSendMessage('client_host_status_reset');
        }
    });

    $("#client_task_order_reset").click(function () {
        if (confirm("确定重置 账号 操作?")) {
            //orderOperateSendMessage('client_task_order_reset');
            bgPage.client_task_order_reset('[worm]popup手动重置');
            setTimeout(function () {
                window.location.reload();
            }, 1000);
        }
    });


    $("#client_task_order_exception_reset").click(function () {
        if (confirm("确定 标记  订单异常  操作?")) {
            orderOperateSendMessage('client_task_order_exception_reset');
        }
    });


    $("#task_promotion_url .promotion").on('click', open_promotion_url);

})


function append_tr(title, value) {
    $("#task").append("<tr><th>" + title + "</th><td>" + value + "</td></tr>")
}


//订单操作  
function orderOperateSendMessage(v) {
    var msg = {
        act: 'order_operate',
        val: v
    };
    chrome.runtime.sendMessage(msg, function (response) {

    });
}

function open_promotion_url() {
    chrome.storage.local.get(null, function (local) {
        var task = local.task;
        if (task) {
            bgPage.setHostStatus(1401000);//打开连接
            chrome.tabs.create({
                url: task.promotion_url
            }, function () {

            });
        }
    });
}
