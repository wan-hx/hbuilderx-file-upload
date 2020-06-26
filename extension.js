var path = require('path');
var hx = require('hbuilderx');

var Main = require('./api/main.js');
var compound = require('./api/compound/index.js');

function activate(context) {
    // 腾讯云
    let ApiTcb = hx.commands.registerCommand('extension.ApiTcb', (param) => {
        Main.Main(param, 'tcb', 'default')
    });
    // 腾讯云：上传当前行图片 (markdown)
    let ApiTcbMdImg = hx.commands.registerCommand('extension.ApiTcbMdImg', (param) => {
        Main.MarkDownForLine(param, 'tcb')
    });
    // 腾讯云：上传所有图片 (markdown)
    let ApiTcbMdImgAll = hx.commands.registerCommand('extension.ApiTcbMdImgAll', (param) => {
        Main.MarkDownForAll('tcb')
    });
    // 阿里云
    let ApiAli = hx.commands.registerCommand('extension.ApiAli', (param) => {
        Main.Main(param, 'aliyun', 'default')
    });
    // 阿里云：上传当前行图片 (markdown)
    let ApiAliMdImg = hx.commands.registerCommand('extension.ApiAliMdImg', (param) => {
        Main.MarkDownForLine(param, 'aliyun')
    });
    // 阿里云：上传所有图片 (markdown)
    let ApiAliMdImgAll = hx.commands.registerCommand('extension.ApiAliMdImgAll', () => {
        Main.MarkDownForAll('aliyun');
    });
    // 七牛云
    let ApiQiniu = hx.commands.registerCommand('extension.ApiQiniu', (param) => {
        Main.Main(param, 'qiniu', 'default')
    });
    // 七牛云：上传当前行图片 (markdown)
    let ApiQiniuMdImg = hx.commands.registerCommand('extension.ApiQiniuMdImg', (param) => {
        Main.MarkDownForLine(param, 'qiniu')
    });
    // 七牛云：上传所有图片 (markdown)
    let ApiQiniuMdImgAll = hx.commands.registerCommand('extension.ApiQiniuMdImgAll', () => {
        Main.MarkDownForAll('qiniu');
    });
    // 剪贴板
    let ApiClipboard = hx.commands.registerCommand('extension.ApiClipboard', () => {
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
