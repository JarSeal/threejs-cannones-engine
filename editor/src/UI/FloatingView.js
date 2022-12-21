import { Component } from '../../LIGHTER';
import Button from './common/Button';

import styles from './FloatingView.module.scss';
import SvgIcon from './icons/svg-icon';

// - headerText = String
// - minified
// - iconData = { icon: string, width: integer/float } (SvgIcon)
// - closeButtonFn() = Function for when the close button is clicked
// - afterDragFn(newPos: {x:INT,y:INT}) = Callback function to call after the dragging of the view is finished
// - contentFn(this) = Function to call to render the content of floating view
// - position = Object with x and y values { x: integer, y: integer }
class FloatingView extends Component {
  constructor(data) {
    super(data);
    if (Array.isArray(data.class)) {
      data.class.push(styles.floatingView);
    } else if (typeof data.class === 'string') {
      data.class = [data.class, styles.floatingView];
    } else {
      data.class = [styles.floatingView];
    }
    if (data.minified) data.class.push('minified');
    if (data.position) {
      data.style = { left: (data.position?.x || 0) + 'px', top: (data.position?.y || 0) + 'px' };
    }
    this.headerComp = null;
    this.headerText = data.headerText;
    this.iconData = data.iconData;
    this.mouseDownOnHeader = false;
    this.mouseDownStartOffset = { x: 0, y: 0 };
    this.newPosToSave = { x: 0, y: 0 };

    this.closeButtonFn = data.closeButtonFn;
    this.afterDragFn = data.afterDragFn;
    this.afterMinifyFn = data.afterMinifyFn;
    this.contentFn = data.contentFn;
  }

  addListeners = () => {
    this.addListener({
      id: this.id + '-mouse-down-listener',
      target: this.headerComp.elem,
      type: 'mousedown',
      fn: (e) => {
        if (!this.mouseDownOnHeader) {
          const elemPos = this.elem.getBoundingClientRect();
          this.mouseDownStartOffset = { x: e.clientX - elemPos.left, y: e.clientY - elemPos.top };
        }
        this.mouseDownOnHeader = true;
        this.elem.classList.add('dragging');
      },
    });
    this.addListener({
      id: this.id + '-mouse-up-listener',
      target: window,
      type: 'mouseup',
      fn: () => {
        if (!this.mouseDownOnHeader) return;
        this.mouseDownOnHeader = false;
        this.elem.classList.remove('dragging');
        if (this.afterDragFn) this.afterDragFn(this.newPosToSave);
      },
    });
    this.addListener({
      id: this.id + '-mouse-move-listener',
      target: window,
      type: 'mousemove',
      fn: (e) => {
        if (!this.mouseDownOnHeader) return;
        const pos = {
          x: e.clientX - this.mouseDownStartOffset.x,
          y: e.clientY - this.mouseDownStartOffset.y,
        };
        this.elem.style.cssText = `left: ${pos.x}px; top: ${pos.y}px`;
        this.newPosToSave = pos;
      },
    });
  };

  paint = () => {
    // Header bar
    this.headerComp = this.addChildDraw({
      id: this.id + '-main-header',
      class: [styles.floatingViewHeader],
      text: this.headerText,
    });
    if (this.iconData?.icon) {
      this.addChildDraw(
        new SvgIcon({
          ...this.iconData,
          id: this.id + '-main-header-icon',
          class: [styles.floatingViewHeaderIcon],
        })
      );
    }
    this.addChildDraw(
      new Button({
        id: this.id + '-main-header-minify-btn',
        class: [styles.floatingHeaderBtn, styles.floatingHeaderMinifyBtn],
        onClick: () => {
          if (this.elem.classList.contains('minified')) {
            this.elem.classList.remove('minified');
            this.afterMinifyFn(true);
          } else {
            this.elem.classList.add('minified');
            this.afterMinifyFn(false);
          }
        },
      })
    );
    this.addChildDraw(
      new Button({
        id: this.id + '-main-header-close-btn',
        class: [styles.floatingHeaderBtn, styles.floatingHeaderCloseBtn],
        icon: new SvgIcon({
          id: this.id + '-main-header-close-btn-icon',
          icon: 'xMark',
          width: 16,
        }),
        onClick: this.closeButtonFn,
      })
    );

    const contentWrapper = this.addChildDraw({
      id: this.id + '-floating-view-content',
      class: [styles.floatingContentWrapper],
    });
    if (this.contentFn) this.contentFn(contentWrapper);
  };
}

export default FloatingView;
