import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { InitFn, THREE, useThree } from 'rua-three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import useMousePosition from '../hooks/useMousePosition';

const gltfLoader = new GLTFLoader();
const rotationY = 0.4;
const rotationX = 0.18;

const Hover = () => {
  // mouse position
  const mousePosition = useMousePosition();
  const [innerSize, setInnerSize] = useState({
    wdith: 0,
    height: 0,
  });
  const getInnerSize = () => {
    setInnerSize({
      wdith: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    getInnerSize();
    window.addEventListener('resize', getInnerSize);

    return () => {
      window.removeEventListener('resize', getInnerSize);
    };
  }, []);

  // canvas wrapper
  const wrapper = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({
    width: 500,
    height: 300,
  });

  const setCanvasSize = () => {
    if (!wrapper.current) return;
    const width = wrapper.current.clientWidth;
    const height = wrapper.current.clientHeight;
    setSize({
      width,
      height,
    });
  };
  useEffect(() => {
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  const init: InitFn = ({
    scene,
    camera,
    controls,
    frameArea,
    isOrbitControls,
    isPerspectiveCamera,
  }) => {
    if (isOrbitControls(controls)) {
      controls.enablePan = false;
      controls.minDistance = 1;
      controls.minPolarAngle = Math.PI * 0.2;
      controls.maxPolarAngle = Math.PI * 0.5;
      controls.maxAzimuthAngle = Math.PI * 0.2;
      controls.enableRotate = false;
    }
    camera.position.set(0, 5, 5);

    const light = new THREE.SpotLight(0xffffff, 1.4, 100, 15);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    scene.add(light);

    const handleLoad = (gltf: GLTF) => {
      const root = gltf.scene;
      scene.add(root);

      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      light.target = root;
      light.position.set(0, 2, 4);
      light.rotateX(Math.PI * 0.4);
      isPerspectiveCamera(camera) &&
        frameArea(boxSize * 0.8, boxSize, boxCenter, camera);

      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();

      const halfWidth = Math.floor(window.innerWidth / 2);
      const halfHeight = Math.floor(window.innerHeight / 2);

      const updateMousePosition = (e: MouseEvent | globalThis.TouchEvent) => {
        console.log('test');
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

      window.addEventListener('mousemove', updateMousePosition, {
        passive: true,
      });
      window.addEventListener('touchmove', updateMousePosition, {
        passive: true,
      });
    };

    gltfLoader.load('/models/just_a_hungry_cat/scene.gltf', handleLoad);
  };
  const { ref } = useThree({
    init,
    ...size,
    alpha: true,
    // renderOnDemand: true,
  });
  // useEffect(() => {
  //   return () => {
  //     console.log(updateMousePosition, !updateMousePosition);
  //     if (!updateMousePosition) return;
  //     window.removeEventListener('mousemove', updateMousePosition);
  //     window.removeEventListener('touchmove', updateMousePosition);
  //   };
  // }, []);

  return (
    <>
      <div className="flex justify-end">
        <div>
          <div>{JSON.stringify(mousePosition)}</div>
          <div>
            X: {Math.floor(innerSize.wdith / 2)}, M:{' '}
            {mousePosition.x - Math.floor(innerSize.wdith / 2)}
          </div>
          <div>Y: {Math.floor(innerSize.height / 2)}</div>
        </div>
      </div>

      <div
        className={classNames(
          'absolute top-0 left-0',
          'w-1/2 translate-x-1/2 translate-y-1/2 h-1/2'
        )}
        ref={wrapper}
      >
        <canvas ref={ref}></canvas>
      </div>
    </>
  );
};

export default Hover;
