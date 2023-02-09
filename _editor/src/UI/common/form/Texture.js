import * as THREE from 'three';

import { Component } from '../../../../LIGHTER';
import { saveEditorState, saveStateByKey } from '../../../sceneData/saveSession';
import {
  getSceneParam,
  getSceneParamR,
  setSceneParam,
  setSceneParamR,
} from '../../../sceneData/sceneParams';
import { WRAP_OPTIONS } from '../../../utils/defaultSceneValues';
import {
  destroyTexture,
  updateTextureImage,
  updateTextureParam,
} from '../../../utils/toolsForTextures';
import { getImagePath, printName } from '../../../utils/utils';
import SvgIcon from '../../icons/svg-icon';
import NewTexturePopup from '../../popupsForms/NewTexturePopup';
import PopupForm from '../../popupsForms/PopupForm';
import Button from '../Button';
import TinyButtonGroup from '../TinyButtonGroup';
import Checkbox from './Checbox';
import Dropdown from './Dropdown';
import ImageComponent from './ImageComponent';
import ImageInput from './ImageInput';
import NumberInput from './NumberInput';

// Attributes:
// - textureId = string | null | undefined
// - onChange = function that is executed when the texture changes, its params change, or when it is removed
// - targetItemKey = string (the item like "scene.background" or "elements.material.map")
// - itemIndex = number (if the first key, "elements" is an array, then an itemIndex needs to be present)
class Texture extends Component {
  constructor(data) {
    super(data);
    this.mainImageWrapperId = this.id + '-main-image-wrapper';
    this.textureNameId = this.id + '-texture-name';
    this.textureParamsWrapperId = this.id + '-texture-params';
    this.textureParamsContentId = this.id + '-texture-params-content';
    this.textureParamsOpen = getSceneParamR(`editor.show.${this.id}`, false);
    this.textureType = 'Texture';
    this.textureId = data.textureId;
    if (this.textureId) {
      this.params = getSceneParam('textures').find((tex) => tex.id === this.textureId);
    } else {
      this.params = {};
    }
    this.popupForm = new PopupForm({ id: this.id + '-popup-form' });
    this.template = `
      <div class="texture ${this.textureId ? 'hasTexture' : 'noTexture'} ${
      this.params.image ? 'hasImage' : 'noImage'
    }">
        <div class="form-elem form-elem--texture textureInput">
          <div class="mainImageWrapper" id="${this.mainImageWrapperId}"></div>
          <label>
            <span class="form-elem__label">${data.label}</span>
          </label>
          <span class="textureName" id="${this.textureNameId}">${
      this.textureId ? printName(this.params) : ''
    }</span>
          <span class="textureTypeAndUseCases">${this.textureType}</span>
        </div>
        <div class="textureParamsWrapper" id="${this.textureParamsWrapperId}">
          <div class="textureParamsContents ${this.textureParamsOpen ? 'show' : 'hide'}" id="${
      this.textureParamsContentId
    }"></div>
        </div>
      </div>
    `;
    this.onChange = data.onChange;
    this.targetItemKey = data.targetItemKey;
    this.itemId = data.itemId;
  }

  paint = () => {
    if (this.params.image) {
      const imageParams = getSceneParam('images').find((img) => this.params.image === img.id);
      const imagePath = getImagePath(imageParams);
      this.addChildDraw(
        new ImageComponent({
          id: this.id + '-texture-image',
          imagePath,
          attach: this.mainImageWrapperId,
          alt: printName(imageParams),
        })
      );
    } else {
      // Empty image icon
      this.addChildDraw(
        new SvgIcon({
          id: this.id + '-empty-image-icon',
          icon: 'fileImage',
          width: 19,
          attach: this.mainImageWrapperId,
        })
      );
    }

    // New, select, and library buttons
    this.addChildDraw(
      new TinyButtonGroup({
        id: this.id + '-texture-buttons',
        class: ['textureButtons'],
        prepend: true,
        buttons: [
          {
            icon: new SvgIcon({ id: this.id + '-add-button', icon: 'plus', width: 10, height: 10 }),
            onClick: () => {
              this.popupForm.data.title = 'Add new texture';
              this.popupForm.data.componentData = { textureInputComponent: this };
              this.popupForm.data.component = new NewTexturePopup({
                id: this.id + '-new-texture-popup',
              });
              this.addChildDraw(this.popupForm);
            },
          },
          {
            icon: new SvgIcon({
              id: this.id + '-select-button',
              icon: 'file',
              width: 8,
              height: 11,
            }),
            onClick: () => console.log('Select texture'),
          },
          {
            icon: new SvgIcon({
              id: this.id + '-library-button',
              icon: 'bookOpen',
              width: 12,
              height: 10,
            }),
            onClick: () => console.log('Select texture from library'),
          },
        ],
      })
    );

    // Remove texture button
    this.addChildDraw(
      new Button({
        id: this.id + '-remove-texture-btn',
        icon: new SvgIcon({ id: this.id + '-remove-texture-btn-icon', icon: 'xMark', width: 10 }),
        class: 'removeTextureBtn',
        prepend: true,
        onClick: () => this.onChange(null),
      })
    );

    // Texture settings:
    // *****************

    // Image
    this.addChildDraw(
      new ImageInput({
        id: this.id + '-image-input',
        label: 'Image',
        imageId: this.params.image || null,
        attach: this.textureParamsContentId,
        showBigImageOnClick: true,
        onChange: (newId) => {
          const prevVal = this.params.image;
          this.params.image = newId;
          updateTextureImage({
            textureId: this.textureId,
            imageId: newId,
            prevImageId: prevVal,
            targetItemKey: this.targetItemKey,
            itemId: this.itemId,
          });
          // this.changeTexture();
        },
      })
    );

    // FlipY
    this.addChildDraw(
      new Checkbox({
        id: this.id + '-flipY',
        attach: this.textureParamsContentId,
        label: 'Flip Y',
        class: 'flipY',
        changeFn: (e) => {
          const prevVal = this.params.flipY;
          this.params.flipY = e.target.checked;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.flipY',
            targetParamKey: 'flipY',
            newVal: e.target.checked,
            prevVal,
          });
        },
        value: this.params.flipY,
      })
    );

    // WrapS
    this.addChildDraw(
      new Dropdown({
        id: this.id + '-wrapS',
        label: 'Wrap S',
        class: 'wrapping',
        attach: this.textureParamsContentId,
        selected: this.params.wrapS,
        options: WRAP_OPTIONS,
        changeFn: (e) => {
          const value = parseInt(e.target.value);
          if (this.params.wrapS === value) return;
          const prevVal = this.params.wrapS;
          this.params.wrapS = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.wrapS',
            targetParamKey: 'wrapS',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // WrapT
    this.addChildDraw(
      new Dropdown({
        id: this.id + '-wrapT',
        label: 'Wrap T',
        class: 'wrapping',
        attach: this.textureParamsContentId,
        selected: this.params.wrapT,
        options: WRAP_OPTIONS,
        changeFn: (e) => {
          const value = parseInt(e.target.value);
          if (this.params.wrapT === value) return;
          const prevVal = this.params.wrapT;
          this.params.wrapT = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.wrapT',
            targetParamKey: 'wrapT',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // WrapSTimes
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-wrapSTimes',
        label: 'Wrap S times',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: 0.5,
        min: 0,
        max: 200000,
        precision: 10,
        value: this.params.wrapSTimes,
        disabled: this.params.wrapS === THREE.ClampToEdgeWrapping,
        changeFn: (value) => {
          if (this.params.wrapSTimes === value) return;
          const prevVal = this.params.wrapSTimes;
          this.params.wrapSTimes = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.repeat.x',
            targetParamKey: 'wrapSTimes',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // WrapTTimes
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-wrapTTimes',
        label: 'Wrap T times',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: 0.5,
        min: 0,
        max: 200000,
        precision: 10,
        value: this.params.wrapTTimes,
        disabled: this.params.wrapT === THREE.ClampToEdgeWrapping,
        changeFn: (value) => {
          if (this.params.wrapTTimes === value) return;
          const prevVal = this.params.wrapTTimes;
          this.params.wrapTTimes = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.repeat.y',
            targetParamKey: 'wrapTTimes',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // OffsetU
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-offsetU',
        label: 'Offset U',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: 0.05,
        min: 0,
        max: 1,
        precision: 10,
        value: this.params.offsetU,
        changeFn: (value) => {
          if (this.params.offsetU === value) return;
          const prevVal = this.params.offsetU;
          this.params.offsetU = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.offset.x',
            targetParamKey: 'offsetU',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // OffsetV
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-offsetV',
        label: 'Offset V',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: 0.05,
        min: 0,
        max: 1,
        precision: 10,
        value: this.params.offsetV,
        changeFn: (value) => {
          if (this.params.offsetV === value) return;
          const prevVal = this.params.offsetV;
          this.params.offsetV = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.offset.y',
            targetParamKey: 'offsetV',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // CenterU
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-centerU',
        label: 'Center U',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: 0.05,
        min: 0,
        max: 1,
        precision: 10,
        value: this.params.centerU,
        changeFn: (value) => {
          if (this.params.centerU === value) return;
          const prevVal = this.params.centerU;
          this.params.centerU = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.center.x',
            targetParamKey: 'centerU',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // CenterV
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-centerV',
        label: 'Center V',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: 0.05,
        min: 0,
        max: 1,
        precision: 10,
        value: this.params.centerV,
        changeFn: (value) => {
          if (this.params.centerV === value) return;
          const prevVal = this.params.centerV;
          this.params.centerV = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.center.y',
            targetParamKey: 'centerV',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // Rotation
    this.addChildDraw(
      new NumberInput({
        id: this.id + '-rotation',
        label: 'Rotation',
        class: 'oneFourthWidth',
        attach: this.textureParamsContentId,
        step: Math.PI / 8,
        precision: 10,
        value: this.params.rotation,
        changeFn: (value) => {
          if (this.params.rotation === value) return;
          const prevVal = this.params.rotation;
          this.params.rotation = value;
          updateTextureParam({
            textureId: this.textureId,
            params: this.params,
            targetItemKey: 'textures.rotation',
            targetParamKey: 'rotation',
            newVal: value,
            prevVal,
          });
        },
      })
    );

    // Delete texture button
    this.addChildDraw(
      new Button({
        id: this.id + '-destroy-texture',
        icon: new SvgIcon({
          id: this.id + '-destroy-texture-icon',
          icon: 'trash',
          width: 12,
        }),
        attach: this.textureParamsContentId,
        class: ['panelActionButton', 'delete-button'],
        onClick: () => {
          destroyTexture(this.params);
        },
      })
    );

    // Show/hide params toggler
    this.paramsToggler = this.addChildDraw(
      new Button({
        id: this.id + '-toggle-params-content',
        class: ['toggleParamsContent', this.textureParamsOpen ? 'show' : 'hide'],
        attach: this.textureParamsWrapperId,
        onClick: () => this.toggleParams(),
      })
    );
  };

  update = (id) => {
    // @Consider: whether the whole updating of this component should be here or just rerender the whole parent of this Texture component (in the onChange)
    const textureNameElem = document.getElementById(this.textureNameId);
    if (!id) {
      this.textureId = null;
      this.params = {};
      textureNameElem.textContent = '';
    } else {
      const foundParams = this._getParams(id);
      if (foundParams) {
        textureNameElem.textContent = printName(this.params);
      } else {
        console.warn(`Could not find texture params with texture ID: "${id}".*`);
      }
    }
    if (this.data.onChange) this.data.onChange(this.textureId);
  };

  _getParams = (id) => {
    const textureParams = getSceneParam('textures').find((tex) => tex.id === id);
    if (textureParams) {
      this.textureId = id;
      this.params = textureParams;
      return true;
    } else {
      this.textureId = null;
      this.params = {};
      return false;
    }
  };

  toggleParams = () => {
    if (this.textureParamsOpen) {
      document.getElementById(this.textureParamsContentId).classList.add('hide');
      this.paramsToggler.elem.classList.add('hide');
    } else {
      document.getElementById(this.textureParamsContentId).classList.remove('hide');
      this.paramsToggler.elem.classList.remove('hide');
    }
    this.textureParamsOpen = !this.textureParamsOpen;
    setSceneParamR(`editor.show.${this.id}`, this.textureParamsOpen);
    saveEditorState({ show: { [this.id]: this.textureParamsOpen } });
  };

  openParams = () => {
    if (this.textureParamsOpen) return;
    this.toggleParams();
  };

  closeParams = () => {
    if (!this.textureParamsOpen) return;
    this.toggleParams();
  };

  changeTexture = () => {
    const filteredTextureParams = getSceneParam('textures').filter(
      (tex) => this.params.id !== tex.id
    );
    const newTextureParams = [...filteredTextureParams, this.params];
    setSceneParam('textures', newTextureParams);
    saveStateByKey('textures', newTextureParams);
    this.onChange(this.params.id);
  };
}

export default Texture;
