import { Component } from '../../../../LIGHTER';

class ImageComponent extends Component {
  constructor(data) {
    super(data);
    let classString = data.class;
    if (Array.isArray(data.class)) {
      classString = data.class.join(' ');
    }
    this.template = `<img
      ${data.class ? `class="${classString}"` : ''}
      ${data.alt ? `alt="${data.alt}"` : ''}
      src="${data.imagePath}" />`;
  }
}

export default ImageComponent;
