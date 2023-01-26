import { Component } from '../../../../LIGHTER';
import SvgIcon from '../../icons/svg-icon';
import TinyButtonGroup from '../TinyButtonGroup';

// Attributes:
// - textureId = string | null | undefined
class Texture extends Component {
  constructor(data) {
    super(data);
    this.mainImageWrapperId = this.id + '-main-image-wrapper';
    this.textureType = 'Texture';
    this.textureId = data.textureId;
    this.template = `
      <div class="form-elem form-elem--texture texture ${
        !this.textureId ? 'noTexture' : 'hasTexture'
      }">
        <label>
          <span class="form-elem__label">${data.label}</span>
          <span class="textureTypeAndUseCases">${this.textureType}</span>
        </label>
        <div class="mainImageWrapper" id="${this.mainImageWrapperId}"></div>
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
            icon: new SvgIcon({ id: this.id + '-add-button', icon: 'plus', width: 8 }),
            onClick: () => console.log('Add new texture'),
          },
        ],
      })
    );
  };
}

export default Texture;
