import { Component } from '../../../LIGHTER';
import { loadRecentProjectsApi } from '../../api/loadRecentProjects';
import { loadRecentScenesApi } from '../../api/loadRecentScenes';
import { saveProjectFolder, saveSceneId } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import { printName, printProjectName } from '../../utils/utils';
import Button from '../common/Button';
import styles from './InitView.module.scss';

class InitView extends Component {
  constructor(data) {
    super(data);
    this.startColId = this.id + '-start-col';
    this.recentProjectsColId = this.id + '-recent-projects-col';
    this.recentScenesColId = this.id + '-recent-scenes-col';
    data.template = `<div class="${styles.initView}">
      <div class="${styles.wrapper}">
        <h1>ForThree.js</h1>
        <div class="${styles.colWrapper}">
          <div id="${this.startColId}"></div>
          <div id="${this.recentProjectsColId}"></div>
          <div id="${this.recentScenesColId}"></div>
        </div>
      </div>
    </div>`;
  }

  paint = async () => {
    // Column headings
    this.addChildDraw(
      new Component({
        id: this.id + '-start-col-heading',
        tag: 'h2',
        text: 'Start',
        attach: this.startColId,
      })
    );
    this.addChildDraw(
      new Component({
        id: this.id + '-recent-projects-col-heading',
        tag: 'h2',
        text: 'Recent projects',
        attach: this.recentProjectsColId,
      })
    );
    this.addChildDraw(
      new Component({
        id: this.id + '-recent-scenes-col-heading',
        tag: 'h2',
        text: 'Recent scenes',
        attach: this.recentScenesColId,
      })
    );

    // Start column buttons
    this.addChildDraw(
      new Button({
        id: this.id + '-start-new-project-btn',
        text: 'Start a new project...',
        attach: this.startColId,
        onClick: () => console.log('CLICK start a new project'),
      })
    );
    this.addChildDraw(
      new Button({
        id: this.id + '-open-project-btn',
        text: 'Open a project...',
        attach: this.startColId,
        onClick: () => console.log('CLICK open a project'),
      })
    );

    // Recent projects buttons
    const recentProjectsButtons = await this._getRecentProjectsButtons();
    recentProjectsButtons.forEach((btn) => btn.draw());

    // Recent projects buttons
    const recentScenesButtons = await this._getRecentScenesButtons();
    recentScenesButtons.forEach((btn) => btn.draw());
  };

  _getRecentProjectsButtons = async () => {
    // Get recent projects from FS
    const response = await loadRecentProjectsApi({ amount: 5 });
    if (response.error) {
      console.error(response?.errorMsg);
      getSceneItem('toaster').addToast({
        type: 'error',
        delay: 8000,
        content: response?.errorMsg,
      });
      return [];
    }
    return response.map((prj, index) =>
      this.addChild(
        new Button({
          id: this.id + '-recent-project-btn-' + index,
          text: printProjectName(prj),
          attach: this.recentProjectsColId,
          onClick: () => {
            saveProjectFolder(prj.projectFolder);
            saveSceneId(prj.rootScene);
            getSceneItem('initView').discard(true);
            getSceneItem('root').initApp();
          },
        })
      )
    );
  };

  _getRecentScenesButtons = async () => {
    const recentScenes = [
      {
        projectFolder: 'jotain1',
        projectName: 'Mun projekti',
        sceneId: 'munScene1',
        sceneName: '',
      },
      {
        projectFolder: 'devProject1',
        projectName: '',
        sceneId: 'munScene1',
        sceneName: 'Testi scene',
      },
    ];
    const response = await loadRecentScenesApi({ amount: 5 });
    if (response.error) {
      console.error(response?.errorMsg);
      getSceneItem('toaster').addToast({
        type: 'error',
        delay: 8000,
        content: response?.errorMsg,
      });
      return [];
    }
    return response.map((scene, index) =>
      this.addChild(
        new Button({
          id: this.id + '-recent-scene-btn-' + index,
          html: `${printName(scene)} <span>${printProjectName(scene)}</span>`,
          attach: this.recentScenesColId,
          onClick: () => {
            saveProjectFolder(scene.projectFolder);
            saveSceneId(scene.sceneId);
            getSceneItem('initView').discard(true);
            getSceneItem('root').initApp();
          },
        })
      )
    );
  };
}

export default InitView;
