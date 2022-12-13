/**
 * @author mrdoob / http://mrdoob.com/ (original author)
 * @author JarSeal / (modifier)
 */

class SmallStats {
  constructor(options) {
    this.mode = 0;
    const colors = {
      FPS: { fg: '#0ff', bg: '#002' },
      MS: { fg: '#0f0', bg: '#020' },
      MB: { fg: '#f08', bg: '#201' },
    };
    if (options) {
      if (options.FPS && options.FPS.fg) colors.FPS.fg = options.FPS.fg;
      if (options.FPS && options.FPS.bg) colors.FPS.bg = options.FPS.bg;
      if (options.MS && options.MS.fg) colors.MS.fg = options.MS.fg;
      if (options.MS && options.MS.bg) colors.MS.bg = options.MS.bg;
      if (options.MB && options.MB.fg) colors.MB.fg = options.MB.fg;
      if (options.MB && options.MB.bg) colors.MB.bg = options.MB.bg;
    }
    this.container = document.createElement('div');
    this.domElement = this.container;
    this.container.style.cssText =
      'position:fixed;bottom:0;left:0.1rem;opacity:0.8;cursor:pointer;z-index:1000';
    this.container.addEventListener('click', this.containerClick, false);

    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;

    this.fpsPanel = this.addPanel(new Panel('FPS', colors.FPS.fg, colors.FPS.bg));
    this.msPanel = this.addPanel(new Panel('MS', colors.MS.fg, colors.MS.bg));

    this.memPanel = null;
    if (performance && performance.memory) {
      this.memPanel = this.addPanel(new Panel('MB', colors.MB.fg, colors.MB.bg));
    }

    this.showPanel(0);
  }

  containerClick = (event) => {
    event.preventDefault();
    this.showPanel(++this.mode % this.container.children.length);
  };

  addPanel = (panel) => {
    this.container.appendChild(panel.dom);
    return panel;
  };

  showPanel = (id) => {
    for (let i = 0; i < this.container.children.length; i++) {
      this.container.children[i].style.display = i === id ? 'block' : 'none';
    }
    this.mode = id;
  };
  setMode = this.showPanel;

  begin = () => (this.beginTime = (performance || Date).now());

  end = () => {
    this.frames++;
    let time = (performance || Date).now();
    this.msPanel.update(time - this.beginTime, 200);
    if (time >= this.prevTime + 1000) {
      this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);
      this.prevTime = time;
      this.frames = 0;
      if (this.memPanel) {
        let memory = performance.memory;
        this.memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
      }
    }
    return time;
  };

  update = () => {
    this.beginTime = this.end();
  };
}

class Panel {
  constructor(name, fg, bg) {
    this.min = Infinity;
    this.max = 0;
    const PR = Math.round(window.devicePixelRatio || 1);
    this.PR = PR;
    this.name = name;
    this.fg = fg;
    this.bg = bg;

    const conf = {
      WIDTH: 80 * PR,
      HEIGHT: 48 * PR,
      TEXT_X: 3 * PR,
      TEXT_Y: 2 * PR,
      GRAPH_X: 3 * PR,
      GRAPH_Y: 15 * PR,
      GRAPH_WIDTH: 74 * PR,
      GRAPH_HEIGHT: 30 * PR,
    };
    this.conf = conf;

    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    this.dom = canvas;
    canvas.width = conf.WIDTH;
    canvas.height = conf.HEIGHT;
    canvas.style.cssText = 'width:80px;height:48px';

    const context = canvas.getContext('2d');
    this.context = context;
    context.font = '400 ' + 10 * PR + 'px FredokaOne,sans-serif'; // @TODO: Add font to options
    context.textBaseline = 'top';

    context.fillStyle = bg;
    context.fillRect(0, 0, conf.WIDTH, conf.HEIGHT);

    context.fillStyle = fg;
    context.fillText(name, conf.TEXT_X, conf.TEXT_Y);
    context.fillRect(conf.GRAPH_X, conf.GRAPH_Y, conf.GRAPH_WIDTH, conf.GRAPH_HEIGHT);

    context.fillStyle = bg;
    context.globalAlpha = 0.9;
    context.fillRect(conf.GRAPH_X, conf.GRAPH_Y, conf.GRAPH_WIDTH, conf.GRAPH_HEIGHT);
  }

  update = (value, maxValue) => {
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    const context = this.context;
    const { WIDTH, GRAPH_X, GRAPH_Y, TEXT_X, TEXT_Y, GRAPH_WIDTH, GRAPH_HEIGHT } = this.conf;

    context.fillStyle = this.bg;
    context.globalAlpha = 1;
    context.fillRect(0, 0, WIDTH, GRAPH_Y);
    context.fillStyle = this.fg;
    context.fillText(
      `${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(this.max)})`,
      TEXT_X,
      TEXT_Y
    );

    context.drawImage(
      this.canvas,
      GRAPH_X + this.PR,
      GRAPH_Y,
      GRAPH_WIDTH - this.PR,
      GRAPH_HEIGHT,
      GRAPH_X,
      GRAPH_Y,
      GRAPH_WIDTH - this.PR,
      GRAPH_HEIGHT
    );

    context.fillRect(GRAPH_X + GRAPH_WIDTH - this.PR, GRAPH_Y, this.PR, GRAPH_HEIGHT);

    context.fillStyle = this.bg;
    context.globalAlpha = 0.9;
    context.fillRect(
      GRAPH_X + GRAPH_WIDTH - this.PR,
      GRAPH_Y,
      this.PR,
      Math.round((1 - value / maxValue) * GRAPH_HEIGHT)
    );
  };
}

export default SmallStats;
