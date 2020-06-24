var fs = require('fs');
var path = require('path');
var os = require('os');
var qiniu = require('qiniu');
var hx = require('hbuilderx');

// 获取操作系统版本
var platform = os.platform();

/**
 * @description 获取markdown图片本地地址
 * @param {String} rawImgInfo 未处理的信息, 如图片格式为![](),则rawImgInfo为()中间的的字符串
 * @param {String} MdPath Markdown文件绝对路径
 * @param {String} MdName Markdown当前文件名称
 */
function getMarkDownImgLocalPath(rawImgInfo, MdPath, MdName) {
    let LocalPath = rawImgInfo;
    // MD图片相对路径，基本信息，即去掉../
    let MdRelativePath = rawImgInfo.replace(/(\.+\/)/g, '');
    if (fs.existsSync(rawImgInfo)) {
        return rawImgInfo;
    } else if (rawImgInfo.substring(0, 2) == './') {
        LocalPath = path.join(MdPath.replace(MdName, ''), MdRelativePath)
    } else if (rawImgInfo.includes('../')) {
        // ..字符出现的数量
        let arr_imgUrl = rawImgInfo.split('/');
        let counts = (arr, value) => arr.reduce((a, v) => v === value ? a + 1 : a + 0, 0);
        let n = counts(arr_imgUrl, '..');
        let arr_fsPath = MdPath.replace('/' + MdName, '').split('/');
        // 操作系统绝对目录
        let MdAbsoluteDir = (arr_fsPath.slice(0, arr_fsPath.length - n)).join('/');
        LocalPath = path.join(MdAbsoluteDir, MdRelativePath);
    } else if (rawImgInfo.substring(0, 2) != './' && !rawImgInfo.includes('../')) {
        LocalPath = path.join(MdPath.replace(MdName, ''), rawImgInfo);
    }
    return LocalPath;
}

/**
 * @description 行内容替换
 * @param {int} 行开头
 * @param {int} 行结束
 * @param {String} 要替换的文本
 */
function LineReplace(start, end, text) {
    let editorPromise = hx.window.getActiveTextEditor();
    editorPromise.then((editor) => {
        let workspaceEdit = new hx.WorkspaceEdit();
        let edits = [];
        edits.push(new hx.TextEdit({
            start: start,
            end: end
        }, text));
        workspaceEdit.set(editor.document.uri, edits);
        hx.workspace.applyEdit(workspaceEdit);
    });
};

/**
 * @description 获取当前行内容
 * @param {Function} fn 上传函数
 * @param {Object} ServerConfig
 */
function MarkDownImgReplace(fn,ServerConfig) {
    let activeEditor = hx.window.getActiveTextEditor();
    activeEditor.then(function(editor) {
        let fsName = editor.document.fileName;
        let fsPath = editor.document.uri.path;

        if (platform.includes("win32") && fsPath.substring(0, 1) == '/') {
            fsPath = fsPath.substring(1);
        }

        let linePromise = editor.document.lineFromPosition(editor.selection.active);
        linePromise.then((line) => {
            let {start,end,text} = line;
            let LineText = text;
            end = start + LineText.length;
            console.log("\nmarkdown", start,end,LineText);
            // 正则匹配图片地址
            let patt = /!{1}\[(.*)\]\(.+\)/;
            if (!patt.test(LineText)) {
                return hx.window.showErrorMessage('MarkDown: 当前行内容未匹配到有效的本地图片地址', ['关闭']);
            }
            let MdImgUrlInfo = patt.exec(LineText)[0];

            // 去掉 ![]()
            rawImgUrl = MdImgUrlInfo.split('](')[1].replace(')', '');

            // 获取本地图片地址
            let imgLocalPath = getMarkDownImgLocalPath(rawImgUrl, fsPath, fsName);

            // 构造图片上传请求
            let ServerName = path.basename(imgLocalPath)
            if (fs.existsSync(imgLocalPath)) {
                ServerName = rawImgUrl.replace(/(\.+\/)/g, '')
            } else {
                return hx.window.showErrorMessage('MarkDown: 当前行内容未匹配到有效的本地图片地址', ['关闭']);
            }
            let ServerReq = {
                "type": "markdown",
                "fspath": imgLocalPath,
                "ServerFileName": ServerName
            }
            async function handle() {
                var server_url = await fn(ServerReq,ServerConfig);
                console.log("云服务器返回的URL:", server_url);
                if (server_url && server_url != undefined) {
                    let waitWriteText = LineText.replace(rawImgUrl, server_url);
                    console.log("待替换:",start,end,waitWriteText);
                    LineReplace(start, end, waitWriteText);
                }
            }
            handle();
        })
    })
};


module.exports = {
    MarkDownImgReplace
}
