import { Component } from '../../../LIGHTER';
import { getProjectFolder } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import { DEFAULT_SCENE } from '../../utils/defaultSceneValues';
import { createNewScene } from '../../utils/toolsForFS';
import Button from '../common/Button';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';

class NewSceneDialog extends Component {
  constructor() {
    super({ id: 'new-scene-dialog', class: 'dialog-form' });
    this.formHasErrors = true;
    // Defalt values
    this.newSceneParams = {
      ...DEFAULT_SCENE,
      sceneId: '',
      name: '',
      projectFolder: getProjectFolder(),
    };
  }

  paint = async () => {
    const currentScenesData = await getSceneItem('getAllProjectScenes')();
    const currentScenes = currentScenesData.scenes;

    this.sceneIdInput = this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-id',
        label: 'Scene ID',
        curId: this.newSceneParams.id,
        newId: true,
        isSceneId: true,
        focus: true,
        onValidationErrors: () => (this.formHasErrors = true),
        onValidationSuccess: () => (this.formHasErrors = false),
        afterSuccessBlur: (id) => (this.newSceneParams.sceneId = id),
        additionalValidationFn: (value) => {
          const sceneFound = currentScenes.find((scene) => scene.sceneId === value);
          if (sceneFound) return { hasError: true, errorMsg: 'Scene ID is already in use' };
          return { hasError: false };
        },
      })
    );

    // Name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-name',
        label: 'Scene name',
        value: this.newSceneParams.name,
        changeFn: (e) => {
          this.newSceneParams.name = e.target.value;
        },
      })
    );

    const buttonDivId = 'new-cam-buttons-' + this.id;
    this.addChildDraw({ id: buttonDivId, class: 'buttons' });

    // Cancel button
    this.addChildDraw(
      new Button({
        id: 'new-cam-cancel-' + this.id,
        class: ['cancelButton'],
        attach: buttonDivId,
        text: 'Cancel',
        onClick: () => {
          getSceneItem('dialog').disappear();
        },
      })
    );

    // Create new scene button
    this.addChildDraw(
      new Button({
        id: 'new-cam-create-' + this.id,
        class: ['saveButton'],
        attach: buttonDivId,
        text: 'Create',
        onClick: () => {
          // Check if the scene Id is empty and show "Required" error
          if (!this.newSceneParams.sceneId) {
            const sceneIdError = this.sceneIdInput._validate(
              this.sceneIdInput.inputComponent.value
            );
            if (sceneIdError.hasError) this.sceneIdInput.inputComponent.error(sceneIdError);
          }
          if (this.formHasErrors) return;

          getSceneItem('dialog').disappear(() => {
            createNewScene(this.newSceneParams);
          });
        },
      })
    );
  };
}

export default NewSceneDialog;
