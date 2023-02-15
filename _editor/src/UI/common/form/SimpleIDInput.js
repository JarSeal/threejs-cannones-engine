import { Component } from '../../../../LIGHTER';
import { saveStateByKey } from '../../../sceneData/saveSession';
import { getSceneItem, setSceneItem } from '../../../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../../../sceneData/sceneParams';
import Button from '../Button';
import TextInput from './TextInput';
import SvgIcon from '../../icons/svg-icon';
import './SimpleIDInput.scss';
import { updateCamUserDataHelpersAndIcon } from '../../../utils/toolsForCamera';
import { CAMERA_TARGET_ID, SELECTION_GROUP_ID } from '../../../utils/defaultSceneValues';
import APP_CONFIG from '../../../../../APP_CONFIG';

// Attributes:
// - label = field label [String]
// - curId = current ID's value [Number]
// - newId = boolean whether the undo button is shown on mistakes, default is false/undefined [Boolean]
// - focus = boolean whether the input should have focus after initiation or not [Boolean]
// - afterSuccessBlur(value) = function that is run after a successfull blur has been made (before the timeout)
// - validateOnInit = boolean whether the validation should be performed on component initiation
// - dontUpdateParam = boolean whether to update the found param value on successfull save (set to true to disable)
// - additionalValidationFn = function to be run on every validation round
class SimpleIDInput extends Component {
  constructor(data) {
    super(data);
    this.inputId = this.id + '-text-input';
    data.class = ['form-elem', 'form-elem--simple-id', 'simpleIdInput'];
    this.curId = data.curId;
    this.undoValue = this.curId;
    this.newId = data.newId;
    this.idGroup = data.idGroup;
    this.inputComponent = null;
    this.returnOriginalValueButton = null;
    this.timeout = null;
    this.groups = [
      'lights',
      'cameras',
      'scenes',
      'elements',
      'textures',
      'cubetextures',
      'images',
      'materials',
      'models',
      'globalTextures',
      'globalCubetextures',
      'globalMaterials',
      'globalModels',
    ];
    this.regex = new RegExp(APP_CONFIG.SIMPLE_ID_REGEX);
    this.focus = data.focus;
    this.afterSuccessBlur = data.afterSuccessBlur;
    this.dontUpdateParam = data.dontUpdateParam;
    setSceneItem('IDComponents', { ...(getSceneItem('IDComponents') || {}), [this.id]: this });
  }

  paint = () => {
    this.inputComponent = this.addChildDraw(
      new TextInput({
        id: this.inputId,
        label: this.data.label,
        value: this.curId,
        focus: this.focus,
        changeFn: (e) => {
          const value = e.target.value;
          const error = this._validate(value);
          if (!this.newId) {
            this.returnOriginalValueButton.discard();
            if (value !== this.curId) this.returnOriginalValueButton.draw();
          }
          if (error.hasError) {
            this.inputComponent.error(error);
          } else {
            this.inputComponent.error(null);
          }
          this.undoValue = this.curId;
        },
        onBlur: (e) => {
          const value = e.target.value;
          this.saveValue(value);
        },
      })
    );
    if (!this.newId) {
      this.returnOriginalValueButton = this.addChild(
        new Button({
          id: this.id + '-undo',
          icon: new SvgIcon({
            id: this.id + '-undo-icon',
            icon: 'undo',
            width: 17,
          }),
          attributes: { tabindex: '-1' },
          onClick: this._undoClick,
        })
      );
    }
    if (this.data.validateOnInit) {
      const error = this._validate(this.curId);
      if (error.hasError) this.inputComponent.error(error);
    }
  };

  saveValue = (value) => {
    this.undoValue = this.curId;
    const error = this._validate(value);
    if (!error.hasError && value !== this.curId) {
      // Wait for a possible undo click because this fn is fired before the possible click can happen
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        // Loop through all ids and change the matching curId to the new one
        if (!this.dontUpdateParam) {
          for (let g = 0; g < this.groups.length; g++) {
            const group = this.groups[g];
            const items = getSceneParam(group);
            if (!items) continue;
            for (let i = 0; i < items.length; i++) {
              if (this.idGroup) {
                if (items[i].id === this.curId && this.idGroup === group) {
                  items[i].id = value;
                }
              } else {
                if (items[i].id === this.curId) {
                  items[i].id = value;
                }
              }
              if (items[i].referenceId === this.curId) {
                // TODO: Use the keyword referenceId for all referenced ids everywhere!
                items[i].referenceId = value;
              }
            }
            setSceneParam(group, items);
            saveStateByKey(group, items);
          }
        }
        this.curId = value;
        getSceneItem('topTools')?.updateTools();
        if (!this.newId) this.returnOriginalValueButton.discard();
        const rightSidePanel = getSceneItem('rightSidePanel');
        if (rightSidePanel && !this.newId) rightSidePanel.updatePanel();
        // @TODO: update possible selectionIds (getSceneParam('selection'))
        if (!this.newId) updateCamUserDataHelpersAndIcon(null, this.curId);
        const nextElemId = document.activeElement.id;
        if (nextElemId) {
          // Because the timeout will rerender, the possible active elem needs to be refocused
          const nextElem = document.getElementById(nextElemId);
          if (nextElem) nextElem.focus();
        }
      }, 400);
      if (this.afterSuccessBlur) this.afterSuccessBlur(value, this.undoValue);
    }
  };

  _undoClick = () => {
    this.curId = this.undoValue;
    this.inputComponent.setValue(this.curId, true);
    this.inputComponent.error();
    if (!this.newId) this.returnOriginalValueButton.discard();
    this.saveValue(this.curId, true);
  };

  _validate = (value) => {
    let groups = [this.idGroup];
    if (!this.idGroup) {
      groups = this.groups;
    }
    if (value === undefined || value === null || value.length === 0) {
      if (this.data.onValidationErrors) this.data.onValidationErrors(value);
      return { hasError: true, errorMsg: 'Required' };
    }
    if (!this.regex.test(value)) {
      if (this.data.onValidationErrors) this.data.onValidationErrors(value);
      return {
        hasError: true,
        errorMsg: 'Only A-Z (a-z), 0-9, dash, and underscore allowed',
      };
    }
    const reservedStrings = [CAMERA_TARGET_ID, SELECTION_GROUP_ID];
    for (let i = 0; i < reservedStrings.length; i++) {
      if (value.search(reservedStrings[i]) !== -1) {
        return {
          hasError: true,
          errorMsg: `ID contains a reserved string ("${reservedStrings[i]}")`,
        };
      }
    }
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      const items = getSceneParam(group);
      if (!items) continue;
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === value.trim() && this.curId !== value.trim()) {
          if (this.data.onValidationErrors) this.data.onValidationErrors(value);
          return this.getAlreadyInUseError();
        }
      }
    }
    if (this.data.additionalValidationFn) {
      const error = this.data.additionalValidationFn(value);
      if (error?.hasError) {
        if (this.data.onValidationErrors) this.data.onValidationErrors(value);
        return error;
      }
    }
    if (this.data.onValidationSuccess) this.data.onValidationSuccess(value);
    return { hasError: false };
  };

  getAlreadyInUseError = () => ({ hasError: true, errorMsg: 'ID is already in use' });
}

export default SimpleIDInput;
