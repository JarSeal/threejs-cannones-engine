import * as THREE from 'three';

import { APP_DEFAULTS } from '../../../APP_CONFIG';
import { getSceneItem } from '../sceneData/sceneItems';

class TextureLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.allTexturesLoaded = true;
    this.texturesLoading = false;
    this.loadingCounts = {
      loaded: 0,
      loading: 0,
      loadingUrls: [],
    };
    this.textures = {};
  }

  loadTexture = (url, forceNew, onLoad) => {
    this.allTexturesLoaded = false;
    this.texturesLoading = true;
    this.loadingCounts.loading += 1;
    this.loadingCounts.loadingUrls.push(url);
    const returnObject = {
      url,
      texture: null,
      thisTextureLoading: true,
    };
    if (this.textures[url] && !forceNew) {
      returnObject.thisTextureLoading = false;
      returnObject.texture = this.textures[url];
      return returnObject;
    }
    returnObject.texture = this.textureLoader.load(
      url,
      (texture) => {
        // Texture loaded successfully
        returnObject.thisTextureLoading = false;
        texture.needsUpdate = true;
        this.loadingCounts.loading -= 1;
        this.loadingCounts.loaded += 1;
        this.loadingCounts.loadingUrls = this.loadingCounts.loadingUrls.filter((u) => u !== url);
        if (this.loadingCounts.loading === 0) {
          this.texturesLoading = false;
          this.allTexturesLoaded = true;
        }
        this.textures[url] = texture;
      },
      undefined, // onProgress callback currently not supported
      (error) => {
        // Error
        const errorMsg = `${APP_DEFAULTS.APP_NAME}: Could not load texture from url "${url}".`;
        console.error(errorMsg, error);
        getSceneItem('toaster').addToast({
          type: 'error',
          delay: 0,
          content: errorMsg,
        });
        returnObject.thisTextureLoading = false;
        this.loadingCounts.loading -= 1;
        this.loadingCounts.loadingUrls = this.loadingCounts.loadingUrls.filter((u) => u !== url);
        if (this.loadingCounts.loading === 0) {
          this.texturesLoading = false;
          this.allTexturesLoaded = true;
        }
        this.disposeTextureFromCache(url);
      }
    );
    return returnObject;
  };

  disposeTextureFromCache = (url) => {
    if (this.textures[url]) delete this.textures[url];
  };
}

export default TextureLoader;
