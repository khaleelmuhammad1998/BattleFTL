// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
        Opponent:cc.Prefab = null;
    @property(cc.Prefab)
        Opponent2:cc.Prefab = null;
    @property(cc.Prefab)
        Opponent3:cc.Prefab = null;
    @property(cc.Prefab)
        Opponent4:cc.Prefab = null;
    @property(cc.Prefab)
        OpponentBoss:cc.Prefab = null;
    @property(cc.Prefab)
        PauseScreenButton:cc.Prefab = null;
    @property(cc.Label)
        ScoreLabel:cc.Label = null;
    @property(cc.Label)
        HealthLabel:cc.Label = null;
    @property({type:cc.AudioClip})
        SoundUp = null;
    @property({type:cc.AudioClip})
        SoundDown = null;
    Score:number = 0;
    OpponentSpawnCount:number = 0;
    PlayerHealth:number = 10;

    // LIFE-CYCLE CALLBACKS:

    spawnOpponent()
    {
        var OpponentType = [this.Opponent,this.Opponent2,this.Opponent3,this.Opponent4];
        var random = Math.floor(Math.random()*OpponentType.length);
        var newShip = cc.instantiate(OpponentType[random]);
        var randomX = [125,0,-125];
        var randX = Math.floor(Math.random()*randomX.length);
        newShip.setPosition(randX,360);
        this.node.addChild(newShip);

        this.OpponentSpawnCount++;
        if(this.OpponentSpawnCount == 250){
            this.spawnOpponentBoss();
        }
    }

    spawnOpponentBoss(){
        this.OpponentSpawnCount = 0;
        var newBoss = cc.instantiate(this.OpponentBoss);
        newBoss.setPosition(50,360);
        this.node.addChild(newBoss);
    }

    PlayerHealthController(){
        this.PlayerHealth--;
        this.HealthLabel.string = this.PlayerHealth.toString();
        cc.audioEngine.playEffect(this.SoundDown,false);
        if(this.PlayerHealth == 0){
            cc.director.loadScene('GameOverScene');
            this.node.stopAllActions();
        }
    }

    ScoreCalculate(){
        this.Score += 1;
        this.ScoreLabel.string = this.Score.toString();
        if(this.Score % 50 == 0){
            cc.audioEngine.playEffect(this.SoundUp,false);
        }
    }

    PauseGame(){
        var PauseScreenButtonVar = cc.instantiate(this.PauseScreenButton);
        this.node.addChild(PauseScreenButtonVar);
        cc.director.pause();
    }

    ResumeGame(){
        cc.director.resume();
    }

    onLoad () {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        cc.audioEngine.playEffect(this.SoundUp,false);
        cc.director.preloadScene('GameOverScene');
    }

    start () {

    }

    // update (dt) {}

}
