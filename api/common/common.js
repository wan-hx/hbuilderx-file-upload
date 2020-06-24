const hx = require('hbuilderx');
const fs = require('fs');
const path = require('path');


/**
 * @description 去检查配置
 * @param {String} msgText
 */
function gotoCheckConfig(msgText) {
    let resultPromise = hx.window.showErrorMessage(msgText, ['去配置']);
    resultPromise.then((btnText) => {
        if (btnText === '去配置') {
            let dirname = (__dirname).toString().replace('api/ali-oss','')
            let url = path.join(dirname, '.config', '.server.js');
            hx.workspace.openTextDocument(url);
        }
    });
}

/**
 * @description 目录遍历
 * @param {Object} dir
 * @param {Object} filelist
 */
var fileList = [];
var walkSync = function (dir,filelist) {
	files = fs.readdirSync(dir);
	filelist = filelist || [];
	files.forEach(function(file) {
		if (fs.statSync(dir + '/' + file).isDirectory()) {
			filelist = walkSync(dir + '/' + file, filelist);
		} else {
			filelist.push(path.join(dir,file));
		}
	});
	return filelist;
};

module.exports = {
    walkSync
}
