import { saveEditorState } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import { getSceneParamR } from '../../sceneData/sceneParams';
import undoRedoOperations from './undoRedoOperations';

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
    // If the type and the newVal are the same as the previous entry, then don't record it
    const newValStringified = JSON.stringify(action.newVal);
    if (
      (action.type === this.stack[this.stackPointer].type &&
        newValStringified === JSON.stringify(this.stack[this.stackPointer].newVal)) ||
      newValStringified === JSON.stringify(action.prevVal)
    ) {
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
    this._doOperation(this.stack[this.stackPointer], true);
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
    this._doOperation(this.stack[this.stackPointer], false);
    getSceneItem('topTools').updateTools();
    saveEditorState({ undoredo: { stack: this.stack, pointer: this.stackPointer } });
    this.applyingUndoOrRedo = false;
  };

  isLastUndo = () => this.stackPointer === this.stack.length - 1;
  isFirstUndo = () => this.stackPointer === 0;

  _doOperation = (action, isUndo) => {
    undoRedoOperations[action.type] ? undoRedoOperations[action.type](action, isUndo) : null;
  };
}

export default UndoRedo;
