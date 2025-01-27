import { _decorator, Component, director, game, Node } from 'cc';
import { PLAYER_ANIMATION_CLIP } from './controllers/PlayerController';
const { ccclass, property } = _decorator;

// Code for game's properties.

/** Enum for game's canvas resolution. */
export enum PROGRAM_CANVAS_RESOLUTION {
    DEFAULT_WIDTH = 540,
    DEFAULT_HEIGHT = 960,
    INTERACTIVE_WIDTH = 540,
    INTERACTIVE_HEIGHT = 860,
    CURRENT_WIDTH = game.canvas.width,
    CURRENT_HEIGHT = game.canvas.height
}

/** Interface for game properties. */
export interface ProgramGameProperty {
    PlayerAnimationClip: PLAYER_ANIMATION_CLIP,
    EnvironmentSprite: number
}

/** Variable for game properties. */
export var programGameProperty: ProgramGameProperty = {
    PlayerAnimationClip: PLAYER_ANIMATION_CLIP.PLAYER_1,
    EnvironmentSprite: 0
};

// Code for program debugging.

/** Variable for enabling or disabling debugging features. */
export var programDebug: boolean = true;

/** Function to log data into web browser's console. */
export function programDebugLog(...value: any[]): void {
    if (programDebug == true) {
        console.log(...value);
    }
}

/** Class to manage this computer program. */
@ccclass('Program')
export class Program extends Component {
    // Life-cycle Methods of Cocos.

    protected onLoad(): void {
        // Code to make this node persistent.
        if (director.isPersistRootNode(this.node)) {
            director.addPersistRootNode(this.node);
        }
    }
}