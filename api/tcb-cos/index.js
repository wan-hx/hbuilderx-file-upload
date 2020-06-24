var fs = require('fs');
var os = require('os');
var path = require('path');

var COS = require('cos-nodejs-sdk-v5');
var hx = require('hbuilderx');

let mix = require('../mix/mix.js');
let Msg = require('../common/message.js');

// 获取操作系统版本
var platform = os.platform();

/**
 * @param {Object} cos
 * @param {String} Bucket
 * @param {String} Region
 * @param {String} LocalFilePath 本地文件绝对路径
 * @param {String} ServerFilePath 云服务文件路径
 */
function Upload({cos,Bucket,Region,LocalFilePath,ServerFilePath,ActionType,ServerConfig}) {
    return new Promise(function(resolve, reject) {
        cos.putObject({
            Bucket: Bucket,
            Key: ServerFilePath,
            Region: Region,
            Body: fs.createReadStream(LocalFilePath),
            onProgress: function(progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, function(err, data) {
            if (err) {
                if (['InvalidAccessKeyId'].includes(err.error.Code)) {
                    Msg.MessageNotification('checkConfig', '腾讯云', err.error.Code);
                } else if (err.error.Message) {
                    Msg.MessageNotification('error', '腾讯云', err.error.Message);
                } else {
                    Msg.MessageNotification('serverError', '腾讯云', err.error);
                }
                reject(err)
            }
            if (data) {
                if (data.statusCode == 200) {
                    let url = data.Location;
                    if (ServerConfig.DomainName) {
                        url = ServerConfig.DomainName + "/" + ServerFilePath;
                    }
                    // 拷贝url到剪切板
                    hx.env.clipboard.writeText(url);
                    Msg.MessageNotification('uploadSuccess', '腾讯云','',ActionType);
                    resolve(url);
                }
            }
        });
    })
}

/**
 * @description 上传
 */
async function TcbUpload(info,ServerConfig) {
    // 本地文件绝对路径
    let LocalFilePath = info['fspath'];
    let ActionType = info['type'];

    // 云服务器文件信息及路径
    let ServerName = info['ServerFileName'];
    let ServerFilePath = path.join(ServerConfig.Path, ServerName);

    if (platform.includes("win32")) {
        ServerFilePath = ServerFilePath.replace(/\\/g, '/')
    }

    // 初始化腾讯云存储信息
    let SecretId = ServerConfig.SecretId;
    let SecretKey = ServerConfig.SecretKey;
    let Bucket = ServerConfig.Bucket;
    let Region = ServerConfig.Region;

    if (ServerConfig.isEncrypt) {
        try {
            SecretId = mix.MixD(SecretId);
            SecretKey = mix.MixD(SecretKey);
        } catch (e) {
            Msg.MessageNotification('checkConfig', '腾讯云', 'SecretId或SecretKey无效，请检查或重新加密。');
            return false;
        }
    }

    var cos = new COS({
        SecretId: SecretId,
        SecretKey: SecretKey
    });

    // 上传
    let url = await Upload({cos,Bucket,Region,LocalFilePath,ServerFilePath,ActionType,ServerConfig})
    return url;
};

module.exports = {
    TcbUpload
}
