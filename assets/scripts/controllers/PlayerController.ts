import { _decorator, AnimationClip, AnimationState, BoxCollider2D, Component, Contact2DType, instantiate, IPhysics2DContact, math, Node, NodePool, Prefab, Sprite, Vec3 } from 'cc';
import { INPUT_COMMAND, INPUT_DEVICE, InputManager, InputManagerEvent, InputManagerEventKeyboard, InputManagerEventMouseTouch } from '../managers/InputManager';
import { programDebug, PROGRAM_CANVAS_RESOLUTION, programDebugLog } from '../Program';
import { GAME_COLLIDER_TAG, GAME_DIFFICULTY, GAME_STATE, GameManager } from '../managers/GameManager';
import { AMMUNITION_TYPE, AmmunitionController } from './AmmunitionController';
const { ccclass, property } = _decorator;

/** Enum for animations of Player. Do not use EXPLOSION value outside PlayerController. */
export const enum PLAYER_ANIMATION_CLIP {
    EXPLOSION = 0,
    PLAYER_1 = 1,
    PLAYER_2 = 2,
    PLAYER_3 = 3
};

/** Enum for animation states of Player. */
enum PLAYER_ANIMATION_STATE {
    PLAY = "PlayerAnimationStatePlay",
    STOP = "PlayerAnimationStateStop"
};

/** Enum for movement directions of Player. */
enum PLAYER_DIRECTION {
    LEFT = "PlayerDirectionLeft",
    RIGHT = "PlayerDirectionRight"
};

/** Enum for configurations of Player, based on game difficulty. */
enum PLAYER_CONFIGURATION {
    AMMUNITION_INSTANTIATE_RATE_TUTORIAL = 0.1,
    AMMUNITION_INSTANTIATE_RATE_EASY = 0.1,
    AMMUNITION_INSTANTIATE_RATE_MEDIUM = 0.2,
    AMMUNITION_INSTANTIATE_RATE_HARD = 0.25,
};

/** Class for controlling the Player. */
@ccclass('PlayerController')
export class PlayerController extends Component {
    // Instance of this class.

    /** Instance of this class. */
    public static instance = null;

    // Code for player's graphics.

    /** Property Decorator for GamePlayerSprite child node. */
    @property(Node)
    private playerSpriteNode: Node | null = null;

    /** Variable for player's sprite component. */
    private playerSpriteComponent: Sprite = null;

    /** Property Decorator for animation clips. EXPLOSION animation clip should be value 0. */
    @property(AnimationClip)
    private playerAnimationClip: AnimationClip[] = [];

    /** Variable for player's animation state. */
    private playerAnimationState: AnimationState = null;

    /** Variable for player's current animation clip. This should not have EXPLOSION value. */
    private playerCurrentAnimationClip: PLAYER_ANIMATION_CLIP = null;

    /** Function to set the player's animation. */
    private setPlayerAnimation(value: PLAYER_ANIMATION_CLIP, state: PLAYER_ANIMATION_STATE): void {
        // Code to remove existing animations.
        if (this.playerAnimationState != null) {
            this.playerAnimationState.stop();
            this.playerAnimationState.destroy();
            this.playerAnimationState = null;
        }

        // Code to add new animation.
        if (value != null) {
            this.playerAnimationState = new AnimationState(this.playerAnimationClip[value], "PlayerAnimationState");
            this.playerAnimationState.initialize(this.playerSpriteNode);
            if (state == PLAYER_ANIMATION_STATE.PLAY) {
                this.playerAnimationState.play();
            }
            else if (state == PLAYER_ANIMATION_STATE.STOP) {
                this.playerAnimationState.stop();
            }
        }
    }

    /** Variable for monitoring player's damage animation scheduler. */
    private playerDamageAnimationScheduler: boolean = false;

    /** Function to reset sprite properties after player's damage animation. */
    private resetPlayerDamageAnimation(): void {
        this.playerSpriteComponent.color = new math.Color(255, 255, 255, 255);
        this.playerDamageAnimationScheduler = false;
    }

    /** Function to animate player's damage. */
    private animatePlayerDamage(): void {
        if (this.playerDamageAnimationScheduler == true) {
            this.playerDamageAnimationScheduler = false;
            this.unschedule(this.resetPlayerDamageAnimation);
            this.playerSpriteComponent.color = new math.Color(255, 255, 255, 255);
        }
        this.playerDamageAnimationScheduler = true;
        this.playerSpriteComponent.color = new math.Color(255, 0, 0, 255);
        this.scheduleOnce(this.resetPlayerDamageAnimation, 0.1);
    }

    // Code for player's ammunition.

    /** Property Decorator for GamePlayerAmmunition. */
    @property(Prefab)
    private playerAmmunitionPrefab: Prefab = null;

    /** Property Decorator for GamePlayerAmmunitionInstances. */
    @property(Node)
    private playerAmmunitionInstancesNode: Node = null;

    /** Variable for player's ammunition node pool. */
    private playerAmmunitionNodePool: NodePool = new NodePool();

    /** Variable to set the time interval at which player's ammunition should spawn. */
    private playerAmmunitionInstantiateRate: number = 0.5;

    /** Variable to set player's ammunition type. */
    private playerAmmunitionType: AMMUNITION_TYPE = AMMUNITION_TYPE.PLAYER_1;

    /** Variable for the maximum number of  player's ammunition. */
    private playerAmmunitionNumberMaximum: number = 20;
    // private playerAmmunitionNumber: number = 0; // TODO: Remove later.

    /** Function to set player's ammunition instantiation rate. */
    private setPlayerAmmunition(gameDifficulty: GAME_DIFFICULTY): void {
        switch (gameDifficulty) {
            case GAME_DIFFICULTY.TUTORIAL: {
                this.playerAmmunitionInstantiateRate = PLAYER_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_TUTORIAL;
                break;
            }
            case GAME_DIFFICULTY.EASY: {
                this.playerAmmunitionInstantiateRate = PLAYER_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_EASY;
                break;
            }
            case GAME_DIFFICULTY.MEDIUM: {
                this.playerAmmunitionInstantiateRate = PLAYER_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_MEDIUM;
                break;
            }
            case GAME_DIFFICULTY.HARD: {
                this.playerAmmunitionInstantiateRate = PLAYER_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_HARD;
                break;
            }
            default: {
                this.playerAmmunitionInstantiateRate = 0.5;
                break;
            }
        }
        this.playerAmmunitionType = AMMUNITION_TYPE.PLAYER_1;

        let playerAmmunitionNode = null;
        for (let index = 0; index < this.playerAmmunitionNumberMaximum; index++) {
            playerAmmunitionNode = instantiate(this.playerAmmunitionPrefab);
            this.playerAmmunitionNodePool.put(playerAmmunitionNode);
        }
    }
    
    /** Function for player's ammunition scheduler. */
    private schedulePlayerAmmunition(): void {
        let playerAmmunitionNode = null;
        if (this.playerIsControllable == true && GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING) {
            if (this.playerAmmunitionNodePool.size() > 0) {
                playerAmmunitionNode = this.playerAmmunitionNodePool.get();
                this.playerAmmunitionInstancesNode.addChild(playerAmmunitionNode);
                playerAmmunitionNode.setPosition(this.node.getPosition().x, 0, this.playerAmmunitionInstancesNode.getPosition().z);
                playerAmmunitionNode.getComponent(AmmunitionController).activateAmmunition(this.playerAmmunitionType);
            }
            else {
                playerAmmunitionNode = instantiate(this.playerAmmunitionPrefab);
                this.playerAmmunitionNodePool.put(playerAmmunitionNode);
            }
        }


        // TODO: Remove later.
        // if (this.playerIsControllable == true && GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING) {
        //     let playerAmmunition = instantiate(this.playerAmmunitionPrefab);
        //     playerAmmunition.setPosition(this.node.getPosition().x, 0, this.playerAmmunitionInstancesNode.getPosition().z);
        //     this.playerAmmunitionInstancesNode.addChild(playerAmmunition);
        //     playerAmmunition.getComponent(AmmunitionController).activateAmmunition(this.playerAmmunitionType);

        //     // Debugging Code - Enable code to check and set the player's ammunition current number count.
        //     if (programDebug == true) {
        //         playerAmmunition.name = `${playerAmmunition.name}-${this.playerAmmunitionNumber}`;
        //         this.playerAmmunitionNumber++;
        //     }
        // }
    }

    /** Function to return player's ammunition back into its node pool. */
    public returnPlayerAmmunition(value: Node): void {
        this.playerAmmunitionNodePool.put(value);
    }

    /** Function to spawn player's ammunition. This function has scheduler that repeats. */
    private instantiatePlayerAmmunition(value: boolean): void {
        if (value == true) {
            this.schedule(this.schedulePlayerAmmunition, this.playerAmmunitionInstantiateRate);
        }
        else {
            this.unschedule(this.schedulePlayerAmmunition);
        }
    }

    // Code for moving player.

    /** Variable to check if the player can be controlled by the user. */
    private playerIsControllable: boolean = null;

    /** Variable to check if player's position have to be forced in, based on mouse or touch pointer location. */
    private playerForcePosition: boolean = null;

    /** Variable for player's direction. This value will be accessed by update(). */
    private playerDirection: string = null;

    /** Variable to multiply the player's position value, if the input device is touch. For user experience purposes. */
    private playerPositionMultiplier: number = (InputManager.InputDevice == INPUT_DEVICE.TOUCH ? 3 : 1);

    /** Function to move the player's movement, based on keyboard input triggered by Input Manager. */
    private movePlayer(value: PLAYER_DIRECTION): void {
        if (this.playerIsControllable == true && (GameManager.instance.gameStateCurrent == GAME_STATE.START || GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING)) {
            this.playerForcePosition = false;
            this.playerDirection = value;
        }
    }

    /** Function to position the player directly, based on mouse or touch input triggered by Input Manager. */
    private positionPlayer(value: number): void {
        if (this.playerIsControllable == true && (GameManager.instance.gameStateCurrent == GAME_STATE.START || GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING)) {
            this.playerForcePosition = true;
            this.node.setPosition(new Vec3(this.clampPlayerPosition(value * this.playerPositionMultiplier), this.node.getPosition().y, this.node.getPosition().z));
        }
    }

    /** Function to stop the player's movement, based on keyboard input triggered by Input Manager. */
    private stopPlayerMovement(): void {
        this.playerForcePosition = null;
        this.playerDirection = null;
    }

    // Code for positioning player.

    /** Variable for player's movement offset. This value determines how much pixels the player has to move from it's previous position. */
    private playerPositionOffset: number = 10;

    /** Variable for player's maximum x-axis position. For minimum value, this value will be negative. */
    private playerPositionMaximum: number = (PROGRAM_CANVAS_RESOLUTION.DEFAULT_WIDTH / 2) - 50;

    /** Function to clamp player's x-axis position. */
    private clampPlayerPosition(value: number): number {
        let result = Math.min(Math.max(value, -this.playerPositionMaximum), this.playerPositionMaximum);
        return result;
    }

    // Code for managing data from Input Manager.

    /** Function to interpret keyboard input data from Input Manager. */
    private interpretKeyboardInput(value: INPUT_COMMAND): void {
        switch (value) {
            case INPUT_COMMAND.LEFT: {
                this.movePlayer(PLAYER_DIRECTION.LEFT);
                break;
            }
            case INPUT_COMMAND.RIGHT: {
                this.movePlayer(PLAYER_DIRECTION.RIGHT);
                break;
            }
            default: {
                this.stopPlayerMovement();
                break;
            }
        }
    }

    /** Function to interpret mouse and touch input data from Input Manager. */
    private interpretMouseTouchInput(value: math.Vec2): void {
        if (value != null) {
            this.positionPlayer(value.x - (PROGRAM_CANVAS_RESOLUTION.CURRENT_WIDTH / 2));
        }
        else {
            this.stopPlayerMovement();
        }
    }

    // Code for player's collision.

    /** Variable for player's collider component. */
    private playerColliderComponent: BoxCollider2D = null;

    /** Function to listen to player's collider component. */
    private detectPlayerCollision(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null): void {
        if (otherCollider.tag == GAME_COLLIDER_TAG.OPPONENT_AMMUNITION) {
            otherCollider.getComponent(AmmunitionController).deactivateAmmunition();
            this.animatePlayerDamage();
        }
        else if (otherCollider.tag == GAME_COLLIDER_TAG.OPPONENT) {
            this.destructPlayer();
        }
    }

    // Code for setting up player.

    /** Function to activate the player. Usually called at the start of the game. */
    public activatePlayer(playerAnimationClip: PLAYER_ANIMATION_CLIP, gameDifficulty: GAME_DIFFICULTY): void {
        this.node.active = true;
        this.node.setPosition(new Vec3(0, this.node.getPosition().y, this.node.getPosition().z));

        // Code to enable listening to input data from Input Manager.
        this.stopPlayerMovement();
        if (InputManager.InputDevice == INPUT_DEVICE.KEYBOARD) {
            InputManagerEvent.on(InputManagerEventKeyboard, this.interpretKeyboardInput, this);
        }
        else if (InputManager.InputDevice == INPUT_DEVICE.MOUSE || INPUT_DEVICE.TOUCH) {
            InputManagerEvent.on(InputManagerEventMouseTouch, this.interpretMouseTouchInput, this);
            if (InputManager.InputDevice == INPUT_DEVICE.TOUCH) {
                this.playerPositionMultiplier = 3;
            }
        }

        // Code to set player's ammunition instantiation.
        this.setPlayerAmmunition(gameDifficulty);
        this.instantiatePlayerAmmunition(true);

        // Code to set player's collision.
        this.playerColliderComponent = this.node.getComponent(BoxCollider2D);
        this.playerColliderComponent.tag = GAME_COLLIDER_TAG.PLAYER;
        this.playerColliderComponent.on(Contact2DType.BEGIN_CONTACT, this.detectPlayerCollision.bind(this), this);

        // Code to set player's graphics.
        this.playerSpriteComponent = this.playerSpriteNode.getComponent(Sprite);
        this.playerCurrentAnimationClip = playerAnimationClip;
        this.setPlayerAnimation(this.playerCurrentAnimationClip, PLAYER_ANIMATION_STATE.PLAY);

        this.playerIsControllable = true;
    }

    /** Function to deactivate the player. Usually called at the end of the game. */
    public deactivatePlayer(): void {
        this.playerIsControllable = false;

        // Code to disable listening to input data from Input Manager.
        this.stopPlayerMovement();
        if (InputManager.InputDevice == INPUT_DEVICE.KEYBOARD) {
            InputManagerEvent.off(InputManagerEventKeyboard, this.interpretKeyboardInput, this);
        }
        else if (InputManager.InputDevice == INPUT_DEVICE.MOUSE || INPUT_DEVICE.TOUCH) {
            InputManagerEvent.off(InputManagerEventMouseTouch, this.interpretMouseTouchInput, this);
            this.playerPositionMultiplier = 1;
        }

        // Code to reset player's ammunition instantiation.
        this.instantiatePlayerAmmunition(false);
        this.setPlayerAmmunition(null);

        // Code to reset player's collision.
        this.playerColliderComponent.off(Contact2DType.BEGIN_CONTACT, this.detectPlayerCollision.bind(this), this);
        this.playerColliderComponent.tag = GAME_COLLIDER_TAG.NONE;
        this.playerColliderComponent = null;

        // Code to reset player's graphics.
        this.playerCurrentAnimationClip = null;
        this.setPlayerAnimation(this.playerCurrentAnimationClip, PLAYER_ANIMATION_STATE.STOP);
        this.playerSpriteComponent = null;

        this.node.setPosition(new Vec3(0, this.node.getPosition().y, this.node.getPosition().z));
        this.node.active = false;
    }

    /** Function to reset player to it's default condition. Usually called to respawn the player. */
    public resetPlayer(): void {
        this.setPlayerAnimation(this.playerCurrentAnimationClip, PLAYER_ANIMATION_STATE.PLAY);
        this.stopPlayerMovement();
        this.node.setPosition(new Vec3(0, this.node.getPosition().y, this.node.getPosition().z));
        this.playerIsControllable = true;
    }

    /** Function to destruct the player. Usually called to kill the player. */
    public destructPlayer(): void {
        this.playerIsControllable = false;
        this.stopPlayerMovement();
        this.setPlayerAnimation(PLAYER_ANIMATION_CLIP.EXPLOSION, PLAYER_ANIMATION_STATE.PLAY);
        this.scheduleOnce(this.resetPlayer.bind(this), 0.5); // TODO: Modify to respawn.
    }

    // Life-cycle Methods of Cocos.

    protected onLoad(): void {
        // Instance of this class.
        PlayerController.instance = this;
    }

    protected update(deltaTime: number): void {
        // Code to continuously move the player.
        if (this.playerForcePosition == false) {
            if (this.playerDirection == PLAYER_DIRECTION.LEFT) {
                this.node.setPosition(new Vec3(this.clampPlayerPosition(this.node.getPosition().x - (this.playerPositionOffset * 100) * deltaTime), this.node.getPosition().y, this.node.getPosition().z));
            }
            else if (this.playerDirection == PLAYER_DIRECTION.RIGHT) {
                this.node.setPosition(new Vec3(this.clampPlayerPosition(this.node.getPosition().x + (this.playerPositionOffset * 100) * deltaTime), this.node.getPosition().y, this.node.getPosition().z));
            }
        }
    }
}