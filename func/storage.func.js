/*****************worm*****************
 * @describe	storage操作
 * @file 		storage.func.js
 * @version		2015-5-29 10:57:05 1.0
 *****************worm*****************/


/**
 * 获取storage.local返回到callback
 * @param callback
 */
function useLocal(callback) {
    chrome.storage.local.get(null, function (local) {
        callback(local);
    });
}

/**
 * 保存数据到storage.local
 * @param item
 * @param callback
 */
function setLocal(item, callback) {
    chrome.storage.local.set(item, function () {
        callback && callback();
    });
}
//删除storage内容 针对单个内容
/**
 * 删除storage.local数据
 * @param key
 * @param callback
 */
function delLocal(key, callback) {
    chrome.storage.local.remove(key, function () {
        callback && callback();
    });
}
