module.exports = {
    // 腾讯云
    tcb: {
        // 必填项，是否对SecretId和SecretKey进行加密，true或false
        isEncrypt: true,
        // 必填项，腾讯云cos SecretId. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        SecretId: '',
        // 必填项，腾讯云cos SecretKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        SecretKey: '',
        // 必填项，腾讯云cos Bucket
        Bucket: '',
        // 腾讯云cos Region，如：ap-beijing
        Region: '',
        // 服务端文件路径，不要以 斜杠/ 开头，会自动拼接
        Path: '',
        // 如开启此项，则上传服务端的文件名为当前时间戳
        TimestampFileName: false,
        // 自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
        DomainName: ''
    },

    // 阿里云
    aliyun: {
        // 必填项，是否对accessKeyId和accessKeySecret进行加密，true或false
        isEncrypt: true,
        // 必填项，阿里云oss accessKeyId. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        accessKeyId: '',
        // 必填项，阿里云oss accessKeySecret. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        accessKeySecret: '',
        // 必填项，阿里云oss bucket
        bucket: '1905',
        // 必填项，阿里云oss region，如：oss-cn-qingdao
        region: '',
        // 必填项，阿里云oss endpoint，如：oss-cn-qingdao.aliyuncs.com
        endpoint: '',
        // 阿里云oss 超时时间，官方默认60，这里设置为100
        timeout: '100',
        // 服务端文件路径，不要以 斜杠/ 开头，会自动拼接
        Path: '',
        // 如开启此项，则上传服务端的文件名为当前时间戳
        TimestampFileName: false,
        // 自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
        DomainName: ''
    },

    // 七牛云
    qiniu: {
        // 必填项，是否对SecretId和SecretKey进行加密，true或false
        isEncrypt: true,
        // 必填项，七牛 accessKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        accessKey: '',
        // 必填项，七牛 secretKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        secretKey: '',
        // 必填项，Bucket
        Bucket: '',
        // Path, 不要以 斜杠/ 开头，会自动拼接
        Path: '',
        // 如开启此项，则上传服务端的文件名为当前时间戳
        TimestampFileName: false,
        // 必填项，自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
        DomainName: ''
    }
}
