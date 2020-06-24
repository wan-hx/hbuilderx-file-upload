const os = require('os');
const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');

const hx = require('hbuilderx');

const mix = require('../mix/mix.js');
const Msg = require('../common/message.js');

// 获取操作系统版本
const platform = os.platform();


/**
 * @description 阿里云上传文件图片
 * @param {Object} info 项目管理器的选中信息
 */
async function AliUpload(info,ServerConfig) {
    // 本地文件
    let ActionType = info['type'];
    let LocalFilePath = info['fspath'];
    let ServerName = info['ServerFileName'];

    let {accessKeyId,accessKeySecret,region,bucket,Path} = ServerConfig;

    // 云服务器文件信息及路径
    let ServerFilePath = path.join(Path, ServerName);
    if (platform.includes("win32")) {
        ServerFilePath = ServerFilePath.replace(/\\/g,'/')
    }

    // 获取云服务器配置信息

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
        if (ActionType == 'dir') {
            return {'status': true,'data':url}
        } else {
            hx.env.clipboard.writeText(url);
            Msg.MessageNotification('uploadSuccess','阿里云','',ActionType);
            return url;
        }
    } catch (e) {
        if (ActionType != 'dir') {
            if (e.code == 'InvalidAccessKeyId' || e.code == 'SignatureDoesNotMatch') {
                Msg.MessageNotification('checkConfig','阿里云',e.code);
            } else {
                Msg.MessageNotification('error','阿里云',e.code);
            }
        } else {
            return {'status': false,'data':e.code};
        }
    }
}

module.exports = {
    AliUpload
}
