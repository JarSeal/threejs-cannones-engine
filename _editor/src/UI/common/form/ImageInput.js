import { Component } from '../../../../LIGHTER';
import ChangeImagePopup from '../../popupsForms/ChangeImagePopup';
import PopupForm from '../../popupsForms/PopupForm';
import Button from '../Button';

class ImageInput extends Component {
  constructor(data) {
    super(data);
    this.mainImageWrapperId = this.id + '-main-image-wrapper';
    this.image = data.image;
    this.fileNameId = this.id + '-file-name';
    this.popupForm = new PopupForm({ id: this.id + '-popup-form' });
    this.template = `
      <div class="form-elem form-elem--fileInput imageInput ${this.image ? 'hasImage' : 'noImage'}">
        <div class="mainImageWrapper" id="${this.mainImageWrapperId}"></div>
        <label>
          <span class="form-elem__label">${data.label}</span>
        </label>
        <span class="fileName" id="${this.fileNameId}"></span>
      </div>
    `;
  }

  paint = () => {
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
}

export default ImageInput;
