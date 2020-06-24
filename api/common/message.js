let hx = require('hbuilderx');
let path = require('path');

/**
 * @description 消息
 * @param {String} msgType 消息类型
 * @param {String} serverName 云服务厂商名称 (阿里云 | 七牛云 | 腾讯云)
 * @param {String} msgText 消息文本
 * @param {String} actionType
 */
function MessageNotification(msgType, serverName, msgText='',actionType='') {
    switch (msgType+actionType) {
        case 'uploadSuccessfile':
            let remark = "<br/><span style='color: Gray;font-size:13px;'>备注：链接已自动拷贝到剪切板。</span>"
            const msg1 = serverName + ': 图片上传成功。<br />' + remark;
            hx.window.showInformationMessage(msg1, ['关闭']);
            break;
        case 'uploadSuccessmarkdown':
            const msg2 = serverName + ': ' + '图片上传成功';
            hx.window.setStatusBarMessage(msg2,5000,'info');
            break;
        case 'checkConfig':
            msgText = serverName + ': ' + msgText + '<br/>';
            let resultPromise = hx.window.showErrorMessage(msgText, ['检查配置', '关闭']);
            resultPromise.then((btnText) => {
                if (btnText === '检查配置') {
                    let dirname = (__dirname).toString().replace('api/common', '')
                    let url = path.join(dirname, 'config', 'server.js');
                    hx.workspace.openTextDocument(url);
                }
            });
            break;
        case 'error':
            hx.window.showErrorMessage(serverName + ': ' + msgText);
            break;
        case 'serverError':
            hx.window.showErrorMessage(serverName + ': ' + msgText);
            break;
    }
}

module.exports = {
    MessageNotification
}
