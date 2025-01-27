import { _decorator, AnimationClip, AnimationState, BoxCollider2D, Component, Contact2DType, instantiate, IPhysics2DContact, math, Node, Prefab, Sprite, Vec3 } from 'cc';
import { GAME_COLLIDER_TAG, GAME_DIFFICULTY, GAME_STATE, GameManager } from '../managers/GameManager';
import { PROGRAM_CANVAS_RESOLUTION } from '../Program';
import { AMMUNITION_TYPE, AmmunitionController } from './AmmunitionController';
const { ccclass, property } = _decorator;

/** Enum for animations of Opponent. Do not use EXPLOSION value outside OpponentController. */
export const enum OPPONENT_ANIMATION_CLIP {
    EXPLOSION = 0,
    OPPONENT_1 = 1,
    OPPONENT_2 = 2,
    OPPONENT_3 = 3
};

/** Enum for animation states of Opponent. */
const enum OPPONENT_ANIMATION_STATE {
    PLAY = "OpponentAnimationStatePlay",
    STOP = "OpponentAnimationStateStop"
};

/** Enum for configurations of Opponent, based on game difficulty. */
enum OPPONENT_CONFIGURATION {
    AMMUNITION_INSTANTIATE_RATE_TUTORIAL = 1.5,
    AMMUNITION_INSTANTIATE_RATE_EASY = 1.5,
    AMMUNITION_INSTANTIATE_RATE_MEDIUM = 1.25,
    AMMUNITION_INSTANTIATE_RATE_HARD = 1,
};

/** Class for controlling the Opponent. Controlled by GameManager. */
@ccclass('OpponentController')
export class OpponentController extends Component {
    // Code for opponent's animation.

    /** Property Decorator for opponent's child node containing the sprite. */
    @property(Node)
    private opponentSpriteNode: Node | null = null;

    /** Variable for opponent's sprite component. */
    private opponentSpriteComponent: Sprite = null;

    /** Property Decorator for animation clips. EXPLOSION animation clip should be value 0. */
    @property(AnimationClip)
    private opponentAnimationClip: AnimationClip [] = [];

    /** Variable for opponent's animation state. */
    private opponentAnimationState: AnimationState = null;

    /** Variable for opponent's current animation clip. This should not have EXPLOSION value. */
    private opponentCurrentAnimationClip: OPPONENT_ANIMATION_CLIP = null;

    /** Function to set the opponent's animation. */
    private setOpponentAnimation(value: OPPONENT_ANIMATION_CLIP, state: OPPONENT_ANIMATION_STATE): void {
        // Code to remove existing animations.
        if (this.opponentAnimationState != null) {
            this.opponentAnimationState.stop();
            this.opponentAnimationState.destroy();
            this.opponentAnimationState = null;
        }

        // Code to add new animation.
        if (value != null)  {
            this.opponentAnimationState = new AnimationState(this.opponentAnimationClip[value], "OpponentAnimationState");
            this.opponentAnimationState.initialize(this.opponentSpriteNode);
            if (state == OPPONENT_ANIMATION_STATE.PLAY) {
                this.opponentAnimationState.play();
            }
            else if (state == OPPONENT_ANIMATION_STATE.STOP) {
                this.opponentAnimationState.stop();
            }
        }
    }

    /** Variable for monitoring opponent's damage animation scheduler. */
    private opponentDamageAnimationScheduler: boolean = false;

    /** Function to reset sprite properties after opponent's damage animation. */
    private resetOpponentDamageAnimation(): void {
        this.opponentSpriteComponent.color = new math.Color(255, 255, 255, 255);
        this.opponentDamageAnimationScheduler = false;
    }

    /** Function to animate opponent's damage. */
    private animateOpponentDamage(): void {
        if (this.opponentDamageAnimationScheduler == true) {
            this.opponentDamageAnimationScheduler = false;
            this.unschedule(this.resetOpponentDamageAnimation);
            this.opponentSpriteComponent.color = new math.Color(255, 255, 255, 255);
        }
        this.opponentDamageAnimationScheduler = true;
        this.opponentSpriteComponent.color = new math.Color(255, 0, 0, 255);
        this.scheduleOnce(this.resetOpponentDamageAnimation, 0.1);
    }
    
    // Code for opponent's ammunition.

    /** Property Decorator for GameOpponentAmmunition. */
    @property(Prefab)
    private opponentAmmunitionPrefab: Prefab = null;

    /** Property Decorator for GameOpponentAmmunitionInstances. */
    @property(Node)
    private opponentAmmunitionInstancesNode: Node = null;

    /** Variable to set the time interval at which opponent's ammunition should spawn. */
    private opponentAmmunitionInstantiateRate: number = 0.5;

    /** Variable to set opponent's ammunition type. */
    private opponentAmmunitionType: AMMUNITION_TYPE = AMMUNITION_TYPE.OPPONENT;

    /** Function to set opponent's ammunition instantiation rate. */
    private setOpponentAmmunition(gameDifficulty: GAME_DIFFICULTY): void {
        switch (gameDifficulty) {
            case GAME_DIFFICULTY.TUTORIAL: {
                this.opponentAmmunitionInstantiateRate = OPPONENT_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_TUTORIAL;
                break;
            }
            case GAME_DIFFICULTY.EASY: {
                this.opponentAmmunitionInstantiateRate = OPPONENT_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_EASY;
                break;
            }
            case GAME_DIFFICULTY.MEDIUM: {
                this.opponentAmmunitionInstantiateRate = OPPONENT_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_MEDIUM;
                break;
            }
            case GAME_DIFFICULTY.HARD: {
                this.opponentAmmunitionInstantiateRate = OPPONENT_CONFIGURATION.AMMUNITION_INSTANTIATE_RATE_HARD;
                break;
            }
            default: {
                this.opponentAmmunitionInstantiateRate = 1;
                break;
            }
        }
        this.opponentAmmunitionType = AMMUNITION_TYPE.OPPONENT;
    }

    /** Function for opponent's ammunition scheduler. */
    private scheduleOpponentAmmunition(): void {
        if (this.opponentIsActive == true && GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING) {
            let opponentAmmunition = instantiate(this.opponentAmmunitionPrefab);
            opponentAmmunition.setPosition(this.node.getPosition().x, 0, this.opponentAmmunitionInstancesNode.getPosition().z);
            this.opponentAmmunitionInstancesNode.addChild(opponentAmmunition);
            opponentAmmunition.getComponent(AmmunitionController).activateAmmunition(this.opponentAmmunitionType);
        }
    }

    /** Function to spawn opponent's ammunition. This function has scheduler that repeats. */
    private instantiateOpponentAmmunition(value: boolean): void {
        if (value == true) {
            this.schedule(this.scheduleOpponentAmmunition, this.opponentAmmunitionInstantiateRate);
        }
        else {
            this.unschedule(this.scheduleOpponentAmmunition);
        }
    }

    // Code for positioning opponent.

    /** Variable to check if the opponent is active. */
    private opponentIsActive: boolean = true;

    /** Variable for opponent's x-axis direction. This value determines in which x-axis direction the opponent should move. */
    private opponentPositionXForward: boolean = true;

    /** Variable for opponent's x-axis position offset. This value determines how much pixels the opponent has to strafe left or right from it's previous position. */
    private opponentPositionXOffset: number = 50;

    /** Variable for opponent's y-axis position offset. This value determines how much pixels the opponent has to move down from it's previous position. */
    private opponentPositionYOffset: number = 25;

    /** Variable for opponent's maximum x-axis position. For minimum value, this value will be negative. */
    private opponentPositionXMaximum: number = 100;

    /** Variable for opponent's minimum y-axis position. This value should be negative. */
    private opponentPositionYMinimum: number = -(PROGRAM_CANVAS_RESOLUTION.INTERACTIVE_HEIGHT) + 225;

    /** Function to calculate opponent's x-axis position. */
    private calculateOpponentStrafePosition(value: number, deltaTime: number): number {
        // Code to switch direction.
        if (value <= -(this.opponentPositionXMaximum)) {
            this.opponentPositionXForward = true;
        }
        else if (value >= this.opponentPositionXMaximum) {
            this.opponentPositionXForward = false;
        }

        // Code to set position.
        if (this.opponentPositionXForward == true) {
            value = value + (this.opponentPositionXOffset * 10) * deltaTime;
        }
        else if (this.opponentPositionXForward == false) {
            value = value - (this.opponentPositionXOffset * 10) * deltaTime;
        }

        // Code to clamp position.
        let result = Math.min(Math.max(value, -(this.opponentPositionXMaximum)), this.opponentPositionXMaximum);
        return result;
    }

    // Code for opponent's collision.

    /** Property Decorator for opponent's child node containing the collider. */
    @property(Node)
    private opponentColliderNode: Node | null = null;

    /** Variable for opponent's collider component. */
    private opponentColliderComponent: BoxCollider2D = null;

    /** Function to listen to opponent's collider component. */
    private detectOpponentCollision(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null): void {
        if (otherCollider.tag == GAME_COLLIDER_TAG.PLAYER_AMMUNITION) {
            otherCollider.getComponent(AmmunitionController).deactivateAmmunition();
            this.animateOpponentDamage();
        }
        else if (otherCollider.tag == GAME_COLLIDER_TAG.PLAYER) {
            this.destructOpponent();
        }
    }

    // Code for setting up opponent.

    /** Function to activate the opponent. */
    public activateOpponent(value: OPPONENT_ANIMATION_CLIP, gameDifficulty: GAME_DIFFICULTY): void {
        this.node.active = true;
        
        // Code to set opponent's ammunition instantiation.
        this.setOpponentAmmunition(gameDifficulty);
        this.instantiateOpponentAmmunition(true);

        // Code to set opponent's collision.
        this.opponentColliderComponent = this.opponentColliderNode.getComponent(BoxCollider2D);
        this.opponentColliderComponent.tag = GAME_COLLIDER_TAG.OPPONENT;
        this.opponentColliderComponent.on(Contact2DType.BEGIN_CONTACT, this.detectOpponentCollision.bind(this), this);
        
        // Code to set opponent's animation.
        this.opponentSpriteComponent = this.opponentSpriteNode.getComponent(Sprite);
        this.opponentCurrentAnimationClip = value;
        this.setOpponentAnimation(this.opponentCurrentAnimationClip, OPPONENT_ANIMATION_STATE.PLAY);
        
        this.opponentIsActive = true;
    }

    /** Function to deactivate the opponent. */
    public deactivateOpponent(): void {
        this.opponentIsActive = false;

        // Code to set opponent's ammunition instantiation.
        this.instantiateOpponentAmmunition(false);
        this.setOpponentAmmunition(null);

        // Code to reset opponent's position.
        this.node.setPosition(new Vec3(this.node.getPosition().x, 0, this.node.getPosition().z));
        this.opponentColliderNode.setPosition(new Vec3(0, this.opponentColliderNode.getPosition().y, this.opponentColliderNode.getPosition().z));
        
        // Code to reset opponent's animation.
        this.opponentCurrentAnimationClip = null;
        this.setOpponentAnimation(this.opponentCurrentAnimationClip, OPPONENT_ANIMATION_STATE.STOP);
        this.opponentSpriteComponent = null;
        
        // Code to reset opponent's collision.
        this.opponentColliderComponent.tag = GAME_COLLIDER_TAG.NONE;
        this.opponentColliderComponent.off(Contact2DType.BEGIN_CONTACT, this.detectOpponentCollision.bind(this), this);    
        this.opponentColliderComponent = null;

        this.node.active = false;
    }

    /** Function to remove the opponent from scene. */
    public removeOpponent(): void {
        this.setOpponentAnimation(null, OPPONENT_ANIMATION_STATE.STOP)
        this.scheduleOnce(() => {
            // TODO:
            this.node.destroy();
        }, 0.1);
    }

    /** Function to destruct the opponent. */
    public destructOpponent(): void {
        this.opponentIsActive = false;
        this.setOpponentAnimation(OPPONENT_ANIMATION_CLIP.EXPLOSION, OPPONENT_ANIMATION_STATE.PLAY);
        this.scheduleOnce(this.removeOpponent.bind(this), 0.25);
    }

    // Life-cycle Methods of Cocos.

    protected onLoad(): void {
        // this.activateOpponent(OPPONENT_ANIMATION_CLIP.OPPONENT_1, GAME_DIFFICULTY.EASY); // TODO: Move to Game Manager.
    }

    protected update(deltaTime: number): void {
        if (this.opponentIsActive == true && GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING) {
            this.node.setPosition(new Vec3(this.node.getPosition().x, this.node.getPosition().y - (this.opponentPositionYOffset * 10) * deltaTime, this.node.getPosition().z));
            this.opponentColliderNode.setPosition(new Vec3(this.calculateOpponentStrafePosition(this.opponentColliderNode.getPosition().x, deltaTime), this.opponentColliderNode.getPosition().y, this.opponentColliderNode.getPosition().z));
            if (this.node.getPosition().y <= this.opponentPositionYMinimum) {
                GameManager.instance.eventOpponentOutOfBounds();
                this.destructOpponent();
            }
        }
    }
}