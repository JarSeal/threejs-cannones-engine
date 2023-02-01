import { Component } from '../../../LIGHTER';
import { getSceneParam } from '../../sceneData/sceneParams';
import { getImagePath, getFileSizeString, getDateString } from '../../utils/utils';

class ImagePreviewDialog extends Component {
  constructor(data) {
    data.id = 'image-preview-dialog';
    super(data);
    this.imageTagId = this.id + '-image-tag';
    const imageParams = getSceneParam('images').find((img) => data.imageId === img.id);
    let imagePath;
    if (imageParams) {
      imagePath = getImagePath(imageParams);
    }
    this.template = `<div class="imagePreviewWrapper">
      ${
        imagePath
          ? `<h3>${imageParams.fileName}</h3>
          <img id="${this.imageTagId}" alt="image preview" src="${imagePath}" />
          <span>ID: ${imageParams.id}</span>
          <span>Name: ${imageParams.name}</span>
          <span>Dimensions: ${imageParams.dimensions?.width || 0} x ${
              imageParams.dimensions?.height || 0
            }</span>
          <span>Filesize: ${getFileSizeString(imageParams.fileSize)}</span>
          <span>Type: ${imageParams.type}</span>
          <span>Imported: ${getDateString(imageParams.dateSaved)}</span>`
          : 'Image data was not found...'
      }
    </div>`;
    this.showFullSize = false;
  }

  addListeners = () => {
    this.addListener({
      id: this.id + '-click-listener',
      target: document.getElementById(this.imageTagId),
      type: 'click',
      fn: () => {
        if (this.showFullSize) {
          this.showFullSize = false;
          this.elem.classList.remove('fullSize');
          return;
        }
        this.showFullSize = true;
        this.elem.classList.add('fullSize');
      },
    });
  };
}

export default ImagePreviewDialog;
