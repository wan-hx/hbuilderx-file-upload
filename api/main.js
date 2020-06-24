var fs = require('fs');
var path = require('path');

var hx = require('hbuilderx');

var tcb = require('./tcb-cos/index.js');
var ali = require('./ali-oss/index.js');
var qiniu = require('./qiniu/index.js');

var markdown = require('./markdown/index.js');
var clipboard = require('./clipboard/index.js');

var common = require('./common/common.js');
const ServerConfig = require('../config/server.js');


/**
 * @description 生成上传服务器的文件名称，当TimestampFileName为True时, 文件名为时间戳
 * @param {Object} config 云服务器配置
 * @param {String} filepath 本地文件绝对路径
 * @return {String} ServerFileName 服务器文件名称
 */
function getServerName(config, filepath) {
    let basename = path.basename(filepath);
    let ServerFileName = basename;
    if (config.TimestampFileName) {
        let extname = path.extname(filepath);
        ServerFileName = ((new Date()).valueOf()).toString() + extname;
    }
    return ServerFileName
};

/**
 * @description 预处理文件信息
 * @param {Object} config 云服务器配置
 * @param {Object} info 文件信息
 * @param {String} ActionType 操作类型, 只有两个值：md | default
 */
function PreProcessing(config, info, ActionType) {
    // 本地文件绝对路径
    var fsPath = '';

    if (JSON.stringify(info) == '{}' || info == null || info == undefined) {
        hx.window.showErrorMessage("请在项目管理器选择一个文件进行操作。");
        return {
            'type': 'error'
        };
    };

    // 先这样写，以后再改
    try {
        fsPath = info.document.uri.fsPath;
    } catch (e) {
        fsPath = info.fsPath;
    }

    if ("metaType" in info) {
        if (ActionType == 'md' && info['metaType'] == 'TextEditor') {
            if (info.document.languageId != 'markdown') {
                hx.window.showErrorMessage('如要上传当前行所包含的图片，请在Markdown文件内进行操作。');
                return {
                    'type': 'error'
                };
            }
            if (info['metaType'] != 'TextEditor') {
                hx.window.showErrorMessage('MarkDown: 操作失败，获取当前行内容失败。');
                return {
                    'type': 'error'
                };
            }
            return {
                'type': 'markdown'
            }
        }
    }

    // 检查
    let isCheck = (path.basename(fsPath)).substring(0, 1);
    if (fsPath.includes('config/server.js') || isCheck == '.') {
        let msg = '【警告】上传文件, 可能是一个配置文件或隐藏文件。如需上传，请重命名后再试。';
        hx.window.showErrorMessage(msg,['关闭']);
        return {
            'type': 'error'
        };
    }

    // 获取文件信息
    var stats = fs.statSync(fsPath);
    // 文件
    if (stats.isFile()) {
        let ServerFileName = getServerName(config, fsPath);
        return {
            'type': 'file',
            'fspath': fsPath,
            'ServerFileName': ServerFileName
        }
    }
    // 目录
    if (stats.isDirectory()) {
        // let lists = common.walkSync(fsPath)
        hx.window.showInformationMessage("暂不支持按目录上传。")
        return {
            'type': 'dir',
            'lists': 'lists'
        }
    }
};


/**
 * @description 腾讯云上传文件图片
 * @param {Object} LocalFileInfo 项目管理器的选中信息
 * @param {String} ServerType 七牛云 | 阿里云 | 腾讯云
 */
function Main(LocalFileInfo, ServerType) {
    // HBuilderX文件预处理
    let config = ServerConfig[ServerType]
    let info = PreProcessing(config, LocalFileInfo, 'default');
    console.log("待上传信息", info);

    // 目录、错误
    if (info['type'] == 'dir' || info['type'] == 'error') {
        return;
    }

    // 项目管理器上传文件
    if (info['type'] == 'file') {
        if (ServerType == 'aliyun') {
            ali.AliUpload(info)
        } else if (ServerType == 'tcb') {
            tcb.TcbUpload(info)
        } else if (ServerType == 'qiniu') {
            qiniu.QiniuUpload(info)
        }
        return;
    }
};

/**
 * @description 操作MarkDown内替换所在行图片
 */
function handleMarkDown(LocalFileInfo, ServerType) {
    let config = ServerConfig[ServerType]
    let info = PreProcessing(config, LocalFileInfo, 'md');
    if (info['type'] == 'markdown') {
        if (ServerType == 'aliyun') {
            markdown.MarkDownImgReplace(ali.AliUpload);
        } else if (ServerType == 'tcb') {
            markdown.MarkDownImgReplace(tcb.TcbUpload);
        } else if (ServerType == 'qiniu') {
            markdown.MarkDownImgReplace(qiniu.QiniuUpload);
        }
        return;
    }
}

/**
 *@description 操作剪切板
 */
function handleClipboard() {
    async function handle() {
        let LocalPath = await clipboard.getClipboard();
        if (!LocalPath) {
            return;
        }
        let serverCode = await clipboard.selectServer();
        let req = {
            'type': 'file',
            'fspath': LocalPath,
            'ServerFileName': path.basename(LocalPath)
        }
        switch (serverCode) {
            case 'qiniu':
                qiniu.QiniuUpload(req);
                break;
            case 'tcb':
                tcb.TcbUpload(req);
                break;
            case 'aliyun':
                ali.AliUpload(req);
                break;
        }
    }
    handle();
};


module.exports = {
    Main,
    handleClipboard,
    handleMarkDown
}
