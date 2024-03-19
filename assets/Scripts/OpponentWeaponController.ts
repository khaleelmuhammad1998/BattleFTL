// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    
    @property
        OpponentWeaponSpeed:number = 500;

    // LIFE-CYCLE CALLBACKS:

    onCollisionEnter(otherCollider,selfCollider){
        if(otherCollider.name == "Player<PolygonCollider>" && selfCollider.name == "OpponentWeapon<PolygonCollider>"){
            this.node.parent.getComponent('GameController').PlayerHealthController();
        }
        if(otherCollider.name == "Player<PolygonCollider>"){
            this.node.destroy();
        }
    }

    // onLoad () {}

    start () {

    }

    update (dt) {
        this.node.setPosition(this.node.position.x,this.node.position.y -= this.OpponentWeaponSpeed*dt);
        if(this.node.position.y <= -(this.node.parent.getContentSize().height)){
            this.node.destroy();
        }
    }
}
