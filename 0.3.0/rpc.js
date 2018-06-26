import conf from './conf.js';
import Auth from './auth';

//发送管理和fop命令,总之就是不上传文件
function post(uri, adminToken, content) {
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    let payload = {
        headers: headers,
        method: 'POST',
        dataType: 'json',
        timeout: conf.RPC_TIMEOUT,
    };
    if (typeof content === 'undefined') {
        payload.headers['Content-Length'] = 0;
    } else {
        //carry data
        payload.body = content;
    }

    if (adminToken) {
        headers['Authorization'] = adminToken;
    }

    return fetch(uri, payload);
}


/**
 * 直传文件
 * formInput对象如何配置请参考七牛官方文档“直传文件”一节
 */

function uploadFile(dataParams, policy, callbackUpDate = function () { }, callBackMethod = function () { }) {
    let params = getParams(dataParams, policy);
    let uri = params.uri;
    let data = params.data;
    let oloaded = null;
    let responseObj = {};
    return new Promise((resolve, reject) => {
        if (typeof uri != 'string' || uri == '' || typeof data.key == 'undefined') {
            reject && reject(null);
            return;
        }
        if (uri[0] == '/') {
            uri = "file://" + uri;
        }
        //创建xhr并open
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            responseObj.readyState = xhr.readyState; //状态0-4
            responseObj.data = xhr.response;//返回值
            responseObj.textData = xhr.responseText; //返回值Text
            responseObj.status = xhr.status; //状态码
            // responseObj.message = ""
            switch (xhr.readyState) {
                case 0:
                    callBackMethod(responseObj)
                    break;
                case 1:
                    callBackMethod(responseObj)
                    break;
                case 2:
                    callBackMethod(responseObj)
                    break;
                case 3:
                    callBackMethod(responseObj)
                    break;
                case 4:
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                        if (xhr.status == 200) {
                            callBackMethod(responseObj)
                        }
                    } else {
                        callBackMethod(responseObj)
                    }
                    break;
            }
        };
        xhr.open('POST', conf.UP_HOST);
        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject && reject(responseObj);
                return;
            }
            resolve && resolve(JSON.parse(responseObj.data));
        };
        xhr.onerror = (evt) => {
            reject && reject(evt);
            return;
        }; //请求失败
        xhr.upload.onloadstart = () => {//上传开始执行方法
            oloaded = 0;//设置上传开始时，以上传的文件大小为0
            console("上传开始")
        };
        xhr.upload.onprogress = (evt) => {
            oloaded = evt.loaded;//重新赋值已上传文件大小，用以下次计算
            callbackUpDate(Math.round(oloaded / evt.total * 100), oloaded, evt.total)
        };
        xhr.upload.onloadend = (evt) => {
            console("上传结束")
        };
        let formdata = creatFormData(params);
        xhr.send(formdata);
    });
}

//构造上传参数
function getParams(data, policy) {
    let putPolicy = new Auth.Policy(
        policy
    );
    let uptoken = putPolicy.token();
    data.token = uptoken;
    let params = {};
    params.uri = data.uri;
    delete data.uri;
    params.data = data;
    return params;
}

/**
 * 创建一个表单对象,用于上传参数
 * @param {*} params
 */
function creatFormData(params) {
    let formdata = new FormData();
    let uri = params.uri;
    let formInput = creatFormInput(uri);
    let data = params.data;
    console.log(data)
    for (let key of Object.keys(data)) {
        let value = data[key];
        if (key.charAt(0) === "_") {
            formdata.append("x:" + key.substring(1, key.length), value);
        } else {
            formdata.append(key, value);
        }
    }
    formdata.append("file", { uri: uri, type: formInput.type, name: formInput.name });
    console.log(formdata)
    return formdata;
}
/**
 * 构造表单对象中file对象
 * @param {*} params
 */
function creatFormInput(uri) {
    let formInput = {};
    if (typeof formInput.type == 'undefined')
        formInput.type = 'application/octet-stream';
    if (typeof formInput.name == 'undefined') {
        var filePath = uri.split("/");
        if (filePath.length > 0)
            formInput.name = filePath[filePath.length - 1];
        else
            formInput.name = "";
    }
    return formInput;
}

export default { uploadFile, post }
