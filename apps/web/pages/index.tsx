import { useState } from 'react';
import {
  getCanvasRelativePosition,
  InitFn,
  MousePicker,
  THREE,
  useThree,
} from 'rua-three';

export default function Web() {
  const [size, setSize] = useState({
    width: 500,
    height: 300,
  });

  const init: InitFn = ({ scene, camera, addRenderCallback }) => {
    const picker = new MousePicker();
    const pickPosition = {
      x: -Infinity,
      y: -Infinity,
    };
    let lastObject: THREE.Object3D | null = null;
    let lastColor: number | null = null;

    const getTouches = (e: TouchEvent) => {
      e.preventDefault();
      setPickPosition(e.touches[0]);
    };
    const setPickPosition = (e: MouseEvent | Touch) => {
      if (!ref.current) return;
      const canvas = ref.current;
      if (!(canvas instanceof HTMLCanvasElement)) return;
      const pos = getCanvasRelativePosition(e, canvas);
      pickPosition.x = (pos.x / canvas.width) * 2 - 1;
      pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
    };
    const clearPickPosition = () => {
      pickPosition.x = -Infinity;
      pickPosition.y = -Infinity;
    };
    const pickColor = (time: DOMHighResTimeStamp) => {
      if (lastObject && lastColor != null) {
        if (!(lastObject instanceof THREE.Mesh)) return;
        if (!picker.checkMaterial(lastObject.material)) return;
        lastObject.material.emissive.setHex(lastColor);
        lastObject = null;
        lastColor = null;
      }
      lastObject = picker.pick(pickPosition, scene, camera);
      if (!lastObject) return;
      if (!(lastObject instanceof THREE.Mesh)) return;
      if (!picker.checkMaterial(lastObject.material)) return;
      lastColor = lastObject.material.emissive.getHex();
      lastObject.material.emissive.setHex(
        (time * 8) % 2 > 1 ? 0xffff00 : 0xff0000
      );
    };

    scene.add(new THREE.AmbientLight('#fff', 0.6));
    camera.position.set(0, 5, 5);

    const material = new THREE.MeshStandardMaterial({ color: '#ff0000' });
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(cubeGeo, material);
    scene.add(cube);

    const update = (time: number) => {
      cube.rotation.y = time;
      pickColor(time);
    };
    addRenderCallback(update);

    ref.current?.addEventListener('mousemove', setPickPosition);
    ref.current?.addEventListener('mouseout', clearPickPosition);
    ref.current?.addEventListener('mouseleve', clearPickPosition);
    ref.current?.addEventListener('touchstart', getTouches, { passive: false });
    ref.current?.addEventListener('touchmove', getTouches);
    ref.current?.addEventListener('touchend', clearPickPosition);

    return () => {
      console.log('calling cleanup');
      ref.current?.removeEventListener('mousemove', setPickPosition);
      ref.current?.removeEventListener('mouseout', clearPickPosition);
      ref.current?.removeEventListener('mouseleve', clearPickPosition);
      ref.current?.removeEventListener('touchstart', getTouches);
      ref.current?.removeEventListener('touchmove', getTouches);
      ref.current?.removeEventListener('touchend', clearPickPosition);
    };
  };

  const { ref } = useThree({ init, ...size });

  return (
    <>
      <canvas ref={ref}></canvas>;
      <div>
        <button
          onClick={() => setSize((d) => ({ ...d, width: d.width + 100 }))}
        >
          Add width
        </button>
        <button
          onClick={() => setSize((d) => ({ ...d, height: d.height + 100 }))}
        >
          Add height
        </button>
      </div>
    </>
  );
}
