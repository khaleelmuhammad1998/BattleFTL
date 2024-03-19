// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({type:cc.AudioClip})
        SoundDown = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.audioEngine.playEffect(this.SoundDown,false);
    }

    start () {

    }

    // update (dt) {}
}
