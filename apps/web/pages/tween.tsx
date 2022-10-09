import { InitFn, useThree, THREE } from 'rua-three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const glftLoader = new GLTFLoader();
const rotationY = 0.4;
const rotationX = 0.2;

const TweenPage = () => {
  const init: InitFn = ({
    scene,
    camera,
    controls,
    frameArea,
    isPerspectiveCamera,
    isOrbitControls,
    addRenderCallback,
    addWindowEvent,
  }) => {
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    if (isOrbitControls(controls)) {
      controls.enablePan = false;
      controls.enableRotate = false;
      controls.enableZoom = false;
    }

    const handleLoad = (gltf: GLTF) => {
      const root = gltf.scene;
      scene.add(root);

      const clock = new THREE.Clock();
      const mixer = new THREE.AnimationMixer(root);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
      addRenderCallback(() => {
        mixer.update(clock.getDelta());
      });

      const box = new THREE.Box3().setFromObject(root);
      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      if (isPerspectiveCamera(camera)) {
        frameArea(boxSize, boxSize, boxCenter, camera);
      }
      controls.target.copy(boxCenter);
      controls.update();

      const halfWidth = Math.floor(window.innerWidth / 2);
      const halfHeight = Math.floor(window.innerHeight / 2);

      const updateMousePosition = (e: MouseEvent | globalThis.TouchEvent) => {
        let x;
        let y;
        if (e instanceof MouseEvent) {
          x = e.clientX;
          y = e.clientY;
        } else {
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
        }

        // > 0 is right, < 0 is left
        const directionX = x - halfWidth;
        const directionY = y - halfHeight;

        // if (directionX > 0) root.rotation.y += 0.01;
        root.rotation.y = rotationY * (directionX / halfWidth);
        root.rotation.x = rotationX * (directionY / halfHeight);
      };

      addWindowEvent('mousemove', updateMousePosition, {
        passive: true,
      });
      addWindowEvent('touchmove', updateMousePosition, {
        passive: true,
      });
    };

    glftLoader.load('./models/cloud_station/scene.gltf', handleLoad);
  };
  const { ref } = useThree({
    init,
  });

  return (
    <>
      <canvas ref={ref}></canvas>
    </>
  );
};

export default TweenPage;
