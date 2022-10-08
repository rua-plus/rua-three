import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import ResourceTracker, { Disposable } from './ResourceTracker';
import Stats from 'stats.js';

class SceneWithTracker extends THREE.Scene {
  constructor(private tracker: ResourceTracker<Disposable>) {
    super();
  }

  add(...object: THREE.Object3D<THREE.Event>[]): this {
    super.add(...object);
    this.tracker.track(...object);
    return this;
  }
}

const cameraCreator = {
  PerspectiveCamera: (width: number, height: number) =>
    new THREE.PerspectiveCamera(50, width / height, 0.1, 1000),
  OrthographicCamera: (width: number, height: number) =>
    new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    ),
};

const controlsCreator = {
  OrbitControls: (
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    canvas: HTMLCanvasElement | undefined
  ) => new OrbitControls(camera, canvas),
  TrackballControls: (
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
    canvas: HTMLCanvasElement | undefined
  ) => new TrackballControls(camera, canvas),
};

export type ThreeProps = {
  rotateInversion?: boolean;
  antialias?: boolean;
  renderOnDemand?: boolean;
  width?: number;
  height?: number;
  alpha?: boolean;
  canvas?: HTMLCanvasElement | null;

  camera?: 'PerspectiveCamera' | 'OrthographicCamera';
  controls?: 'OrbitControls' | 'TrackballControls';
};

export const defaultProps: Partial<ThreeProps> = {
  rotateInversion: false,
  antialias: true,
  renderOnDemand: false,
  alpha: false,
};

class RUAThree {
  tracker = new ResourceTracker();

  scene = new SceneWithTracker(this.tracker);

  /**
   * Default camera is PerspectiveCamera
   */
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  /**
   * Deafult controls is OrbitControls
   */
  controls: OrbitControls | TrackballControls;

  renderer: THREE.WebGLRenderer;
  stats: Stats | null = null;

  private width: number | null | undefined = null;
  private height: number | null | undefined = null;
  protected cameraWidth = window.innerWidth;
  protected cameraHeight = window.innerHeight;

  constructor({
    rotateInversion,
    antialias,
    renderOnDemand,
    width,
    height,
    alpha,
    canvas,
    camera,
    controls,
  }: ThreeProps) {
    this.width = width;
    this.height = height;
    this.cameraWidth = this.width ?? window.innerWidth;
    this.cameraHeight = this.height ?? window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
      canvas: canvas ?? undefined,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.cameraWidth, this.cameraHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.camera = camera
      ? cameraCreator[camera](this.cameraWidth, this.cameraHeight)
      : cameraCreator.PerspectiveCamera(this.cameraWidth, this.cameraHeight);

    this.controls = controls
      ? controlsCreator[controls](this.camera, canvas ?? undefined)
      : controlsCreator.OrbitControls(this.camera, canvas ?? undefined);

    this.controls instanceof OrbitControls &&
      (this.controls.enableDamping = true);
    // Set controls rotate inversion must be in constructor.
    if (rotateInversion) this.controls.rotateSpeed *= -1;
    this.controls.update();

    this.renderOnDemand = renderOnDemand ?? true;

    this.render = this.render.bind(this);
    this.requestRender = this.requestRender.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.addRenderCallback = this.addRenderCallback.bind(this);
    this.frameArea = this.frameArea.bind(this);
    this.clean = this.clean.bind(this);
    this.addWindowEvent = this.addWindowEvent.bind(this);

    if (this.renderOnDemand) {
      this.controls.addEventListener('change', this.requestRender);
      this.requestRender();
    } else {
      requestAnimationFrame(this.render);
    }

    window.addEventListener('resize', this.onWindowResize);

    if (process.env.NODE_ENV === 'development') {
      this.tracker.debug = true;

      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }
  }

  private renderQueue: ((time: DOMHighResTimeStamp) => void)[] = [];
  private renderOnDemand = true;
  private renderRequested = false;

  private time: DOMHighResTimeStamp = 0;
  private render(time: DOMHighResTimeStamp) {
    this.renderRequested = false;
    this.time = time *= 0.001;
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    this.renderQueue.map((cb) => cb(this.time));
    this.stats && this.stats.update();

    !this.renderOnDemand && requestAnimationFrame(this.render);
  }

  private requestRender() {
    if (this.renderRequested) return;
    this.renderRequested = true;
    requestAnimationFrame(this.render);
  }

  private onWindowResize() {
    this.setSize();
    this.render(this.time);
  }

  /**
   * Add render funtion into requestAnimationFrame.
   *
   * callback time is `DOMHighResTimeStamp * 0.001`
   * @param cb `(time: number) => void`
   */
  addRenderCallback(cb: (time: number) => void) {
    this.renderQueue.push(cb);
  }

  private setSize() {
    this.cameraWidth = this.width ?? window.innerWidth;
    this.cameraHeight = this.height ?? window.innerHeight;
    this.camera instanceof THREE.PerspectiveCamera &&
      (this.camera.aspect = this.cameraWidth / this.cameraHeight);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.cameraWidth, this.cameraHeight);
    this.renderOnDemand && this.render(this.time);
  }

  /**
   * Set size to canvas.
   * It will be override params.
   * @param width
   * @param height
   */
  setCanvasSize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.setSize();
  }

  frameArea(
    sizeToFitOnScreen: number,
    boxSize: number,
    boxCenter: THREE.Vector3,
    camera: THREE.PerspectiveCamera
  ) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    // compute a unit vector that points in the direction the camera is now
    // in the xz plane from the center of the box
    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    // move the camera to a position distance units way from the center
    // in whatever direction the camera was from the center already
    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    // pick some near and far values for the frustum that
    // will contain the box.
    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    // point the camera to look at the center of the box
    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  /**
   * Event listeners on window.
   */
  private windowEventList: {
    type: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }[] = [];

  /**
   * Add event listener on window.
   * The listener will remove on clean function.
   * @param type
   * @param listener
   * @param options
   */
  addWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ) {
    window.addEventListener(type, listener, options);
    this.windowEventList.push({ type, listener, options });
  }

  clean() {
    this.tracker.dispose();
    this.scene.clear();
    window.removeEventListener('resize', this.onWindowResize);
    // Remove all window listener
    this.windowEventList.forEach((item) =>
      window.removeEventListener(item.type, item.listener, item.options)
    );
    this.stats?.dom.remove();
  }

  isOrbitControls(
    controls: OrbitControls | TrackballControls
  ): controls is OrbitControls {
    return controls instanceof OrbitControls;
  }

  isTrackballControls(
    controls: OrbitControls | TrackballControls
  ): controls is TrackballControls {
    return controls instanceof TrackballControls;
  }

  isPerspectiveCamera(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  ): camera is THREE.PerspectiveCamera {
    return camera instanceof THREE.PerspectiveCamera;
  }

  isOrthographicCamera(
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera
  ): camera is THREE.OrthographicCamera {
    return camera instanceof THREE.OrthographicCamera;
  }
}

export default RUAThree;
export { THREE };
