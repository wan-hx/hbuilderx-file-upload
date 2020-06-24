# 一键上传

1. 支持上传文件到`阿里云oss`、`腾讯云cos`、`七牛云`
2. 支持上传剪切板中的本地地址 (即以file://开头、或为本地文件的绝对路径)
3. 支持上传MarkDown中的图片
4. 配置文件，云服务器账号信息，支持加密，加强安全。

### 配置文件

1. 点击菜单【工具】【一键上传】【编辑云服务器配置】
2. 目前，仅支持`阿里云oss`、`腾讯云cos`、`七牛云`

![](https://static-d2fe25e2-dc8e-446a-82d7-3694be1b150d.bspapp.com/release/编辑配置.png)

以腾讯云为例:
```
{
    // 是否对SecretId和SecretKey进行加密
    isEncrypt: true,
    // 腾讯云co SecretId. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
    SecretId: '',
    // 腾讯云cos SecretKey. 双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】
    SecretKey: '',
    // 腾讯云cos Bucket
    Bucket: '',
    // 腾讯云cos Region
    Region: '',
    // 服务端文件路径
    Path: '',
    // 如开启此项，则上传服务端的文件名为当前时间戳
    TimestampFileName: false,
    // 自定义域名, 如http://www.test.com, 上传后的url则为: 域名 + 上传路径
    DomainName: ''
}
```

### 如何加密？

双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】, 如下图

![](https://static-d2fe25e2-dc8e-446a-82d7-3694be1b150d.bspapp.com/release/加密.png)

### 上传文件

项目管理器，选中文件，右键菜单，点击要上传的云服务器。

![](https://static-d2fe25e2-dc8e-446a-82d7-3694be1b150d.bspapp.com/release/上传图片2.png)

markdown内，将光标置于要上传的图片所在行。

![](https://static-d2fe25e2-dc8e-446a-82d7-3694be1b150d.bspapp.com/release/上传图片1.png)
