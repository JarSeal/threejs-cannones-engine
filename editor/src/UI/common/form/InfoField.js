import { Component } from '../../../../LIGHTER';

class InfoField extends Component {
  constructor(data) {
    super(data);
    this.template = `
    <div class="form-elem form-elem--infoField infoField">
      <span class="label">${data.label}:</span>
      <span class="content">${data.content}</span>
    </div>
    `;
  }
}

export default InfoField;
