const fs = require('fs');
const os = require('os');
const path = require('path');
const qiniu = require('qiniu');
const hx = require('hbuilderx');

const mix = require('../mix/mix.js');
const Msg = require('../common/message.js');

// 获取操作系统版本
const platform = os.platform();


/**
 * @description 七牛key
 * @param {String} key 上传到七牛后保存的文件名
 * @return {String} token 返回七牛上传时用到Token
 */
function getSkAk(ServerConfig) {
    let secretKey = ServerConfig.secretKey;
    let accessKey = ServerConfig.accessKey;
    if (ServerConfig.isEncrypt) {
        try {
            secretKey = mix.MixD(secretKey);
            accessKey = mix.MixD(accessKey);
        } catch (e) {
            Msg.MessageNotification('checkConfig', '七牛云', 'SecretId或SecretKey无效，请检查或重新加密。')
            return false;
        }
    }
    return {
        "secretKey": secretKey,
        "accessKey": accessKey
    }
};


/**
 * @description 构建token
 */
const uptoken = (bucket, key) => {
    const policy = new qiniu.rs.PutPolicy({
        isPrefixalScope: 1,
        scope: bucket + ':' + key
    })
    return policy.uploadToken()
};


/**
 *@description 上传
 */
function Upload({formUploader,token,extra,ServerFilePath,LocalFilePath,ActionType,ServerConfig}) {
    return new Promise(function(resolve, reject) {
        formUploader.putFile(token, ServerFilePath, LocalFilePath, extra, function(err, ret) {
            if (err) {
                Msg.MessageNotification('serverError', '七牛云', err);
                reject({'status': false,'data':err});
            }
            if ("key" in ret) {
                let url = ret.key;
                if (ServerConfig.DomainName) {
                    url = ServerConfig.DomainName + "/" + ret.key;
                }

                // 拷贝url
                if (ActionType != 'markdown') {
                    hx.env.clipboard.writeText(url);
                }
                if (ActionType == 'dir') {
                    resolve({'status': true,'data':url});
                } else {
                    Msg.MessageNotification('uploadSuccess', '七牛云', '', ActionType);
                    resolve(url);
                }
            } else {
                if (ActionType == 'dir') {
                   reject({'status': false,'data':ret.error});
                }
                Msg.MessageNotification('serverError', '七牛云', ret.error);
            }
        });
    })
}

/**
 * @description  构建上传方法
 * @param {Object} info
 */
async function QiniuUpload(info,ServerConfig) {
    // 本地文件绝对路径
    let LocalFilePath = info['fspath'];
    let ActionType = info['type'];

    // 云服务器文件信息及路径
    let ServerFilePath = info['ServerFileName'];
    if (ServerConfig.Path) {
        ServerFilePath = path.join(ServerConfig.Path, ServerFilePath);
    }

    if (platform.includes("win32")) {
        ServerFilePath = ServerFilePath.replace(/\\/g, '/');
    }

    // Access Key 和 Secret Key
    let skak = getSkAk(ServerConfig);
    qiniu.conf.ACCESS_KEY = skak.accessKey;
    qiniu.conf.SECRET_KEY = skak.secretKey;
    let config = new qiniu.conf.Config();

    // 七牛上传的token
    let bucket = ServerConfig.Bucket;
    let token = uptoken(bucket, ServerFilePath);
    let extra = new qiniu.form_up.PutExtra();
    let formUploader = new qiniu.form_up.FormUploader(config);

    // 开始上传
    let url = await Upload({
        formUploader,
        token,
        extra,
        ServerFilePath,
        LocalFilePath,
        ActionType,
        ServerConfig
    });
    return url;
}


module.exports = {
    QiniuUpload
}
