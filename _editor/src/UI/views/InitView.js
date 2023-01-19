import { APP_DEFAULTS } from '../../../../APP_CONFIG';
import { Component } from '../../../LIGHTER';
import { loadRecentProjectsApi } from '../../api/loadRecentProjects';
import { loadRecentScenesApi } from '../../api/loadRecentScenes';
import { saveProjectFolder, saveSceneId } from '../../sceneData/saveSession';
import { getSceneItem } from '../../sceneData/sceneItems';
import { printName, printProjectName } from '../../utils/utils';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import NewProject from '../dialogs/NewProject';
import styles from './InitView.module.scss';

class InitView extends Component {
  constructor(data) {
    super(data);
    this.startColId = this.id + '-start-col';
    this.recentProjectsColId = this.id + '-recent-projects-col';
    this.recentScenesColId = this.id + '-recent-scenes-col';
    this.allProjects = [];
    data.template = `<div class="${styles.initView}">
      <div class="${styles.wrapper}">
        <h1>${APP_DEFAULTS.APP_NAME}</h1>
        <div class="${styles.colWrapper}">
          <div id="${this.startColId}"></div>
          <div id="${this.recentProjectsColId}"></div>
          <div id="${this.recentScenesColId}"></div>
        </div>
      </div>
    </div>`;
  }

  paint = async () => {
    // Load all projects
    const loaderIcon = this.addChildDraw(
      new Spinner({
        id: this.id + '-loader-icon',
        class: ['center', 'middle'],
        width: 50,
      })
    );
    this.allProjects = await loadRecentProjectsApi({ amount: Infinity, returnErrors: true });
    loaderIcon.discard(true);
    if (this.allProjects.error) return;

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
        onClick: () => {
          getSceneItem('dialog').appear({
            component: NewProject,
            componentData: { allProjects: this.allProjects },
            title: 'Start new project',
          });
        },
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
    const amount = 5;
    const recentProjectsResponse = this.allProjects.filter((prj, index) => index < amount);
    return recentProjectsResponse.map((prj, index) =>
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
    const response = await loadRecentScenesApi({ amount: 5 });
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
