import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';
import { PlayerController } from '../controllers/PlayerController';
import { OpponentController } from '../controllers/OpponentController';
import { programDebugLog, programGameProperty } from '../Program';
const { ccclass, property } = _decorator;

/** Enum for game's state. */
export const enum GAME_STATE {
    NONE = "GameStateNone",
    START = "GameStateStart",
    PLAYING = "GameStatePlaying",
    PAUSE = "GameStatePause",
    FINISH = "GameStateFinish"
};

/** Enum for game's diificulty. */
export const enum GAME_DIFFICULTY {
    TUTORIAL = "GameDifficultyTutorial",
    EASY = "GameDifficultyEasy",
    MEDIUM = "GameDifficultyMedium",
    HARD = "GameDifficultyHard"
};

/** Enum for collider tag's of game elements. Make sure values don't conflict with each other. */
export const enum GAME_COLLIDER_TAG {
    NONE = 0,
    PLAYER = 1,
    PLAYER_AMMUNITION = 1.5,
    OPPONENT = 2,
    OPPONENT_AMMUNITION = 2.5,
    OBSTACLE = 3,
    OBSTACLE_ABILITY = 3.5
};

/** Class for managing the game. */
@ccclass('GameManager')
export class GameManager extends Component {
    // Instance of this class.

    /** Instance of this class. */
    public static instance = null;

    // Code for game's properties.

    /** Variable for game's difficulty. */
    public gameDifficulty: GAME_DIFFICULTY = GAME_DIFFICULTY.HARD;

    // Code for player.
    
    /** Property Decorator for player node with it's controller script. */
    @property(PlayerController)
    private gamePlayer: PlayerController | null = null;
    
    // Code for opponents.
    
    /** Property Decorator for opponent prefab. */
    @property(Prefab)
    private gameOpponentPrefab: Prefab = null;

    /** Property Decorator for opponent's instances node. */
    @property(Node)
    private gameOpponentInstancesNode: Node | null = null;

    /** Variable for opponent's node pool. */
    private gameOpponentNodePool: NodePool = new NodePool();
    
    /** Variable for maximum number of opponents, as per game difficulty. */
    private gameOpponentQuantity: number = 1;

    /** Function to create the opponents. */
    private instantiateOpponents(): void {
        let gameOpponent = null;
        switch (this.gameDifficulty) {
            case GAME_DIFFICULTY.TUTORIAL: {
                this.gameOpponentQuantity = 1;
                break;
            }
            case GAME_DIFFICULTY.EASY: {
                this.gameOpponentQuantity = 2;
                break;
            }
            case GAME_DIFFICULTY.MEDIUM: {
                this.gameOpponentQuantity = 3;
                break;
            }
            case GAME_DIFFICULTY.HARD: {
                this.gameOpponentQuantity = 4;
                break;
            }
            default: {
                this.gameOpponentQuantity = 1;
                break;
            }
        }
        for (let index = 1; index < this.gameOpponentQuantity; index++) {
            gameOpponent = instantiate(this.gameOpponentPrefab);
            this.gameOpponentNodePool.put(gameOpponent);
        }
    }

    /** Function to add opponents to scene. */
    private addOpponents(): void {
        let gameOpponent = null;
        // let gameOpponentAnimation: number = Math.floor(random() * this.gameOpponentQuantity) + 1;
        let gameOpponentAnimation: number = 1;
        if (this.gameOpponentNodePool.size() > 0) {
            gameOpponent = this.gameOpponentNodePool.get();
            gameOpponent.setPosition(this.gameOpponentInstancesNode.getPosition().x + 100 , 0, this.gameOpponentInstancesNode.getPosition().z);
            this.gameOpponentInstancesNode.addChild(gameOpponent);
        }
        else {
            gameOpponent = instantiate(this.gameOpponentPrefab);
            this.gameOpponentNodePool.put(gameOpponent);
        }
        gameOpponent.getComponent(OpponentController).activateOpponent(gameOpponentAnimation, this.gameDifficulty);
    }

    /** Function to remove opponents from scene. */
    private removeOpponents(object: Object): void {

    }

    public reportOpponentStatus(value: boolean, object: Object): void {

    }

    // Code for the game flow.

    /** Variable for game's current state. */
    private gameState: GAME_STATE = GAME_STATE.NONE;

    /** Function to get game's current state. */
    public get gameStateCurrent(): GAME_STATE {
        return this.gameState;
    }

    /** Function to set game's current state. */
    private set gameStateCurrent(value: GAME_STATE) {
        this.gameState = value;
    }

    /** Function to initialise the game. This function sets up the game, but does not start it. */
    public initialiseGame(): void {
        this.gameStateCurrent = GAME_STATE.NONE;
        this.instantiateOpponents();
        this.gamePlayer.activatePlayer(programGameProperty.PlayerAnimationClip, this.gameDifficulty);
        this.startGame();
    }

    /** Function to start the game. */
    public startGame(): void {
        this.gameStateCurrent = GAME_STATE.START;
        this.addOpponents();
        this.playGame();
    }

    /** Function to play the game. */
    public playGame(): void {
        this.gameStateCurrent = GAME_STATE.PLAYING;
    }

    // Code for the game events.

    /** Function called by opponents when they go beyond their bounds. */
    public eventOpponentOutOfBounds(): void {
        // End game.
    }

    // Life-cycle methods of Cocos Creator.

    protected onLoad(): void {
        // Instance of this class.
        GameManager.instance = this;

        // TODO: Remove later.
        this.initialiseGame();
    }
}