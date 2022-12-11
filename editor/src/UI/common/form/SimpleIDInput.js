import { Component } from '../../../../LIGHTER';
import { saveStateByKey } from '../../../sceneData/saveSession';
import { getSceneItem } from '../../../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../../../sceneData/sceneParams';
import Button from '../Button';
import TextInput from './TextInput';
import SvgIcon from '../../icons/svg-icon';
import './SimpleIDInput.scss';

// Attributes:
// - label = field label [String]
// - changeFn = function that is ran after each change [Function]
// - onBlur = function that happens when the input loses focus [Function]
// - onFocus = function that happens when the input gets focus [Function]
// - curId = current ID's value [Number]
// - disabled = whether the field is disabled or not [Boolean]
// - doNotSelectOnFocus = boolean whether to select all content or not [Boolean]
// - doNotBlurOnEnter = boolean whether to blur from the input field when Enter key is pressed [Boolean]
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
    this.groups = ['lights', 'cameras', 'scenes', 'elements'];
    this.regex = new RegExp('^[a-zA-Z0-9-_]+$');
  }

  paint = () => {
    this.inputComponent = this.addChildDraw(
      new TextInput({
        id: this.inputId,
        label: this.data.label,
        value: this.curId,
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
          this._saveValue(value);
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
  };

  _saveValue = (value) => {
    this.undoValue = this.curId;
    const error = this._validate(value);
    if (!error.hasError && value !== this.curId) {
      // Wait for a possible undo click because this fn is fired before the possible click can happen
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        // Loop through all ids and change the matching curId to the new one
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
        this.curId = value;
        const cameraParams = getSceneParam('cameras');
        const currentCameraId = cameraParams[getSceneParam('curCameraIndex')]?.id;
        const cameraSelector = getSceneItem('cameraSelectorTool');
        cameraSelector.setOptions(
          cameraParams.map((c) => ({ value: c.id, label: c.name || c.id })),
          currentCameraId
        );
        if (!this.newId) this.returnOriginalValueButton.discard();
        const nextElemId = document.activeElement.id;
        const rightSidePanel = getSceneItem('rightSidePanel');
        rightSidePanel.updatePanel();
        if (nextElemId) {
          // Because the timeout will rerender, the possible active elem needs to be refocused
          const nextElem = document.getElementById(nextElemId);
          if (nextElem) nextElem.focus();
        }
      }, 400);
    }
  };

  _undoClick = () => {
    this.curId = this.undoValue;
    this.inputComponent.setValue(this.curId, true);
    this.inputComponent.error();
    if (!this.newId) this.returnOriginalValueButton.discard();
    this._saveValue(this.curId);
  };

  _validate = (value) => {
    let groups = [this.idGroup];
    if (!this.idGroup) {
      groups = this.groups;
    }
    if (value === undefined || value.length === 0) {
      if (this.data.onValidationErrors) this.data.onValidationErrors();
      return { hasError: true, errorMsg: 'Required' };
    }
    if (!this.regex.test(value)) {
      if (this.data.onValidationErrors) this.data.onValidationErrors();
      return {
        hasError: true,
        errorMsg: 'Only A-Z (a-z), 0-9, dash, and underscore allowed',
      };
    }
    for (let g = 0; g < groups.length; g++) {
      const group = groups[g];
      const items = getSceneParam(group);
      if (!items) continue;
      for (let i = 0; i < items.length; i++) {
        if (items[i].id === value.trim() && this.curId !== value.trim()) {
          if (this.data.onValidationErrors) this.data.onValidationErrors();
          return { hasError: true, errorMsg: 'ID is already in use' };
        }
      }
    }
    if (this.data.onValidationSuccess) this.data.onValidationSuccess();
    return { hasError: false };
  };
}

export default SimpleIDInput;
