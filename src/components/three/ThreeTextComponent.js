import './globalThree';

import Stats from "stats.js";
import loadFont from "load-bmfont";
import { vertexShader } from "./shaders/vertex";
import { isMobile } from "mobile-device-detect";
import { MSDFTextGeometry, MSDFTextMaterial } from "three-msdf-text-utils";
import { fragmentShader } from "./shaders/fragment";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export class Canvas {
  constructor(canvas) {
    this.scene = new THREE.Scene();
    // this.count = 8000;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
    });
    this.renderer.setSize(window.innerWidth / 1.2, window.innerHeight / 1.2);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setClearColor(0x0000ff);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);

    this.spotLight = new THREE.SpotLight(
      0xffffff,
      17,
      80,
      Math.PI * 0.25,
      0.2,
      3
    );

    this.spotLight.position.set(0, 10, 0);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.camera.near = 0.5;
    this.spotLight.shadow.camera.far = 40;

    this.scene.add(this.spotLight);

    const near = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(35, near, 0.1, 10000);
    this.camera.position.z = 200;

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    this.orbitControls.enableZoom = true;
    this.clock = new THREE.Clock();

    if (typeof window !== 'undefined') {
      const stats = new Stats();
      stats.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild(stats.dom);

      this.stats = stats;
    }

    this.init();
  }

  init() {
    Promise.all([
      this.handleLoadFontAtlas("/assets/horizon.png"),
      this.handleLoadFont("/assets/horizon.fnt"),
    ]).then(([atlas, font]) => {
      const geometry = new MSDFTextGeometry({
        text: "KESKEL",
        font: font,
        align: "center",
      });

      const material = new MSDFTextMaterial();
      material.uniforms.uMap.value = atlas;
      material.side = THREE.DoubleSide;

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.rotation.x = Math.PI;
      const scale = 2.0;
      this.mesh.position.x = (-geometry.layout.width / 2) * scale;
      this.mesh.position.y = -110.0;
      this.mesh.scale.set(scale, 9.0, scale);

      this.createRenderTarget();
    });

    this.animate();
    this.handleResize();
  }

  handleLoadFontAtlas(path) {
    const promise = new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        path,
        (texture) => {
          resolve(texture);
        },
        () => {
          console.log("progress");
        },
        (event) => {
          console.log("error", event);
          reject(event);
        }
      );
    });

    return promise;
  }

  handleLoadFont(path) {
    const promise = new Promise((resolve, reject) => {
      loadFont(path, (error, font) => {
        if (error) {
          console.log("error", error);
          reject(error);
        }
        resolve(font);
      });
    });

    return promise;
  }

  handleResize() {
    window.addEventListener("resize", () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.camera.aspect = sizes.width / sizes.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(sizes.width, sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  createRenderTarget() {
    if (!this.mesh) {
      return;
    }
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );

    this.renderTarget.texture.format = THREE.RGBAFormat;
    this.renderTarget.texture.minFilter = THREE.LinearFilter;
    this.renderTarget.texture.magFilter = THREE.LinearFilter;
    this.renderTarget.texture.generateMipmaps = false;

    this.renderTargetCamera = new THREE.PerspectiveCamera(
      75,
      isMobile
        ? window.innerHeight / window.innerWidth
        : window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.renderTargetCamera.position.z = 375;

    this.renderTargetScene = new THREE.Scene();
    this.renderTargetScene.background = new THREE.Color(0x000);

    this.renderTargetScene.add(this.mesh);
    this.createMesh();
  }

  createMesh() {
    if (!this.renderTarget) {
      return;
    }
    const geometry = new THREE.BoxGeometry(100, 10, 10, 30, 10, 30);

    this.renderTargetMaterial = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      uniforms: {
        u_time: new THREE.Uniform(0),
        u_texture: new THREE.Uniform(this.renderTarget.texture),
        u_lightPos: {
          value: new THREE.Vector3(0).copy(this.spotLight.position),
        },
        u_spotLightColor: {
          value: new THREE.Color(0xffffff),
        },
        u_lightIntensity: {
          value: 2.675,
        },
      },
      transparent: false,
      wireframe: false,
    });

    this.renderTargetMesh = new THREE.Mesh(geometry, this.renderTargetMaterial);

    this.renderTargetMesh.rotation.set(0, 0, 0);
    this.scene.add(this.renderTargetMesh);
  }

  animate() {
    if (this.stats) {
      this.stats.begin();
    }
    const elapsedTime = this.clock.getElapsedTime();

    this.orbitControls.update();

    if (
      this.renderTarget &&
      this.renderTargetScene &&
      this.renderTargetCamera &&
      this.renderTargetMesh
    ) {
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.renderTargetScene, this.renderTargetCamera);

      const meshMaterial = this.renderTargetMesh.material;

      meshMaterial.uniforms.u_time.value = elapsedTime;
      meshMaterial.uniformsNeedUpdate = true;
      this.renderer.setRenderTarget(null);
    }

    this.renderer.render(this.scene, this.camera);
    if (this.stats) {
      this.stats.end();
    }

    requestAnimationFrame(() => this.animate());
  }
}
