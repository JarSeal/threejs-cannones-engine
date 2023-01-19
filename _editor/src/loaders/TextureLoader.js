import * as THREE from 'three';

import { APP_DEFAULTS } from '../../../APP_CONFIG';

class TextureLoader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.allTexturesLoaded = true;
    this.texturesLoading = false;
    this.loadingCounts = {
      loaded: 0,
      loading: 0,
    };
    this.textures = {};
  }

  loadTexture = (url) => {
    this.allTexturesLoaded = false;
    this.texturesLoading = true;
    this.loadingCounts.loading += 1;
    const returnObject = {
      url,
      texture: null,
      thisTextureLoading: true,
    };
    if (this.textures[url]) {
      returnObject.thisTextureLoading = false;
      returnObject.texture = this.textures[url];
      return returnObject;
    }
    returnObject.texture = this.textureLoader.load(
      url,
      (texture) => {
        // Texture loaded successfully
        returnObject.thisTextureLoading = false;
        this.loadingCounts.loading -= 1;
        this.loadingCounts.loaded += 1;
        if (this.loadingCounts.loading === 0) {
          this.texturesLoading = false;
          this.allTexturesLoaded = true;
        }
        this.textures[url] = texture;
      },
      undefined, // onProgress callback currently not supported
      (error) => {
        // Error
        console.error(`${APP_DEFAULTS.APP_NAME}: Could not load texture from url ${url}.`, error);
        returnObject.thisTextureLoading = false;
        this.loadingCounts.loading -= 1;
        if (this.loadingCounts.loading === 0) {
          this.texturesLoading = false;
          this.allTexturesLoaded = true;
        }
      }
    );
    return returnObject;
  };

  disposeTextureFromCache = (url) => {
    delete this.textures[url];
  };
}

export default TextureLoader;
