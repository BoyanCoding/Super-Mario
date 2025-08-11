import { InputState } from '@/types/game';

export class InputHandler {
  private inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    run: false,
    pause: false,
  };

  private keyMap: Record<string, keyof InputState> = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowUp': 'up',
    'ArrowDown': 'down',
    'Space': 'jump',
    'ShiftLeft': 'run',
    'ShiftRight': 'run',
    'Escape': 'pause',
    'KeyP': 'pause',
  };

  private listeners: Array<(inputState: InputState) => void> = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Prevent default behavior for game keys
    document.addEventListener('keydown', (event) => {
      if (this.keyMap[event.code]) {
        event.preventDefault();
      }
    });

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Handle window focus/blur to prevent stuck keys
    window.addEventListener('blur', this.handleWindowBlur.bind(this));
    window.addEventListener('focus', this.handleWindowFocus.bind(this));
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const action = this.keyMap[event.code];
    if (action && !this.inputState[action]) {
      this.inputState[action] = true;
      console.log(`Key pressed: ${event.code} -> ${action}`); // Debug log
      this.notifyListeners();
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const action = this.keyMap[event.code];
    if (action && this.inputState[action]) {
      this.inputState[action] = false;
      console.log(`Key released: ${event.code} -> ${action}`); // Debug log
      this.notifyListeners();
    }
  };

  private handleWindowBlur = (): void => {
    // Clear all input states when window loses focus
    Object.keys(this.inputState).forEach(key => {
      this.inputState[key as keyof InputState] = false;
    });
    this.notifyListeners();
  };

  private handleWindowFocus = (): void => {
    // Optional: Handle window focus if needed
  };

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.inputState }));
  }

  /**
   * Subscribe to input state changes
   */
  public subscribe(callback: (inputState: InputState) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current input state
   */
  public getInputState(): InputState {
    return { ...this.inputState };
  }

  /**
   * Check if a specific action is currently active
   */
  public isActionActive(action: keyof InputState): boolean {
    return this.inputState[action];
  }

  /**
   * Set custom key mapping
   */
  public setKeyMapping(key: string, action: keyof InputState): void {
    this.keyMap[key] = action;
  }

  /**
   * Clear all input states (useful for pausing/resetting)
   */
  public clearInputs(): void {
    Object.keys(this.inputState).forEach(key => {
      this.inputState[key as keyof InputState] = false;
    });
    this.notifyListeners();
  }

  /**
   * Cleanup event listeners
   */
  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('focus', this.handleWindowFocus);
    this.listeners.length = 0;
  }

  /**
   * Enable/disable input handling
   */
  private enabled: boolean = true;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearInputs();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}