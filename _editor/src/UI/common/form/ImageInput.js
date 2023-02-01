import { Component } from '../../../../LIGHTER';
import { getSceneItem } from '../../../sceneData/sceneItems';
import { getSceneParam } from '../../../sceneData/sceneParams';
import { getImagePath, printName } from '../../../utils/utils';
import ImagePreviewDialog from '../../dialogs/ImagePreview';
import SvgIcon from '../../icons/svg-icon';
import ChangeImagePopup from '../../popupsForms/ChangeImagePopup';
import PopupForm from '../../popupsForms/PopupForm';
import Button from '../Button';
import ImageComponent from './ImageComponent';

// Attributes:
// - label = string
// - imageId = string
// - onChange = function to call when the imageId is updated or removed
// - showBigImageOnClick = boolean
class ImageInput extends Component {
  constructor(data) {
    super(data);
    this.mainImageWrapperId = this.id + '-main-image-wrapper';
    this.imageId = data.imageId;
    this.fileNameId = this.id + '-file-name';
    this.popupForm = new PopupForm({ id: this.id + '-popup-form' });
    this.template = `
      <div class="form-elem form-elem--imageInput imageInput ${
        this.imageId ? 'hasImage' : 'noImage'
      }">
        <div class="mainImageWrapper${data.showBigImageOnClick ? ' clickable' : ''}" id="${
      this.mainImageWrapperId
    }"></div>
        <label>
          <span class="form-elem__label">${data.label}</span>
        </label>
        <span class="fileName" id="${this.fileNameId}"></span>
        <span class="fileId" id="${this.imageId}">${this.imageId || ''}</span>
      </div>
    `;
    this.onChange = data.onChange;
  }

  addListeners = () => {
    if (this.data.showBigImageOnClick) {
      this.addListener({
        id: this.id + '-preview-image-click',
        target: document.getElementById(this.mainImageWrapperId),
        type: 'click',
        fn: () => {
          getSceneItem('dialog').appear({
            component: ImagePreviewDialog,
            componentData: { imageId: this.imageId },
            useComponentTitle: true,
            large: true,
          });
        },
      });
    }
  };

  paint = () => {
    if (this.imageId) {
      const imageParams = getSceneParam('images').find((img) => this.imageId === img.id);
      const imagePath = getImagePath(imageParams);
      this.addChildDraw(
        new ImageComponent({
          id: this.id + '-texture-image',
          imagePath,
          attach: this.mainImageWrapperId,
          alt: printName(imageParams),
        })
      );
      document.getElementById(this.fileNameId).textContent = imageParams.fileName;
    } else {
      this.emptyImageIcon = this.addChildDraw(
        new SvgIcon({
          id: this.id + '-empty-image-icon',
          icon: 'fileImage',
          width: 19,
          attach: this.mainImageWrapperId,
        })
      );
      document.getElementById(this.fileNameId).textContent = '';
    }

    this.addChildDraw(
      new Button({
        id: this.id + '-open-change-image-btn',
        class: 'openChangeImagePopoverBtn',
        onClick: () => {
          this.popupForm.data.componentData = { imageInputComponent: this };
          this.popupForm.data.component = new ChangeImagePopup({
            id: this.id + '-change-image-popup',
            class: 'changeImagePopover',
          });
          this.addChildDraw(this.popupForm);
        },
      })
    );
  };

  update = (id) => {
    if (this.onChange) this.onChange(id);
  };
}

export default ImageInput;
