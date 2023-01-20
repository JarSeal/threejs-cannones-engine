import { selectObjects } from '../controls/stageClick';
import { getSceneItem } from '../sceneData/sceneItems';
import { getSceneParam } from '../sceneData/sceneParams';
import { saveScene } from '../utils/toolsForFS';
import { toggleWorldAxesHelper, toggleWorldGridHelper } from '../utils/toolsForWorld';
import { closeProject } from '../utils/utils';

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
    if (action) action(e);
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
    { keys: ['Control', 's'], actionKey: 'saveScene' },
    { keys: ['Escape'], actionKey: 'escape' },
    { keys: ['s'], actionKey: 'selectTool' },
    { keys: ['z'], actionKey: 'translateTool' },
    { keys: ['r'], actionKey: 'rotateTool' },
    { keys: ['x'], actionKey: 'scaleTool' },
    { keys: ['g'], actionKey: 'toggleGrid' },
    { keys: ['h'], actionKey: 'toggleAxes' },
    { keys: ['Control', 'Backspace'], actionKey: 'closeProject' },
  ];

  // These are all the available shortcut actions for the user to configure in the settings (@TODO users can reset these)
  ACTION_POOL = {
    undo: () => getSceneItem('undoRedo').undo(),
    redo: () => getSceneItem('undoRedo').redo(),
    saveScene: async (e) => {
      e.preventDefault();
      await saveScene();
    },
    escape: () => (getSceneParam('selection').length ? selectObjects([]) : null),
    selectTool: () => getSceneItem('leftTools').changeTool('select'),
    translateTool: () => getSceneItem('leftTools').changeTool('translate'),
    rotateTool: () => getSceneItem('leftTools').changeTool('rotate'),
    scaleTool: () => getSceneItem('leftTools').changeTool('scale'),
    toggleGrid: () => toggleWorldGridHelper(),
    toggleAxes: () => {
      const selections = getSceneItem('selection');
      if (!selections.length) {
        toggleWorldAxesHelper();
        return;
      }
      if (selections.length === 1) {
        const params = selections[0].userData;
        if (params.isTargetingObject && params.toggleHelper) {
          params.toggleHelper(!params.showHelper, params.index);
        } else if (params.isTargetObject && params.params.toggleHelper) {
          params.params.toggleHelper(!params.params.showHelper, params.params.index);
        }
      } else {
        for (let i = 0; i < selections.length; i++) {
          const params = selections[i].userData;
          if (params.isTargetingObject && params.toggleHelper) {
            // When multiselect, only when a targeting object (not target object) is present, this will work
            // Otherwise if both are selected for the same cam, the toggleHelper would toggle right away back and nothing happens
            // @CONSIDER: rewrite this to manage the problem described
            params.toggleHelper(!params.showHelper, params.index);
          }
        }
      }
    },
    closeProject: () => closeProject(),
  };
}

export default KeyboardShortcuts;
