import { Component } from '../../../../LIGHTER';
import { saveEditorState } from '../../../sceneData/saveSession';
import { getSceneParam, getSceneParamR, setSceneParamR } from '../../../sceneData/sceneParams';
import { WRAP_OPTIONS } from '../../../utils/defaultSceneValues';
import { printName } from '../../../utils/utils';
import SvgIcon from '../../icons/svg-icon';
import NewTexturePopup from '../../popupsForms/NewTexturePopup';
import PopupForm from '../../popupsForms/PopupForm';
import Button from '../Button';
import TinyButtonGroup from '../TinyButtonGroup';
import Checkbox from './Checbox';
import Dropdown from './Dropdown';
import ImageInput from './ImageInput';

// Attributes:
// - textureId = string | null | undefined
// - onChange = function that is executed when the texture changes, its params change, or when it is removed
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
      this.image ? 'hasImage' : 'noImage'
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
  }

  paint = () => {
    this.emptyImageIcon = this.addChildDraw(
      new SvgIcon({
        id: this.id + '-empty-image-icon',
        icon: 'fileImage',
        width: 19,
        attach: this.mainImageWrapperId,
      })
    );

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

    this.addChildDraw(
      new Button({
        id: this.id + '-remove-texture-btn',
        icon: new SvgIcon({ id: this.id + '-remove-texture-btn-icon', icon: 'xMark', width: 10 }),
        class: 'removeTextureBtn',
        prepend: true,
        onClick: () => this.data.onChange(null),
      })
    );

    this.addChildDraw(
      new ImageInput({
        id: this.id + '-file-input',
        label: 'Image',
        file: this.params.image || null,
        attach: this.textureParamsContentId,
      })
    );

    this.addChildDraw(
      new Checkbox({
        id: this.id + '-flipY',
        attach: this.textureParamsContentId,
        label: 'Flip Y',
        class: 'flipY',
        changeFn: () => console.log('Flip Y'),
        value: this.params.flipY,
      })
    );

    this.addChildDraw(
      new Dropdown({
        id: this.id + '-wrapS',
        label: 'Wrap S',
        class: 'wrapping',
        attach: this.textureParamsContentId,
        selected: this.params.wrapS,
        options: WRAP_OPTIONS,
        changeFn: (e) => {
          const value = e.target.value;
          console.log('Change wrapS', value);
        },
      })
    );

    this.addChildDraw(
      new Dropdown({
        id: this.id + '-wrapT',
        label: 'Wrap T',
        class: 'wrapping',
        attach: this.textureParamsContentId,
        selected: this.params.wrapT,
        options: WRAP_OPTIONS,
        changeFn: (e) => {
          const value = e.target.value;
          console.log('Change wrapT', value);
        },
      })
    );

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
}

export default Texture;
