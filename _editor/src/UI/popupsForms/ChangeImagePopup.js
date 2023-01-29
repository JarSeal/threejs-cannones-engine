import { Component } from '../../../LIGHTER';
import Button from '../common/Button';
import FileUploader from '../common/form/FileUploader';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';
import TinyButtonGroup from '../common/TinyButtonGroup';
import SvgIcon from '../icons/svg-icon';

class ChangeImagePopup extends Component {
  constructor(data) {
    super(data);
    this.currentTab = 'new';
    this.newImageParams = {
      file: null,
      id: '',
      name: '',
    };
    this.formHasErrors = false;
  }

  paint = () => {
    if (this.currentTab === 'new') {
      this._newImage();
    } else if (this.currentTab === 'select') {
      this._selectImage();
    } else if (this.currentTab === 'selectLibrary') {
      this._selectFromLibrary();
    }
  };

  _newImage = () => {
    this.addChildDraw({
      id: this.id + '-main-title',
      tag: 'h5',
      text: 'Add new image',
    });
    this._getMenu();

    // Uploda image component here
    this.addChildDraw(
      new FileUploader({
        id: this.id + '-file-uploader',
        accept: ['png'],
        label: 'Upload image',
      })
    );

    // ID
    const imageIdInput = this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-image-id',
        label: 'Image ID',
        curId: this.newImageParams.id,
        newId: true,
        focus: true,
        onValidationErrors: () => (this.formHasErrors = true),
        onValidationSuccess: () => (this.formHasErrors = false),
        afterSuccessBlur: (id) => (this.newImageParams.id = id),
      })
    );

    // Name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-image-name',
        label: 'Image name',
        value: this.newImageParams.name,
        changeFn: (e) => {
          this.newImageParams.name = e.target.value;
        },
      })
    );

    // Confirm button (NEW IMAGE)
    this.addChildDraw(
      new Button({
        id: this.id + '-confirmBtn',
        class: 'confirmBtn',
        text: 'Confirm',
        onClick: () => {
          if (!this.newImageParams.id) {
            const texutureIdError = imageIdInput._validate(imageIdInput.inputComponent.value);
            if (texutureIdError.hasError) imageIdInput.inputComponent.error(texutureIdError);
          }
          if (this.formHasErrors) return;

          // @TODO: call create new image here
          const parentComp = this.data.imageInputComponent;
          if (parentComp && parentComp.update) parentComp.update(this.newImageParams.id);
          this.closePopup();
        },
      })
    );
  };

  _selectImage = () => {
    this.addChildDraw({
      id: this.id + '-main-title',
      tag: 'h5',
      text: 'Select image',
    });
    this._getMenu();
  };

  _selectFromLibrary = () => {
    this.addChildDraw({
      id: this.id + '-main-title',
      tag: 'h5',
      text: 'Select from library',
    });
    this._getMenu();
  };

  _getMenu = () => {
    this.addChildDraw(
      new TinyButtonGroup({
        id: this.id + '-menu-buttons',
        class: ['menuButtons'],
        prepend: true,
        buttons: [
          {
            icon: new SvgIcon({ id: this.id + '-add-button', icon: 'plus', width: 10, height: 10 }),
            selected: this.currentTab === 'new',
            onClick: () => {
              this.currentTab = 'new';
              this.reDrawSelf();
            },
          },
          {
            icon: new SvgIcon({
              id: this.id + '-select-button',
              icon: 'file',
              width: 8,
              height: 11,
            }),
            selected: this.currentTab === 'select',
            onClick: () => {
              this.currentTab = 'select';
              this.reDrawSelf();
            },
          },
          {
            icon: new SvgIcon({
              id: this.id + '-library-button',
              icon: 'bookOpen',
              width: 12,
              height: 10,
            }),
            selected: this.currentTab === 'selectLibrary',
            onClick: () => {
              this.currentTab = 'selectLibrary';
              this.reDrawSelf();
            },
          },
        ],
      })
    );
  };
}

export default ChangeImagePopup;
