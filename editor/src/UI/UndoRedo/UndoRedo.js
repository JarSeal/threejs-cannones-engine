import { saveEditorState } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import { getSceneParamR } from '../../sceneData/sceneParams';
import {
  changeWorldBackgroundColor,
  setWorldGridHelperSize,
  toggleWorldAxesHelper,
  toggleWorldGridHelper,
} from '../../utils/toolsForWorld';

class UndoRedo {
  constructor() {
    this.STACK_MAX_SIZE = 10;
    this.stackPointer = getSceneParamR('editor.undoredo.pointer') || 0;
    this.stack = getSceneParamR('editor.undoredo.stack') || [{ type: '_init' }];
    this.applyingUndoOrRedo = false;
  }

  addAction = (action) => {
    if (this.applyingUndoOrRedo) return;
    if (!action.type || action.prevVal === undefined || action.newVal === undefined) {
      console.warn(
        `Could not add action to UndoRedo: type, prevVal, and/or newVal is missing (action: ${JSON.stringify(
          action
        )}).`
      );
      return;
    }
    this.stack.splice(0, this.stackPointer); // Remove the actions before the stack pointer (does nothing if stackPointer is 0)
    this.stack.unshift(action); // Add the new action to the beginning of the stack
    if (this.stack.length > this.STACK_MAX_SIZE) {
      // Remove the amount of stack history that exceeds the STACK_MAX_SIZE
      this.stack = this.stack.slice(0, this.STACK_MAX_SIZE - this.stack.length);
    }
    this.stackPointer = 0;
    getSceneItem('topTools').updateTools();
    saveEditorState({ undoredo: { stack: this.stack, pointer: this.stackPointer } });
  };

  undo = () => {
    this.applyingUndoOrRedo = true;
    this._doOperation(this.stack[this.stackPointer], 'undo');
    this.stackPointer++;
    if (this.stackPointer > this.STACK_MAX_SIZE - 1) this.stackPointer = this.STACK_MAX_SIZE - 1;
    getSceneItem('topTools').updateTools();
    saveEditorState({ undoredo: { stack: this.stack, pointer: this.stackPointer } });
    this.applyingUndoOrRedo = false;
  };

  redo = () => {
    this.applyingUndoOrRedo = true;
    this.stackPointer--;
    if (this.stackPointer < 0) this.stackPointer = 0;
    this._doOperation(this.stack[this.stackPointer], 'redo');
    getSceneItem('topTools').updateTools();
    saveEditorState({ undoredo: { stack: this.stack, pointer: this.stackPointer } });
    this.applyingUndoOrRedo = false;
  };

  isLastUndo = () => this.stackPointer === this.stack.length - 1;
  isFirstUndo = () => this.stackPointer === 0;

  _doOperation = (action, undoOrRedo) => {
    this._undoOperations[action.type]
      ? this._undoOperations[action.type](action, undoOrRedo)
      : null;
  };

  _undoOperations = {
    toggleWorldAxesHelper: () => {
      toggleWorldAxesHelper();
      getSceneItem('rightSidePanel').updatePanel();
    },
    toggleWorldGridHelper: () => {
      toggleWorldGridHelper();
      getSceneItem('rightSidePanel').updatePanel();
    },
    setWorldGridHelperSize: (action, undoOrRedo) => {
      setWorldGridHelperSize(undoOrRedo === 'undo' ? action.prevVal : action.newVal);
      getSceneItem('rightSidePanel').updatePanel();
    },
    changeWorldBackgroundColor: (action, undoOrRedo) => {
      changeWorldBackgroundColor(undoOrRedo === 'undo' ? action.prevVal : action.newVal);
      getSceneItem('rightSidePanel').updatePanel();
    },
  };
}

export default UndoRedo;
