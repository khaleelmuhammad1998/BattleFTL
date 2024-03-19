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
        OpponentDuration:number = 0.5;
    @property
        OpponentMoveX:number = 100;
    @property
        OpponentMoveY:number = 10;
    OpponentMoveAction:cc.ActionInterval;
    @property(cc.Prefab)
        OpponentWeapon:cc.Prefab  = null;
    @property
        OpponentWeaponFrequency:number = 2.5;
    OpponentLife:number = 20;
    OpponentAnimation:boolean = true;

    // LIFE-CYCLE CALLBACKS:

    OpponentMove(){
        var OpponentMoveLeft = cc.moveBy(this.OpponentDuration,cc.v2(-this.OpponentMoveX,-this.OpponentMoveY));
        var OpponentMoveRight = cc.moveBy(this.OpponentDuration,cc.v2(this.OpponentMoveX,-this.OpponentMoveY));
        return cc.repeatForever(cc.sequence(OpponentMoveLeft,OpponentMoveRight));
    }

    spawnBullets(){
        var Bullet = cc.instantiate(this.OpponentWeapon);
        Bullet.setPosition(this.node.position.x,this.node.position.y);
        this.node.parent.addChild(Bullet);
    }

    onLoad () {
        this.OpponentMoveAction = this.OpponentMove();
        this.node.runAction(this.OpponentMoveAction);
        this.schedule(this.spawnBullets,this.OpponentWeaponFrequency,cc.macro.REPEAT_FOREVER,3.0);
    }

    onCollisionEnter(otherCollider,selfCollider){
        var OpponentAnimationSelector = this.node.getComponent(cc.Animation);
        if(otherCollider.name == "PlayerWeapon<PolygonCollider>"){
            this.OpponentLife -= 1;
            if((this.OpponentLife <= 0)&&(this.OpponentAnimation == true)){
                this.node.stopAllActions();
                this.OpponentAnimation = false;
                OpponentAnimationSelector.play('ExplosionAnimation');
            }
        }
        if(otherCollider.name == "Player<PolygonCollider>"){
            cc.director.loadScene('GameOverScene');
        }
    }

    destroyOpponent(){
        this.node.destroy();
        this.node.parent.getComponent('GameController').spawnOpponent();
        this.node.parent.getComponent('GameController').ScoreCalculate();
    }

    start () {

    }

    update (dt) {
        if(this.node.position.y <= -400){
            this.node.destroy();
            cc.director.loadScene('GameOverScene');
        }
    }
}
