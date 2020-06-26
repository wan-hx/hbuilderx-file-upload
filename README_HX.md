# 一键上传

1. 支持上传`文件`、`目录`到`阿里云oss`、`腾讯云cos`、`七牛云`
2. 支持上传剪切板中的本地地址 (即以file://开头、或为本地文件的绝对路径)
3. 支持上传MarkDown，当前行图片
4. 支持上传MarkDown文件内所有图片
5. 配置文件，云服务器账号信息，支持加密，加强安全。

### 配置文件

1. 点击菜单【工具】【一键上传】【编辑云服务器配置】
2. 目前，仅支持`阿里云oss`、`腾讯云cos`、`七牛云`

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/questions/20200626/55fae7dae1d153c77800c0eaf15be4c6.png)

以腾讯云为例:
```
{
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
    }
```

### 如何加密？

双击选中要加密的字符串，右键菜单，点击【一键上传】【加密】, 如下图

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/questions/20200626/53db16502ec8d1185093a3f9c30eb644.png)

### 上传文件

项目管理器，选中文件，右键菜单，点击要上传的云服务器。

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/questions/20200626/a818f455ec0f1afecb983c6a0beb0dd8.png)


## markdown

1. 将光标置于要上传的图片所在行，点击【md - 当前行图片】，即可上传当前行图片。
2. 在markdown文件上，右键菜单，点击【md - 所有图片】，即可上传markdown文件内所有图片。

![](https://img-cdn-qiniu.dcloud.net.cn/uploads/questions/20200626/c7ad6a74f1fd460eebc4bab121cc31e5.png)
