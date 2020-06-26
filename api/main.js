const fs = require('fs');
const path = require('path');

const hx = require('hbuilderx');

const tcb = require('./tcb-cos/index.js');
const ali = require('./ali-oss/index.js');
const qiniu = require('./qiniu/index.js');

const markdown = require('./markdown/index.js');
const clipboard = require('./clipboard/index.js');

const common = require('./common/common.js');
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
        let lists = common.walkSync(fsPath);
        return {
            'type': 'dir',
            'dirName':fsPath,
            'fileLists': lists
        }
    }
};


/**
 * @description 上传目录
 * @param {Object} ServerType 七牛云 | 阿里云 | 腾讯云
 * @param {Object} config 服务器配置信息
 * @param {Object} Info 文件数据
 */
function UploadDirs(ServerType,config, info) {
    // 上传信息
    let fileLists = info.fileLists;
    let filesNum = info.fileLists.length;
    let dirName = info.dirName;

    // 控制台名称
    let channel_name = ServerType;
    let outputChannel = hx.window.createOutputChannel(channel_name);
    outputChannel.show();

    let hint = '【注意】当文件数量很多时，上传需要较长时间，请耐心等待。'
    let first_msg = dirName + '下，共有 ' + filesNum + ' 个文件。';
    outputChannel.appendLine(hint)
    outputChannel.appendLine(first_msg);

    if (filesNum == 0) {
        return;
    }

    let fn = ServerType == 'aliyun'
        ? ali.AliUpload : ServerType == 'qiniu' ? qiniu.QiniuUpload : tcb.TcbUpload

    async function handle(fspath,req) {
        let res = await fn(req,config);

        let basename = path.basename(fspath);
        if (basename.length < 28) {
            let showPoint = (str, num) => str.repeat(num);
            basename = basename + showPoint('.',28-basename.length);
        }
        // 控制台打印消息
        let upload_msg = ''
        if (res.status) {
            upload_msg = basename + ' [成功] URL: ' + res.data;
        } else {
            upload_msg = basename + ' [失败] 错误: ' + res.data;
        }
        outputChannel.appendLine(upload_msg);
    }
    for (let fspath of fileLists) {
        let req = {
            'type': 'dir',
            'fspath': fspath,
            'ServerFileName': ''
        }
        req["ServerFileName"] = getServerName(config,fspath);
        handle(fspath,req);
    };
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

    // 错误
    if (info['type'] == 'error') {return;}

    // 项目管理器上传文件
    if (info['type'] == 'file') {
        if (ServerType == 'aliyun') {
            ali.AliUpload(info,config);
        } else if (ServerType == 'tcb') {
            tcb.TcbUpload(info,config);
        } else if (ServerType == 'qiniu') {
            qiniu.QiniuUpload(info,config);
        }
        return;
    };

    // 上传目录
    if (info['type'] == 'dir') {
        UploadDirs(ServerType,config,info);
    }
};


/**
 * @description 操作MarkDown内替换所在行图片
 */
function MarkDownForLine(LocalFileInfo, ServerType) {
    let config = ServerConfig[ServerType]
    let info = PreProcessing(config, LocalFileInfo, 'md');
    if (info['type'] == 'markdown') {
        if (ServerType == 'aliyun') {
            markdown.MarkDownLineImgReplace(ali.AliUpload,config);
        } else if (ServerType == 'tcb') {
            markdown.MarkDownLineImgReplace(tcb.TcbUpload,config);
        } else if (ServerType == 'qiniu') {
            markdown.MarkDownLineImgReplace(qiniu.QiniuUpload,config);
        }
        return;
    }
};


/**
 * @description 上传MarkDown文件内所有图片
 */
function MarkDownForAll(serverCode) {
    switch (serverCode) {
        case 'qiniu':
            markdown.MarkDownAll(qiniu.QiniuUpload,ServerConfig.qiniu)
            break;
        case 'tcb':
            markdown.MarkDownAll(tcb.TcbUpload,ServerConfig.tcb);
            break;
        case 'aliyun':
            markdown.MarkDownAll(ali.AliUpload,ServerConfig.aliyun);
            break;
    }
};


/**
 *@description 操作剪切板
 */
function handleClipboard() {
    async function handle() {
        let LocalPath = await clipboard.getClipboard();
        if (!LocalPath) {return;};

        let serverCode = await clipboard.selectServer();
        let req = {
            'type': 'file',
            'fspath': LocalPath,
            'ServerFileName': path.basename(LocalPath)
        }
        switch (serverCode) {
            case 'qiniu':
                qiniu.QiniuUpload(req,ServerConfig.qiniu);
                break;
            case 'tcb':
                tcb.TcbUpload(req,ServerConfig.tcb);
                break;
            case 'aliyun':
                ali.AliUpload(req,ServerConfig.aliyun);
                break;
        }
    };
    handle()
};


/**
 * @description 打开配置
 */
function editConfig() {
    let dirname = __dirname
    let pluginDir = dirname.substr(0, dirname.length - 3);
    let url = path.join(pluginDir, 'config', 'server.js');
    hx.workspace.openTextDocument(url);
};

module.exports = {
    Main,
    editConfig,
    handleClipboard,
    MarkDownForLine,
    MarkDownForAll
}
