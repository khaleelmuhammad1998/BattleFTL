import { _decorator, BoxCollider2D, Component, math, Sprite, UITransform, Vec3 } from 'cc';
import { PROGRAM_CANVAS_RESOLUTION } from '../Program';
import { GAME_COLLIDER_TAG, GAME_STATE, GameManager } from '../managers/GameManager';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

/** Enum for animations of Player. Do not use EXPLOSION value outside PlayerController. */
export const enum AMMUNITION_TYPE {
    NONE = 0,
    PLAYER_1 = 1,
    PLAYER_2 = 2,
    OPPONENT = 3
};

/** Class for controlling the Ammunition. */
@ccclass('AmmunitionController')
export class AmmunitionController extends Component {
    // Code for properties of ammunition.    
    
    /** Variable to check if the ammunition is active. */
    private ammunitionIsActive: boolean = true;

    /** Variable to assign the type of ammunition. */
    private ammunitionType: AMMUNITION_TYPE = AMMUNITION_TYPE.NONE;

    // Code for positioning and direction of ammunition.

    /** Variable for ammunition's y-axis position offset. This value determines how much pixels the ammunition has to move up from it's previous position. */
    private ammunitionPositionYOffset: number = 50;

    /** Variable for ammunition's maximum y-axis position. */
    private ammunitionPositionYMaximum: number = PROGRAM_CANVAS_RESOLUTION.INTERACTIVE_HEIGHT - 125;

    /** Variable to check if ammunition's direction need be reversed. */
    private ammunitionInvertDirection: boolean = null;

    /** Function to set positioning properties of ammunition based on its type. */
    private setAmmunitionPosition(value: AMMUNITION_TYPE = this.ammunitionType): void {
        switch (value) {
            case AMMUNITION_TYPE.NONE: {
                this.ammunitionInvertDirection = null;
                break;
            }
            case AMMUNITION_TYPE.PLAYER_1: {
                this.ammunitionInvertDirection = false;
                break;
            }
            case AMMUNITION_TYPE.PLAYER_2: {
                this.ammunitionInvertDirection = false;
                break;
            }
            case AMMUNITION_TYPE.OPPONENT: {
                this.ammunitionInvertDirection = true;
                break;
            }
            default: {
                this.ammunitionInvertDirection = null;
                break;
            }
        }
    }

    // Code for ammunition's graphics.

    /** Variable for ammunition's UI transform component. */
    private ammunitionUITransformComponent: UITransform = null;

    /** Variable for ammunition's sprite component. */
    private ammunitionSpriteComponent: Sprite = null;

    /** Function to set sprite of ammunition based on its type. */
    private setAmmunitionSprite(value: AMMUNITION_TYPE = this.ammunitionType): void {
        switch (value) {
            case AMMUNITION_TYPE.NONE: {
                this.ammunitionUITransformComponent.setContentSize(new math.Size(0, 0));
                this.ammunitionSpriteComponent.color = new math.Color(0, 0, 0, 0);
                break;
            }
            case AMMUNITION_TYPE.PLAYER_1: {
                this.ammunitionUITransformComponent.setContentSize(new math.Size(3, 12));
                this.ammunitionSpriteComponent.color = new math.Color(255, 255, 255, 255);
                break;
            }
            case AMMUNITION_TYPE.PLAYER_2: {
                this.ammunitionUITransformComponent.setContentSize(new math.Size(6, 12));
                this.ammunitionSpriteComponent.color = new math.Color(64, 192, 255, 255);
                break;
            }
            case AMMUNITION_TYPE.OPPONENT: {
                this.ammunitionUITransformComponent.setContentSize(new math.Size(12, 12));
                this.ammunitionSpriteComponent.color = new math.Color(255, 224, 64, 255);
                break;
            }
            default: {
                this.ammunitionUITransformComponent.setContentSize(new math.Size(0, 0));
                this.ammunitionSpriteComponent.color = new math.Color(0, 0, 0, 0);
                break;
            }
        }
    }

    // Code for ammunition's collision.

    /** Variable for ammunition's collider component. */
    private ammunitionColliderComponent: BoxCollider2D = null;

    /** Function to set collision parameters of ammunition based on its type. */
    private setAmmunitionCollision(value: AMMUNITION_TYPE = this.ammunitionType): void {
        switch (value) {
            case AMMUNITION_TYPE.NONE: {
                this.ammunitionColliderComponent.tag = GAME_COLLIDER_TAG.NONE;
                this.ammunitionColliderComponent.size = new math.Size(0, 0);
                this.ammunitionColliderComponent.enabled = false;
                break;
            }
            case AMMUNITION_TYPE.PLAYER_1: {
                this.ammunitionColliderComponent.tag = GAME_COLLIDER_TAG.PLAYER_AMMUNITION;
                this.ammunitionColliderComponent.size = new math.Size(3, 12);
                this.ammunitionColliderComponent.enabled = true;
                break;
            }
            case AMMUNITION_TYPE.PLAYER_2: {
                this.ammunitionColliderComponent.tag = GAME_COLLIDER_TAG.PLAYER_AMMUNITION;
                this.ammunitionColliderComponent.size = new math.Size(6, 12);
                this.ammunitionColliderComponent.enabled = true;
                break;
            }
            case AMMUNITION_TYPE.OPPONENT: {
                this.ammunitionColliderComponent.tag = GAME_COLLIDER_TAG.OPPONENT_AMMUNITION;
                this.ammunitionColliderComponent.size = new math.Size(12, 12);
                this.ammunitionColliderComponent.enabled = true;
                break;
            }
            default: {
                this.ammunitionColliderComponent.tag = GAME_COLLIDER_TAG.NONE;
                this.ammunitionColliderComponent.size = new math.Size(0, 0);
                this.ammunitionColliderComponent.enabled = false;
                break;
            }
        }
    }

    // Code for setting up ammunition.

    /** Function to activate ammunition. */
    public activateAmmunition(value: AMMUNITION_TYPE): void {
        this.ammunitionType = value;
        this.setAmmunitionPosition(this.ammunitionType);
        this.ammunitionUITransformComponent = this.node.getComponent(UITransform);
        this.ammunitionSpriteComponent = this.node.getComponent(Sprite);
        this.setAmmunitionSprite(this.ammunitionType);
        this.ammunitionColliderComponent = this.node.getComponent(BoxCollider2D);
        this.setAmmunitionCollision(this.ammunitionType);
        this.ammunitionIsActive = true;
    }

    /** Function to deactivate ammunition. */
    public deactivateAmmunition(): void {
        this.ammunitionIsActive = false;
        this.ammunitionType = AMMUNITION_TYPE.NONE;
        this.setAmmunitionPosition(this.ammunitionType);
        this.setAmmunitionSprite(this.ammunitionType);
        this.setAmmunitionCollision(this.ammunitionType);
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0.1);
    }

    // Life-cycle Methods of Cocos.

    protected update(deltaTime: number): void {
        if (this.ammunitionIsActive == true && GameManager.instance.gameStateCurrent == GAME_STATE.PLAYING) {
            if (this.ammunitionInvertDirection == true) {
                this.node.setPosition(new Vec3(this.node.getPosition().x, this.node.getPosition().y - (this.ammunitionPositionYOffset * 10) * deltaTime, this.node.getPosition().z));
            }
            else {
                this.node.setPosition(new Vec3(this.node.getPosition().x, this.node.getPosition().y + (this.ammunitionPositionYOffset * 10) * deltaTime, this.node.getPosition().z));
            }
            if (this.node.getPosition().y >= this.ammunitionPositionYMaximum) {
                this.deactivateAmmunition();
            }
        }
    }
}