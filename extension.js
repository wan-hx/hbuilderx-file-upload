var path = require('path');
var hx = require('hbuilderx');

var Main = require('./api/main.js');
var compound = require('./api/compound/index.js');


function activate(context) {
    // 腾讯云
    let ApiTcb = hx.commands.registerCommand('extension.ApiTcb', (param) => {
        Main.Main(param,'tcb', 'default')
    });
    // 腾讯云：md内上传当前行图片
    let ApiTcbMdImg = hx.commands.registerCommand('extension.ApiTcbMdImg', (param) => {
        Main.handleMarkDown(param,'tcb')
    });
    // 阿里云
    let ApiAli = hx.commands.registerCommand('extension.ApiAli', (param) => {
        Main.Main(param,'aliyun', 'default')
    });
    // 阿里云：md内上传当前行图片
    let ApiAliMdImg = hx.commands.registerCommand('extension.ApiAliMdImg', (param) => {
        Main.handleMarkDown(param,'aliyun')
    });
    // 七牛云
    let ApiQiniu = hx.commands.registerCommand('extension.ApiQiniu', (param) => {
        Main.Main(param,'qiniu', 'default')
    });
    // 七牛云：md内上传当前行图片
    let ApiQiniuMdImg = hx.commands.registerCommand('extension.ApiQiniuMdImg', (param) => {
        Main.handleMarkDown(param,'qiniu')
    });
    // 剪贴板
    let ApiClipboard = hx.commands.registerCommand('extension.ApiClipboard', ()=> {
        Main.handleClipboard()
    });
    // 打开编辑配置
    let OpenConfig = hx.commands.registerCommand('extension.OpenConfig', () => {
        Main.editConfig()
    });
    // 加密
    let OpenCompound = hx.commands.registerCommand('extension.OpenCompound', () => {
        compound.compound();
    });
}

function deactivate() {

}

module.exports = {
    activate,
    deactivate
}
