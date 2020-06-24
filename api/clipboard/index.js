const fs = require('fs');
const hx = require('hbuilderx');

/**
 * @description 在窗口中间弹出一个可搜索的建议选择列表
 */
function selectServer() {
    let items = [{
        label: "七牛云",
        code: "qiniu"
    }, {
        label: "腾讯云",
        code: "tcb"
    }, {
        label: "阿里云",
        code: "aliyun"
    }];

    const PickResult = hx.window.showQuickPick(items, {
        placeHolder: "请选择要上传的云服务器..."
    });

    return new Promise(function(resolve, reject) {
        PickResult.then(function(result) {
            if (!result) {
                reject()
            }
            resolve(result.code);
        });
    })
}

/**
 *@description 上传剪切板的url到服务器
 */
function getClipboard() {
    var readPromise = hx.env.clipboard.readText();
    return readPromise.then(function(text) {
        let localPath = text;
        if (localPath.substring(0, 7) == 'file://') {
            localPath = localPath.substring(7)
        }
        if (fs.existsSync(localPath)) {
            var stats = fs.statSync(localPath);
            if (stats.isFile()) {
                return localPath;
            } else {
                hx.window.showErrorMessage("上传：目前仅支持对本地单个文件进行上传操作。",['关闭']);
                return;
            }
        } else {
            hx.window.showErrorMessage("上传：目前仅支持对文件进行上传操作。",['关闭']);
            return;
        }
        return;
    });
}

module.exports = {
    selectServer,
    getClipboard
}
