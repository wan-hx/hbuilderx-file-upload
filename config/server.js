module.exports = {
    // 腾讯云
    tcb: {
        // 是否对SecretId和SecretKey进行加密
        isEncrypt: true,
        // 腾讯云co SecretId. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        SecretId: '',
        // 腾讯云cos SecretKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        SecretKey: '',
        // 腾讯云cos Bucket
        Bucket: '',
        // 腾讯云cos Region 比如：ap-beijing
        Region: '',
        // 服务端文件路径，不要以 斜杠/ 开头，会自动拼接
        Path: 'hbuilderx/temp/',
        // 如开启此项，则上传服务端的文件名为当前时间戳
        TimestampFileName: false,
        // 自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
        DomainName: 'https://download1.dcloud.net.cn'
    },

    // 阿里云
    aliyun: {
        // 是否对accessKeyId和accessKeySecret进行加密
        isEncrypt: true,
        // 阿里云oss accessKeyId. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        accessKeyId: '',
        // 阿里云oss accessKeySecret. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        accessKeySecret: '',
        // 阿里云oss bucket
        bucket: '',
        // 阿里云oss region 比如：oss-cn-qingdao
        region: '',
        // 阿里云oss endpoint 比如: oss-cn-qingdao.aliyuncs.com
        endpoint: '',
        // 阿里云oss 超时时间，官方默认60，这里设置为100
        timeout: '100',
        // 服务端文件路径，不要以 斜杠/ 开头，会自动拼接
        Path: 'hbuilderx/temp/',
        // 如开启此项，则上传服务端的文件名为当前时间戳
        TimestampFileName: true,
        // 自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
        DomainName: ''
    },

    // 七牛云
    qiniu: {
        // 是否对SecretId和SecretKey进行加密
        isEncrypt: true,
        // 七牛 accessKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        accessKey: '',
        // 七牛 secretKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
        secretKey: '',
        // Bucket
        Bucket: '',
        // Path, 不要以 斜杠/ 开头，会自动拼接
        Path: '',
        // 如开启此项，则上传服务端的文件名为当前时间戳
        TimestampFileName: true,
        // 自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
        DomainName: 'http://www.test.com'
    }
}
