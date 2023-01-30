import { Component } from '../../../../LIGHTER';
import { getFileSizeString } from '../../../utils/utils';
import Button from '../Button';

// Attributes:
// - label = string
// - accept = string for accept attribute
// - required = boolean
// - onChange = function to call when the file selected changes
// - onValidationErrors = function to call when the validation fails
// - onValidationSuccess = function to call when the validation passes
class FileUploader extends Component {
  constructor(data) {
    super(data);
    this.fileNameId = this.id + '-file-name';
    this.fileSizeId = this.id + '-file-size';
    this.fileInputElemId = this.id + '-file-input-elem';
    this.errorsElemId = this.id + '-errors-elem';
    this.warningsElemId = this.id + '-warnings-elem';
    this.required = data.required;
    this.file = null;
    this.fileName = null;
    this.fileSize = null;
    this.hasErrors = false;
    this.template = `
      <div class="form-elem form-elem--fileUploader fileUploader ${
        this.image ? 'hasFile' : 'noFile'
      }">
        <label>
          <span class="form-elem__label">${data.label}</span>
        </label>
        <span class="fileName" id="${this.fileNameId}"></span>
        <span class="fileSize" id="${this.fileSizeId}"></span>
        <input
          class="fileInputElem"
          id="${this.fileInputElemId}"
          type="file"
          ${data.accept ? `accept="${data.accept}"` : ''}
        />
        <div class="errorMsg" id="${this.errorsElemId}"></div>
        <div class="warningMsg" id="${this.warningsElemId}"></div>
      </div>
    `;
    this.onChange = data.onChange;
    this.onValidationErrors = data.onValidationErrors;
    this.onValidationSuccess = data.onValidationSuccess;
  }

  addListeners = () => {
    this.addListener({
      id: this.id + '-file-input-elem-listener',
      target: document.getElementById(this.fileInputElemId),
      type: 'change',
      fn: (e) => {
        const file = e.target.files[0];
        const fileNameElem = document.getElementById(this.fileNameId);
        const fileSizeElem = document.getElementById(this.fileSizeId);
        if (file) {
          this.file = file;
          this.fileName = file.name;
          this.fileSize = file.size;
          fileNameElem.textContent = file.name;
          fileSizeElem.textContent = getFileSizeString(file.size);
        } else {
          this.file = null;
          this.fileName = null;
          this.fileSize = null;
          fileNameElem.textContent = '';
          fileSizeElem.textContent = '';
        }
        this.validate();
        if (this.onChange) this.onChange(file);
      },
    });
  };

  paint = () => {
    this.addChildDraw(
      new Button({
        id: this.id + '-choose-file-btn',
        class: 'chooseFileBtn',
        onClick: () => {
          document.getElementById(this.fileInputElemId).click();
        },
      })
    );
  };

  validate = () => {
    if (!this.file && this.required) {
      this.setError('Required');
      if (this.onValidationErrors) this.onValidationErrors();
    } else {
      this.removeError();
      if (this.onValidationSuccess) this.onValidationSuccess();
    }
  };

  setError = (msg) => {
    this.removeWarning();
    this.hasErrors = true;
    this.elem.classList.add('error');
    document.getElementById(this.errorsElemId).textContent = msg;
  };

  removeError = () => {
    this.hasErrors = false;
    this.elem.classList.remove('error');
    document.getElementById(this.errorsElemId).textContent = '';
  };

  setWarning = (msg) => {
    this.removeError();
    this.elem.classList.add('warning');
    document.getElementById(this.warningsElemId).textContent = msg;
  };

  removeWarning = () => {
    this.elem.classList.remove('warning');
    document.getElementById(this.warningsElemId).textContent = '';
  };
}

export default FileUploader;
