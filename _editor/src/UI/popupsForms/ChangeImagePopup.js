import { APP_DEFAULTS } from '../../../../APP_CONFIG';
import { Component } from '../../../LIGHTER';
import { getSceneItem } from '../../sceneData/sceneItems';
import { getSceneParam, setSceneParam } from '../../sceneData/sceneParams';
import { uploadImage } from '../../utils/toolsForFS';
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
      fileName: null,
      fileSize: null,
      id: '',
      name: '',
    };
    this.imageIdMissing = true;
    this.imageFileMissing = true;
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
    const fileUploader = this.addChildDraw(
      new FileUploader({
        id: this.id + '-file-uploader',
        accept: '.png, .jpg',
        label: 'Import image file',
        required: true,
        onValidationErrors: () => (this.imageFileMissing = true),
        onValidationSuccess: () => (this.imageFileMissing = false),
        onChange: (file) => {
          if (!file) return;
          this.newImageParams.file = file;
          this.newImageParams.fileName = file.name;
          this.newImageParams.fileSize = file.size;
        },
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
        onValidationErrors: () => (this.imageIdMissing = true),
        onValidationSuccess: () => (this.imageIdMissing = false),
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
        onClick: async () => {
          if (this.imageIdMissing) {
            const imageIdError = imageIdInput._validate(imageIdInput.inputComponent.value);
            if (imageIdError.hasError) imageIdInput.inputComponent.error(imageIdError);
          }
          if (this.imageFileMissing) fileUploader.validate();
          if (this.imageIdMissing || this.imageFileMissing) return;

          const response = await uploadImage(this.newImageParams);
          if (response?.imageUploaded && response?.imageParams) {
            const newImageParams = [...getSceneParam('images'), response.imageParams];
            setSceneParam('images', newImageParams);
            const parentComp = this.data.imageInputComponent;
            if (parentComp && parentComp.update) parentComp.update(this.newImageParams.id);
            this.closePopup();
          } else {
            getSceneItem('toaster').addToast({
              type: 'error',
              delay: 0,
              content: `${APP_DEFAULTS.APP_NAME}: Image upload response or response imageParams is missing.`,
            });
          }
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
