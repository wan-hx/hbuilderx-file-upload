const os = require('os');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const hx = require('hbuilderx');

// 获取操作系统版本
const platform = os.platform();


/**
 * @description 读取MarkDown文件内容
 * @param {Object} fspath 文件路径
 */
function getMarkDownFileContent(fspath, callback) {
    var result = [];
    const rl = readline.createInterface({
        input: fs.createReadStream(fspath)
    });
    rl.on('line', (line) => {
        result.push(line);
    });
    rl.on('close', () => {
        callback(result)
    });
};


/**
 * @description 将内容写入markdown
 * @param {Object} fspath 文件路径
 */
function WriteMarkDown(fspath, fileContent) {
    var file = fs.createWriteStream(fspath)
    fileContent.forEach(function(v) {
        file.write(v + '\n');
    });
};


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
function MarkDownLineImgReplace(fn, ServerConfig) {
    let activeEditor = hx.window.getActiveTextEditor();
    activeEditor.then(function(editor) {
        let fsName = editor.document.fileName;
        let fsPath = editor.document.uri.path;

        if (platform.includes("win32") && fsPath.substring(0, 1) == '/') {
            fsPath = fsPath.substring(1);
        }

        let linePromise = editor.document.lineFromPosition(editor.selection.active);
        linePromise.then((line) => {
            let {
                start,
                end,
                text
            } = line;
            let LineText = text;
            end = start + LineText.length;
            console.log("\nmarkdown", start, end, LineText);
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
                var server_url = await fn(ServerReq, ServerConfig);
                if (server_url && server_url != undefined) {
                    let waitWriteText = LineText.replace(rawImgUrl, server_url);
                    LineReplace(start, end, waitWriteText);
                }
            }
            handle();
        })
    })
};


/**
 * @description 分析
 */
async function analysisLine(fsPath, fsName, outputChannel, rowNumber, LineText, fn, ServerConfig) {
    rowNumber = Number(rowNumber) + 1;

    let patt = /!{1}\[(.*)\]\(.+\)/;
    if (!patt.test(LineText)) {
        return {'text':LineText, 'status':false}
    };
    let MdImgUrlInfo = patt.exec(LineText)[0];
    let ImgTitle = patt.exec(LineText)[1];
    // 去掉 ![]()
    rawImgUrl = MdImgUrlInfo.split('](')[1].replace(')', '');
    // 获取本地图片地址
    let imgLocalPath = getMarkDownImgLocalPath(rawImgUrl, fsPath, fsName);

    let ServerName = rawImgUrl.replace(/(\.+\/)/g, '')
    let ServerReq = {
        "type": "markdown",
        "fspath": imgLocalPath,
        "ServerFileName": ServerName
    }
    if (fs.existsSync(imgLocalPath)) {
        outputChannel.appendLine("解析成功, 开始上传: " + rawImgUrl)
        var uploadResult = await fn(ServerReq, ServerConfig);
        return { "text":'![' + ImgTitle + '](' + uploadResult + ')',"status": true }
    } else {
        const error_msg = "解析失败, 第" + rowNumber + ' 行, ' + rawImgUrl + ' 有可能不是一张有效的本地图片';
        outputChannel.appendLine(error_msg);
        return {'text':LineText, 'status':false}
    }
};


/**
 * @description markdown整体文件上传图片
 */
function MarkDownAll(fn, ServerConfig) {
    // 显示控制台
    let outputChannel = hx.window.createOutputChannel('MarkDown');
    outputChannel.show();

    // 从当前激活的编辑器中获取信息
    let activeEditor = hx.window.getActiveTextEditor();
    activeEditor.then(function(editor) {
        let MarkDownName = editor.document.fileName;
        let fsPath = editor.document.uri.fsPath;

        try {
            fs.accessSync(fsPath, fs.constants.R_OK | fs.constants.W_OK);
            outputChannel.appendLine('开始解析MarkDown文件中的图片...')
        } catch (err) {
            outputChannel.appendLine('请检查文件权限')
            return;
        }

        getMarkDownFileContent(fsPath, function(arr) {
            let fileContent = arr.slice(arr)
            let data = [];
            fileContent.forEach((item,idx) => data.push({"LineNumber":idx,"LineText":item}))

            // 先这样处理
            const promises = data.map( item => {
                let LineText = item.LineText
                let LineNumber = item.LineNumber
                return analysisLine(fsPath, MarkDownName, outputChannel, LineNumber, LineText, fn, ServerConfig)
            });

            Promise.all(promises).then(function(posts) {
                try{
                    outputChannel.appendLine('分析完成。');
                    let isWrite = false;
                    let lastResult = posts.map( item => {
                        if (item.status) {
                            isWrite = true
                        }
                        return item.text
                    })
                    if (isWrite) {
                        outputChannel.appendLine('开始更新.....');
                        WriteMarkDown(fsPath,lastResult);
                        outputChannel.appendLine('更新成功.....');
                        outputChannel.appendLine('备注: 若文档内容没有更新，请重新打开。');
                    } else {
                        outputChannel.appendLine('文档内，没有要上传的图片。');
                    }
                }catch(e){
                    outputChannel.appendLine('操作失败, 原因: ' + e);
                }
            }).catch(function(reason) {
                outputChannel.appendLine(reason);
            });

        });
    });
};

module.exports = {
    MarkDownLineImgReplace,
    MarkDownAll
}
