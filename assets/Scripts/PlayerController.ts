// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    PlayerMoveLeft:number = 0;
    PlayerMoveRight:number = 0;
    @property(cc.Prefab)
        PlayerWeapon:cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    //Player Weapon Functions
    PlayerWeaponSpawn(){
        var PlWp = cc.instantiate(this.PlayerWeapon);
        PlWp.setPosition(this.node.position.x,this.node.position.y);
        this.node.parent.addChild(PlWp);
    }

    //Player Movement Functions
    PlayerActive(event){
        switch(event.keyCode){
            case cc.macro.KEY.left:
                this.PlayerMoveLeft = 1;
                break;
            case cc.macro.KEY.right:
                this.PlayerMoveRight = 1;
                break;
        }
    }

    PlayerInactive(event){
        switch(event.keyCode){
            case cc.macro.KEY.left:
                this.PlayerMoveLeft = 0;
                break;
            case cc.macro.KEY.right:
                this.PlayerMoveRight = 0;
                break;
        }
    }

    onLoad () {
        //Keyboard Input Events
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.PlayerActive,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.PlayerInactive,this);

        //Touch Screen Input Events
        this.node.parent.on('touchstart',function(event){
            if(event.getLocationX()<this.node.parent.getContentSize().width/2){
                this.PlayerMoveLeft = 1;
            }
            if(event.getLocationX()>this.node.parent.getContentSize().width/2){
                this.PlayerMoveRight = 1;
            }
        },this);
        this.node.parent.on('touchend',function(event){
            this.PlayerMoveRight = 0;
            this.PlayerMoveLeft = 0;
        },this);

        //Player Weapon Spawn Scehduler
        this.schedule(this.PlayerWeaponSpawn,0.1,cc.macro.REPEAT_FOREVER,0);
    }

    start () {

    }

    update (dt) {
        if(this.PlayerMoveLeft == 1){
            if(this.node.position.x > -226)
            {
                this.node.setPosition(this.node.position.x -= 500*dt,this.node.position.y);
            }
        }
        if(this.PlayerMoveRight == 1){
            if(this.node.position.x < 226)
            {
                this.node.setPosition(this.node.position.x += 500*dt,this.node.position.y);
            }
        }
    }
}
