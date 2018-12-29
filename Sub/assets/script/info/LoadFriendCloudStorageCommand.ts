// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ICommand} from "../facade/ICommand";
import {World} from "./World";
import Facade, {CanvasEvent} from "../facade/Facade";
import {WxStorageConverter} from "../storage/WxStorageConverter";
import RankFriendsMediator from "../app/rankFriends/RankFriendsMediator";
import {WxStorageFormat} from "../storage/WxStorageFormat";
import GameMediator from "../app/game/GameMediator";

const {ccclass, property} = cc._decorator;

@ccclass("LoadFriendCloudStorageCommand")
export default class LoadFriendCloudStorageCommand implements ICommand {

    async execute (...args):Promise{
        return new Promise((resolve, reject) => {
            wx.getFriendCloudStorage({
                keyList:args[0],
                success: function (res) {
                    if (typeof World.My.openId == "undefined"){
                        console.error("WxSub==>ReadMyInfoCommand must be execute before LoadFriendCloudStorageCommand.");
                        return;
                    }
                    let friendData:Array = res.data.filter(value=>value.KVDataList.length > 0);
                    console.log(friendData, "WxSub friendData");
                    let wxStorageConverter = new WxStorageConverter();
                    friendData.forEach(value=>{
                        if (value.KVDataList.length == 1){
                            /** 默认只保存一个排行榜(好友排行榜) */
                            value.wxStorageFormat = wxStorageConverter.decode<WxStorageFormat>(value.KVDataList[0].value, WxStorageFormat);
                        }else if (value.KVDataList.length > 1) {
                            console.error("WxSub===>有未处理的的排行数据");
                        }
                    });
                    /** 对数据排序 */
                    let orderData = friendData.sort(function (a, b) {
                        return b.wxStorageFormat.score - a.wxStorageFormat.score;
                    });
                    World.friendOrderData = orderData;
                    // console.log(orderData, "Wx sub orderData===>");
                    Facade.canvasNode.emit(CanvasEvent.domainShow);

                    resolve(true);
                },
                fail: function (res) {
                    console.log("WxSub==>getFriendCloudStorage fail", res);
                    reject(res);
                }
            });
        });
    }
}
