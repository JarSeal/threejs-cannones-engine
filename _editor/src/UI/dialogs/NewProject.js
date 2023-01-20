import { Component } from '../../../LIGHTER';
import { createProjectApi } from '../../api/createProject';
import { saveProjectFolder, saveSceneId } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import {
  DEFAULT_NEW_PROJECT_SCENE_ID,
  DEFAULT_NEW_PROJECT_SCENE_NAME,
  DEFAULT_PROJECT_VALUES,
  DEFAULT_SCENE,
} from '../../utils/defaultSceneValues';
import Button from '../common/Button';
import SimpleIDInput from '../common/form/SimpleIDInput';
import TextInput from '../common/form/TextInput';

class NewProject extends Component {
  constructor(data) {
    super({ ...data, id: 'new-project-dialog', class: 'dialog-form' });
    this.formErrors = [];
    // Defalt values
    this.newProjectParams = {
      ...DEFAULT_PROJECT_VALUES,
      projectFolder: '',
      sceneId: DEFAULT_NEW_PROJECT_SCENE_ID,
      sceneName: DEFAULT_NEW_PROJECT_SCENE_NAME,
    };
    this.prjFolderInput;
  }

  paint = () => {
    // Title for project data
    this.addChildDraw({
      id: this.id + '-title-prjid-name',
      tag: 'h4',
      class: 'sectionTitle',
      text: 'Project ID and name',
    });

    // Project folder
    this.prjFolderInput = this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-project-folder',
        label: 'Project ID (project folder name)',
        curId: this.newProjectParams.projectFolder,
        newId: true,
        focus: true,
        isProjectId: true,
        onValidationErrors: () => {
          if (!this.formErrors.includes('projectFolder')) {
            this.formErrors.push('projectFolder');
          }
        },
        onValidationSuccess: () => {
          this.formErrors = this.formErrors.filter((error) => error !== 'projectFolder');
        },
        afterSuccessBlur: (value) => (this.newProjectParams.projectFolder = value),
        additionalValidationFn: (value) => {
          for (let i = 0; i < this.data.allProjects.length; i++) {
            const prj = this.data.allProjects[i];
            if (value === prj.projectFolder) {
              return { hasError: true, errorMsg: 'Project ID / folder already exists' };
            }
          }
        },
      })
    );

    // Project name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-project-name',
        label: 'Project name',
        value: this.newProjectParams.name,
        changeFn: (e) => {
          this.newProjectParams.name = e.target.value;
        },
      })
    );

    // Title for main scene data
    this.addChildDraw({
      id: this.id + '-title-sceneid-name',
      tag: 'h4',
      class: 'sectionTitle',
      text: 'Main scene ID and name',
    });

    // Scene ID
    this.addChildDraw(
      new SimpleIDInput({
        id: this.id + '-scene-id',
        label: 'Main scene ID',
        curId: this.newProjectParams.sceneId,
        newId: true,
        isSceneId: true,
        onValidationErrors: () => {
          if (!this.formErrors.includes('sceneId')) {
            this.formErrors.push('sceneId');
          }
        },
        onValidationSuccess: () => {
          this.formErrors = this.formErrors.filter((error) => error !== 'sceneId');
        },
        afterSuccessBlur: (value) => (this.newProjectParams.sceneId = value),
      })
    );

    // Scene name
    this.addChildDraw(
      new TextInput({
        id: this.id + '-scene-name',
        label: 'Main scene name',
        value: this.newProjectParams.sceneName,
        changeFn: (e) => {
          this.newProjectParams.sceneName = e.target.value;
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

    // Create new project button
    this.addChildDraw(
      new Button({
        id: 'new-cam-create-' + this.id,
        class: ['saveButton'],
        attach: buttonDivId,
        text: 'Create',
        onClick: async () => {
          if (!this.newProjectParams.projectFolder) {
            const prjFolderError = this.prjFolderInput._validate(
              this.prjFolderInput.inputComponent.value
            );
            if (prjFolderError.hasError) this.prjFolderInput.inputComponent.error(prjFolderError);
          }
          if (this.formErrors.length) return;

          // Send the data to FS
          getSceneItem('dialog').lock();
          const params = {
            projectFolder: this.newProjectParams.projectFolder,
            name: this.newProjectParams.name,
            sceneId: this.newProjectParams.sceneId,
            sceneName: this.newProjectParams.sceneName,
            sceneParams: DEFAULT_SCENE,
          };
          const response = await createProjectApi(params);
          getSceneItem('dialog').unlock();
          if (response.projectCreated) {
            // Open the new project
            getSceneItem('dialog').disappear(() => {
              saveProjectFolder(this.newProjectParams.projectFolder);
              saveSceneId(this.newProjectParams.sceneId);
              getSceneItem('initView').discard(true);
              getSceneItem('root').initApp();
            });
          } else {
            getSceneItem('dialog').disappear();
          }
        },
      })
    );
  };
}

export default NewProject;
