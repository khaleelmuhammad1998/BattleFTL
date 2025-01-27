import { _decorator, Component, EventKeyboard, EventMouse, EventTarget, EventTouch, Input, input, KeyCode, Node } from 'cc';
const { ccclass, property } = _decorator;

/** Constant for listening to or emitting input data from input devices. Input data should only be emitted from InputManager class. */
export const InputManagerEvent = new EventTarget();

/** Constant for name of keyboard events of Input Manager. */
export const InputManagerEventKeyboard: string = "InputManagerEventKeyboard";

/** Constant for name of mouse or touch events of Input Manager. */
export const InputManagerEventMouseTouch: string = "InputManagerEventMouseTouch";

/** Enum for commands from Input Manager. */
export const enum INPUT_COMMAND {
    BACK = "InputCommandBack",
    SELECT = "InputCommandSelect",
    OPTION = "InputCommandOption",
    UP = "InputCommandUp",
    DOWN = "InputCommandDown",
    LEFT = "InputCommandLeft",
    RIGHT = "InputCommandRight"
};

/** Enum for input devices. */
export const enum INPUT_DEVICE {
    KEYBOARD = "InputDeviceKeyboard",
    MOUSE = "InputDeviceMouse",
    TOUCH = "InputDeviceTouch"
};

/** Class for managing input data from input devices. */
@ccclass('InputManager')
export class InputManager extends Component {
    // Code for input command.

    /** Variable for storing current input command. This value changes rapidly. */
    private static inputCurrentCommand: INPUT_COMMAND = null;

    /** Function to get the current input command. This value changes rapidly. You can listen to all input commands through InputManagerEvent, but this is provided for additional checking or testing purposes. */
    public static get InputCurrentCommand(): INPUT_COMMAND {
        return this.inputCurrentCommand;
    }

    // Code for keyboard input.

    /** Function to check input data from keyboard and emit it through InputManagerEvent. */
    private checkKeyboardInput(event: EventKeyboard): void {
        switch (event.keyCode) {
            case KeyCode.ESCAPE || KeyCode.BACKSPACE: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.BACK;
                break;
            }
            case KeyCode.ENTER || KeyCode.SPACE: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.SELECT;
                break;
            }
            case KeyCode.TAB: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.OPTION;
                break;
            }
            case KeyCode.ARROW_UP || KeyCode.KEY_W: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.UP;
                break;
            }
            case KeyCode.ARROW_DOWN || KeyCode.KEY_S: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.DOWN;
                break;
            }
            case KeyCode.ARROW_LEFT || KeyCode.KEY_A: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.LEFT;
                break;
            }
            case KeyCode.ARROW_RIGHT || KeyCode.KEY_D: {
                InputManager.inputCurrentCommand = INPUT_COMMAND.RIGHT;
                break;
            }
            default: {
                InputManager.inputCurrentCommand = null;
                break;
            }
        }
        InputManagerEvent.emit(InputManagerEventKeyboard, InputManager.inputCurrentCommand);
    }

    /** Function to reset keyboard input data to null and emit it through InputManagerEvent. */
    private resetKeyboardInput(): void {
        InputManager.inputCurrentCommand = null;
        InputManagerEvent.emit(InputManagerEventKeyboard, InputManager.inputCurrentCommand);
    }

    // Code for mouse or touch input.

    /** Function to check input data from mouse and emit it through InputManagerEvent. */
    private checkMouseInput(event: EventMouse): void {
        InputManager.inputCurrentCommand = null;
        InputManagerEvent.emit(InputManagerEventMouseTouch, event.getLocation());
    }

    /** Experimental - Function to check input data from mouse wheel and emit it through InputManagerEvent. */
    private checkMouseWheelInput(event: EventMouse): void {
        InputManager.inputCurrentCommand = null;
        InputManagerEvent.emit(InputManagerEventMouseTouch, event.getLocation());
    }

    /** Function to check input data from touch screen and emit it through InputManagerEvent. */    
    private checkTouchInput(event: EventTouch): void {
        InputManager.inputCurrentCommand = null;
        InputManagerEvent.emit(InputManagerEventMouseTouch, event.getLocation());
    }

    /** Function to reset mouse or touch screen input data to null and emit it through InputManagerEvent. */
    private resetMouseTouchInput(): void {
        InputManager.inputCurrentCommand = null;
        InputManagerEvent.emit(InputManagerEventMouseTouch, null);
    }

    // Code for activating and deactivating input devices.

    /** Variable for storing selected input device. */
    private static inputDevice: INPUT_DEVICE = null;

    /** Function to get/set the input device. */
    public static get InputDevice(): INPUT_DEVICE {
        return this.inputDevice;
    }

    /** Function to get/set the input device. */
    public static set InputDevice(value: INPUT_DEVICE) {
        this.inputDevice = value;
    }

    /** Function to activate the selected input device. */
    private activateInputDevice(): void {
        this.deactivateInputDevice();
        switch (InputManager.inputDevice) {
            case INPUT_DEVICE.KEYBOARD: {
                input.on(Input.EventType.KEY_DOWN, this.checkKeyboardInput, this);
                input.on(Input.EventType.KEY_PRESSING, this.checkKeyboardInput, this);
                input.on(Input.EventType.KEY_UP, this.resetKeyboardInput, this);
                break;
            }
            case INPUT_DEVICE.MOUSE: {
                input.on(Input.EventType.MOUSE_DOWN, this.checkMouseInput, this);
                input.on(Input.EventType.MOUSE_MOVE, this.checkMouseInput, this);
                input.on(Input.EventType.MOUSE_UP, this.resetMouseTouchInput, this);
                input.on(Input.EventType.MOUSE_WHEEL, this.checkMouseWheelInput, this);
                break;
            }
            case INPUT_DEVICE.TOUCH: {
                input.on(Input.EventType.TOUCH_START, this.checkTouchInput, this);
                input.on(Input.EventType.TOUCH_MOVE, this.checkTouchInput, this);
                input.on(Input.EventType.TOUCH_END, this.resetMouseTouchInput, this);
                input.on(Input.EventType.TOUCH_CANCEL, this.resetMouseTouchInput, this);
                break;
            }
            default: {
                InputManager.inputDevice = null;
                break;
            }
        }
    }

    /** Function to deactivate all input devices. */
    private deactivateInputDevice(): void {
        // Code to disable listening to keyboard input.
        input.off(Input.EventType.KEY_DOWN, this.checkKeyboardInput, this);
        input.off(Input.EventType.KEY_PRESSING, this.checkKeyboardInput, this);
        input.off(Input.EventType.KEY_UP, this.resetKeyboardInput, this);

        // Code to disable listening to mouse input.
        input.off(Input.EventType.MOUSE_DOWN, this.checkMouseInput, this);
        input.off(Input.EventType.MOUSE_MOVE, this.checkMouseInput, this);
        input.off(Input.EventType.MOUSE_UP, this.resetMouseTouchInput, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.resetMouseTouchInput, this);
    
        // Code to disable listening to touch input.
        input.off(Input.EventType.TOUCH_START, this.checkTouchInput, this);
        input.off(Input.EventType.TOUCH_MOVE, this.checkTouchInput, this);
        input.off(Input.EventType.TOUCH_END, this.resetMouseTouchInput, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.resetMouseTouchInput, this);
    }
    
    // Life-cycle Methods of Cocos.

    protected onLoad(): void {
        InputManager.InputDevice = INPUT_DEVICE.MOUSE; // TODO: Change later.
        this.activateInputDevice();
    }
}