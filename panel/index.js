//操作面板 panel/index.js

panelIndex();

function panelIndex(){
	var position_html = '<div id="panel-XSS" class="position-XSS">\
							<div class="title-XSS">Manning <span id="pageTime"></span></div>\
							<div class="panel-XSS">\
							  <div>\
							    <p>\
							      <a href="javascript:void(0);" id="runing"></a>\
							    </p>\
							    <p>\
							      <a href="javascript: void(0);">\
                                    <input type="checkbox" id="client_host_last_task_order_checkbox" style="vertical-align: middle;"/>\
                                    <label for="client_host_last_task_order_checkbox">最后一单&nbsp;</label>\
                                  </a>\
							      <a href="javascript:void(0);" id="client_host_status_reset" title="注意：商品数量，重复下单">重新开始(注)&nbsp;</a>\
							    </p>\
							    <p  class="task_show">\
							      <a href="javascript:void(0);" id="client_task_order_reset" style="display: none;">账号重置&nbsp;</a>\
							      <a href="javascript:void(0);" id="client_task_order_exception_reset">订单异常&nbsp;</a>\
							      <a href="javascript:void(0);" id="client_host_status_finish" class="task_finish_show" >完成&nbsp;</a>\
							    </p>\
							  </div>\
							  <div id="task">\
							  	<p>\
							  		<span id="host_status"></span>\
							  	</p>\
							  </div>\
							  <div>\
							    <p>\
							      <span id="host_id"></span>&nbsp;\
							      <span id="task_order_id"></span>&nbsp;\
							      <span id="business_order_id"></span>&nbsp;\
							    </p>\
							    <p>\
							      <span id="is_mobile"></span>&nbsp;\
                                  <span id="task_item_id"></span>&nbsp;\
                                  <span id="task_promotion_url"></span>&nbsp;\
							      <span id="task_keyword"></span>&nbsp;\
							    </p>\
							    <p>\
							      <span id="task_product_name"></span>&nbsp;\
							      <span id="task_amount"></span>&nbsp;\
							    </p>\
							    <p><span id="task_username"></span>&nbsp;<span id="task_password"></span>&nbsp;<span id="task_pay_password"></span></p>\
							    <p><span id="task_consignee"></span></p>\
							  </div>\
							</div>\
						</div>';

	$("body").append(position_html);
	$(".title-XSS").click(function(){
		$(".panel-XSS").slideToggle(0);	
	});



	chrome.storage.local.get(null,function(local){
		//console.log(local);
		//显示主机 相关信息
    	$("#host_id").html(local.host_id);

        //if(local.host_id == ''){
        //    $(".task_show").first().html("没有设置主机信息");
        //    $(".task_show").first().show();
        //    return false;
        //}
    	//显示任务 相关信息
    	var task = local.task;
    	if(task!=undefined&&task.task_id!=undefined&&task.task_id > 0){
    		$(".task_show").show();
			$("#task_order_id").html(task.task_tid);
			$("#business_order_id").html(task.task_order_oid);

			$("#task_item_id").html(task.item_id);
			$("#task_keyword").html(task.keyword);
			$("#task_promotion_url").html('<a href="'+task.promotion_url+'">首页</a>');

			$("#task_product_name").html(task.product_name);
			$("#task_amount").html('( '+task.amount+' )');

			$("#task_username").html(task.username);
			$("#task_password").html(task.password);
			$("#task_pay_password").html(task.pay_password);
            var address = task.consignee;
			$("#task_consignee").html(address.name+" "+address.mobile+' '+address.province+address.city+(address.area?address.area:'')+(address.street?address.street:'')+address.short_address);

			var is_mobile = '';
			if(task.is_mobile == 1){
				is_mobile = '<img src="http://cdn-img.easyicon.net/png/109/10979.png" />';
			}
			
			$("#is_mobile").html(is_mobile);
			

			if(local.task_finish_show){
				$(".task_finish_show").show();
			}
    	}

    	//设置 开始停止
    	var runing = $("#runing");
    	if(local.isRunning === true){
    		//运行中
    		runing.text('停止任务');
    	}else{
    		//未运行
    		runing.text('开始任务');
    	}
    	runing.click(function(){
    		var text = runing.text();
    		if(text == '开始任务'){
    			//开始任务
				if (local.username==''||local.password==''||local.host_id=='') {
					alert("没有设置账号");
					return false;
				}else{
					chrome.storage.local.set({isRunning: true}, function() {
						runing.text('停止任务');
					})
				}
    		}else{
    			//停止任务
    			chrome.storage.local.set({isRunning: false}, function() {
					runing.text('开始任务');
				})
    		}
    	});

    	//运行状态
    	$("#host_status").text("运行状态："+(local.isRunning==true?'运行中：'+_host_status[local.host_status]:'暂停'));

        //显示最后一单状态
        if('last_order' in local && local.last_order!=undefined){
            $("#client_host_last_task_order_checkbox").prop('checked',local.last_order);
        }
        //最后一单操作，
        $("#client_host_last_task_order_checkbox").click(function(){

            var checked = $(this).prop('checked');
            if(checked){
                chrome.storage.local.set({last_order:true});
            }else{
                chrome.storage.local.remove('last_order');
            }
        });

		//重新开始
		$("#client_host_status_reset").click(function(){
			if(confirm("确定 重新开始 操作？\n >>>重跑注意：商品数量，重复下单<<<")){
				orderOperateSendMessage('client_host_status_reset');
			}
		});

		//账号重置
		$("#client_task_order_reset").click(function(){
			if(confirm("确定重置 账号 操作?")){
				//orderOperateSendMessage('client_task_order_reset');
                sendMessageToBackground('task_order_user_reset', '[worm]手动重置panel');
			}
		});
		//订单异常
		$("#client_task_order_exception_reset").click(function(){
			if(confirm("确定 标记  订单异常  操作?")){
				orderOperateSendMessage('client_task_order_exception_reset');
			}
		});

        pageWaitTimeShow();
	});
}

//页面停留时间计算
var page_time = 0;
function pageWaitTimeShow(){
    page_time ++;
    var h = Math.floor(page_time/3600);
    var m = Math.floor(page_time/60) % 60;
    var s = page_time % 60;
    $("#pageTime").html(h +':'+ (m<10?'0'+m:m) +':'+ (s<10?'0'+s:s));
    setTimeout(pageWaitTimeShow,1000);
}


//订单操作  
function orderOperateSendMessage(v){
  var msg = {
    act:'order_operate',
    val:v
  };
  chrome.runtime.sendMessage(msg, function(response){
    
  });
}
//状态 改变  修改 host_status
function hostStatusSendMessage(v){
  var msg = {
    act:'status',
    val:v
  };
  chrome.runtime.sendMessage(msg, function(response){
    
  });
}

function panelReload(){
    $("#panel-XSS").remove();
    panelIndex();
}