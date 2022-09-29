import { useState } from 'react';
import {
  useThree,
  THREE,
  InitFn,
  MousePicker,
  getCanvasRelativePosition,
} from 'rua-three';

export default function Web() {
  const init: InitFn = ({ scene, camera, addRenderCallback }) => {
    const picker = new MousePicker();
    const pickPosition = {
      x: -Infinity,
      y: -Infinity,
    };
    let lastObject: THREE.Object3D | null = null;
    let lastColor: number | null = null;
    const setPickPosition = (e: MouseEvent) => {
      if (!ref.current) return;
      const canvas = ref.current;
      if (!(canvas instanceof HTMLCanvasElement)) return;
      const pos = getCanvasRelativePosition(e, canvas);
      pickPosition.x = (pos.x / canvas.width) * 2 - 1;
      pickPosition.y = (pos.y / canvas.height) * -2 + 1; // note we flip Y
    };
    const clearPickPosition = () => {
      // 对于触屏，不像鼠标总是能有一个位置坐标，
      // 如果用户不在触摸屏幕，我们希望停止拾取操作。
      // 因此，我们选取一个特别的值，表明什么都没选中
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
  };

  const { ref } = useThree({ init, width: 500, height: 300 });

  return <canvas ref={ref}></canvas>;
}
