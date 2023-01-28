import { Component } from '../../../../LIGHTER';
import { getSceneParam } from '../../../sceneData/sceneParams';
import { printName } from '../../../utils/utils';
import SvgIcon from '../../icons/svg-icon';
import NewTexturePopup from '../../popupsForms/NewTexturePopup';
import PopupForm from '../../popupsForms/PopupForm';
import TinyButtonGroup from '../TinyButtonGroup';

// Attributes:
// - textureId = string | null | undefined
// - onUpdate = function that is executed when the texture changes, its params change, or when it is removed
class Texture extends Component {
  constructor(data) {
    super(data);
    this.mainImageWrapperId = this.id + '-main-image-wrapper';
    this.textureNameId = this.id + '-texture-name';
    this.textureType = 'Texture';
    this.textureId = data.textureId;
    this.popupForm = new PopupForm({ id: this.id + '-popup-form' });
    this.template = `
      <div class="form-elem form-elem--texture texture ${
        !this.textureId ? 'noTexture' : 'hasTexture'
      }">
        <div class="mainImageWrapper" id="${this.mainImageWrapperId}"></div>
        <label>
          <span class="form-elem__label">${data.label}</span>
        </label>
        <span class="textureName" id="${this.textureNameId}"></span>
        <span class="textureTypeAndUseCases">${this.textureType}</span>
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

    // @TODO: render remove texture button (X on the top right corner) here...
  };

  update = (id) => {
    if (!id) {
      this.textureId = null;
      this.params = {};
    } else {
      const foundParams = this._getParams(id);
      if (foundParams) {
        const textureNameElem = document.getElementById(this.textureNameId);
        textureNameElem.textContent = printName(this.params);
      }
    }
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
}

export default Texture;
