import base64 from 'base-64';
import CryptoJS from "crypto-js";
import conf from "./conf.js";
import parse from 'url-parse';

function urlsafeBase64Encode(jsonFlags) {
    var encoded = base64.encode(jsonFlags);
    return base64ToUrlSafe(encoded);
};

function base64ToUrlSafe(v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
};

function hmacSha1(encodedFlags, secretKey) {
    var encoded = CryptoJS.HmacSHA1(encodedFlags, secretKey).toString(CryptoJS.enc.Base64);
    return encoded;
};

function generateAccessToken(url, body) {
    var u = parse(url, true);

    var path = u.pathname;
    var access = path + '\n';

    if (body) {
        access += body;
    }

    var digest = hmacSha1(access, conf.SECRET_KEY);
    var safeDigest = base64ToUrlSafe(digest);
    let token = 'QBox ' + conf.ACCESS_KEY + ':' + safeDigest;
    //console.log(token);
    return token;
};



class Policy {
    constructor(policy) {
        if (typeof (policy) == "undefined") {
        } else {
            this.policy = policy;
            if (typeof (policy.deadline) == "undefined" || policy.deadline == null) {
                this.policy.deadline = 3600 + Math.floor(Date.now() / 1000);
            }
        }
    }

    _parse2Str(putPolicy) {
        let str = "{";
        let keys = Object.keys(putPolicy);
        keys.forEach((key, i) => {
            let value = putPolicy[key];
            if (typeof (value) == "object") {
                str = `${str}"${key}":`
                str = `${str}"{`
                Object.keys(value).forEach((key2) => {
                    let value2 = value[key2];
                    let re = /(\$\(.*?\))/g;
                    if(re.test(value2)){
                        str = `${str}\\\"${key2}\\\":${value2},`
                    }else{
                        str = `${str}\\\"${key2}\\\":"${value2}",`
                    }

                })
                console.log(keys.length + "::" + i)
                if (i >= keys.length) {
                    str = `${str.substring(0, str.length - 1)}}"`
                }else{
                    str = `${str.substring(0, str.length - 1)}}",`
                }
            }
            else if (typeof (value) == "number") {
                str = `${str}"${key}":${value},`
            }
            else if (typeof (value) == "string") {
                str = `${str}"${key}":"${value}",`
            }
            else {
                str = `${str}"${key}":"${value}",`
            }
        })
        str = `${str.substring(0, str.length - 1)}}`;
        return str;
    }


    // _creatStr = (policy) => {
    //   policy['deadline'] = this.expires + Math.floor(Date.now() / 1000);
    //   let policyStr = JSON.stringify(policy);
    // let re = /(\"\$\(.*?\)\")/g;
    //   let newStr = policyStr.replace(re, (value) => {
    //     return value.substring(1, value.length - 1);
    //   })
    //   return newStr;
    // }

    token = () => {
        policStr = this._parse2Str(this.policy);
        console.log("policStr", policStr);
        var encodedPutPolicy = this._urlsafeBase64Encode(policStr);
        console.log("encodedPutPolicy", encodedPutPolicy);
        var sign = this._hmacSha1(encodedPutPolicy, conf.SECRET_KEY);
        var encodedSign = this._base64ToUrlSafe(sign);
        console.log("encodedSign", encodedSign);
        var uploadToken = conf.ACCESS_KEY + ':' + encodedSign + ':' + encodedPutPolicy;
        console.log("uploadToken", uploadToken);
        return uploadToken;
    }

    _urlsafeBase64Encode = (jsonFlags) => {
        var encoded = base64.encode(jsonFlags);
        return base64ToUrlSafe(encoded);
    };

    _base64ToUrlSafe = (v) => {
        return v.replace(/\//g, '_').replace(/\+/g, '-');
    };

    _hmacSha1 = (encodedFlags, secretKey) => {
        var encoded = CryptoJS.HmacSHA1(encodedFlags, secretKey).toString(CryptoJS.enc.Base64);
        return encoded;
    };

}

class GetPolicy {
    constructor(expires) {
        this.expires = expires || 3600;
    }

    makeRequest(baseUrl) {
        var deadline = this.expires + Math.floor(Date.now() / 1000);

        if (baseUrl.indexOf('?') >= 0) {
            baseUrl += '&e=';
        } else {
            baseUrl += '?e=';
        }
        baseUrl += deadline;

        var signature = hmacSha1(baseUrl, conf.SECRET_KEY);
        var encodedSign = base64ToUrlSafe(signature);
        var downloadToken = conf.ACCESS_KEY + ':' + encodedSign;

        return baseUrl + '&token=' + downloadToken;
    }
}

export default { urlsafeBase64Encode, generateAccessToken, Policy, GetPolicy }
