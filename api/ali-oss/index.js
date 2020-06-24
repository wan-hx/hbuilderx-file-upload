var fs = require('fs');
var os = require('os');
var path = require('path');
var OSS = require('ali-oss');

var hx = require('hbuilderx');

let mix = require('../mix/mix.js');
let Msg = require('../common/message.js');
let ServerConfig = require('../../config/server.js').aliyun;

// 获取操作系统版本
var platform = os.platform();


/**
 * @description 阿里云上传文件图片
 * @param {Object} info 项目管理器的选中信息
 */
async function AliUpload(info) {
    // 本地文件
    let ActionType = info['type'];
    let LocalFilePath = info['fspath'];
    let ServerName = info['ServerFileName'];

    // 云服务器文件信息及路径
    let ServerFilePath = path.join(ServerConfig.Path, ServerName);
    if (platform.includes("win32")) {
        ServerFilePath = ServerFilePath.replace(/\\/g,'/')
    }

    // 获取云服务器配置信息
    let {accessKeyId,accessKeySecret,region,bucket} = ServerConfig;
    if (ServerConfig.isEncrypt) {
        try {
            accessKeyId = mix.MixD(accessKeyId);
            accessKeySecret = mix.MixD(accessKeySecret);
        } catch (e) {
            Msg.MessageNotification('checkConfig','阿里云','accessKeyId或accessKeySecret无效，请检查或重新加密。')
            return;
        }
    }

    // 初始化oss配置
    var client = new OSS({
        region: region,
        accessKeyId: accessKeyId,
        accessKeySecret: accessKeySecret,
        bucket: bucket,
    });

    try {
        let result = await client.put(ServerFilePath, LocalFilePath);
        // 处理url
        let url = result.url;
        if (ServerConfig.DomainName) {
            url = ServerConfig.DomainName + "/" + result.name;
        }
        // 拷贝url、消息弹窗
        hx.env.clipboard.writeText(url);
        Msg.MessageNotification('uploadSuccess','阿里云','',ActionType);
        return url;
    } catch (e) {
        if (e.code == 'InvalidAccessKeyId' || e.code == 'SignatureDoesNotMatch') {
            Msg.MessageNotification('checkConfig','阿里云',e.code);
        } else {
            Msg.MessageNotification('error','阿里云',e.code);
        }
    }
}

module.exports = {
    AliUpload
}
