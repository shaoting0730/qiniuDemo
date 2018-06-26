/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
import Qiniu, { Auth, ImgOps, Conf, Rs, Rpc } from 'react-native-qiniu';
//对于七牛修改文件参考: https://blog.csdn.net/qq_33935895/article/details/78775819
Conf.ACCESS_KEY = "从七牛账号里面获取";
Conf.SECRET_KEY = "从七牛账号里面获取";
Conf.UP_HOST = '从七牛账号里面获取';  // https://developer.qiniu.com/kodo/manual/1671/region-endpoint


type Props = {};
export default class App extends Component<Props> {
  // 构造
    constructor(props) {
      super(props);
      // 初始状态
      this.state = {
        img:'图片url'

    };
    }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.instructions} onPress={()=>this.upload()}>
          上传
        </Text>
          <Text>{this.state.img}</Text>
          <Image
              source={{uri: this.state.img}}
              style={{width:200,height:400}}
          />
      </View>
    );
  }


    /**
     * 先上传七牛 获取url
     * */
    upload =() =>{
        var img = '/Users/shaotingzhou/Desktop/qiniuDemo/uploadImg.jpg'   //图片路径 如果是从相册获取图片的话,其相册会返回
        var myDate = new Date();
        const key =  myDate.getTime()  + '.jpg';  //上传成功后该key就是图片的url路径
        //上传参数
        let params = {
            uri: img,//图片路径  可以通过第三方工具 如:ImageCropPicker等获取本地图片路径
            key: key,//要上传的key
        }
        //构建上传策略
        let policy = {
            scope: "demo",//记得这里如果格式为<bucket>:<key>形式的话,key要与params里的key保持一致,详见七牛上传策略
            returnBody://returnBody 详见上传策略
                {
                    name: "$(fname)",//获取文件名
                    size: "$(fsize)",//获取文件大小
                    w: "$(imageInfo.width)",//...
                    h: "$(imageInfo.height)",//...
                    hash: "$(etag)",//...
                },
        }

        //进行文件上传
        Rpc.uploadFile(params, policy).then((data) => {
          console.log('上传成功')
            var imgUrl = key   //七牛上的图片URL 就是之前的key + 你公司域名
            this.setState({
                img: 'http://pax8cso07.bkt.clouddn.com/' + key
            })
        }).catch((err) => {
            console.log(err)
        });

    }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
