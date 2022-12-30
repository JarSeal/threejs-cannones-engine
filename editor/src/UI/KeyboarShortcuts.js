import { getSceneItem } from '../sceneData/sceneItems';
import { toggleWorldAxesHelper, toggleWorldGridHelper } from '../utils/toolsForWorld';

class KeyboardShortcuts {
  constructor() {
    this._createListeners();
    this.keysDown = [];
    this.shortCuts = this._createFastKeys(this.DEFAULT_SHORTCUTS);
  }

  _listnenerKeydownFn = (e) => {
    if (this.keysDown.indexOf(e.key) === -1) {
      this.keysDown.push(e.key);
    }
    if (document.activeElement?.nodeName === 'INPUT') return;
    const actionKey = this.keysDown.sort().join('');
    const action = this.shortCuts[actionKey];
    if (action) action();
    // console.log('KEYS DOWN', this.keysDown, actionKey);
  };

  _listenerKeyupFn = (e) => {
    this.keysDown = this.keysDown.filter((key) => key !== e.key);
  };

  _resetKeysDown = () => (this.keysDown = []);

  _createListeners = () => {
    window.addEventListener('keydown', this._listnenerKeydownFn, false);
    window.addEventListener('keyup', this._listenerKeyupFn, false);
    window.addEventListener('focus', this._resetKeysDown, false);
    window.addEventListener('blur', this._resetKeysDown, false);
  };

  removeListeners = () => {
    window.removeEventListener('keydown', this._listnenerKeydownFn);
    window.removeEventListener('keyup', this._listenerKeyupFn);
    window.removeEventListener('focus', this._resetKeysDown);
    window.removeEventListener('blur', this._resetKeysDown);
  };

  // Takes in the shortcuts in the shortcuts array (check format from DEFAULT_SHORTCUTS) and
  // creates a fastKeys object with keys joined as a string (eg. ['Control', 'z'] becomes 'Controlz')
  // to create and return an object with fast access to the action.
  _createFastKeys = (shortcuts) => {
    const fastKeys = {};
    for (let i = 0; i < shortcuts.length; i++) {
      const sc = shortcuts[i];
      const sortedKeys = sc.keys.sort();
      let constructedKey = '';
      sortedKeys.forEach((k) => {
        if (k) constructedKey += k;
      });
      if (constructedKey.length && this.ACTION_POOL[sc.actionKey]) {
        fastKeys[constructedKey] = this.ACTION_POOL[sc.actionKey];
      }
    }
    return fastKeys;
  };

  DEFAULT_SHORTCUTS = [
    { keys: ['Control', 'z'], actionKey: 'undo' },
    { keys: ['Control', 'Shift', 'Z'], actionKey: 'redo' },
    { keys: ['s'], actionKey: 'selectElement' },
    { keys: ['z'], actionKey: 'translateElement' },
    { keys: ['r'], actionKey: 'rotateElement' },
    { keys: ['x'], actionKey: 'scaleElement' },
    { keys: ['g'], actionKey: 'toggleGrid' },
    { keys: ['h'], actionKey: 'toggleAxes' },
  ];

  // These are all the available shortcut actions for the user to configure in the settings (@TODO)
  ACTION_POOL = {
    undo: () => getSceneItem('undoRedo').undo(),
    redo: () => getSceneItem('undoRedo').redo(),
    selectElement: () => getSceneItem('leftTools').changeTool('select'),
    translateElement: () => getSceneItem('leftTools').changeTool('translate'),
    rotateElement: () => getSceneItem('leftTools').changeTool('rotate'),
    scaleElement: () => getSceneItem('leftTools').changeTool('scale'),
    toggleGrid: () => toggleWorldGridHelper(),
    toggleAxes: () => toggleWorldAxesHelper(),
  };
}

export default KeyboardShortcuts;
