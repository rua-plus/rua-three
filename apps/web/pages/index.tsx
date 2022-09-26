import { useThree, THREE, InitFn } from 'rua-three';

const init: InitFn = ({ scene, camera, addRenderCallback }) => {
  scene.add(new THREE.AmbientLight('#fff', 0.6));
  camera.position.set(0, 5, 5);

  const material = new THREE.MeshStandardMaterial({ color: '#ff0000' });
  const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
  const cube = new THREE.Mesh(cubeGeo, material);
  scene.add(cube);

  const update = (time: number) => {
    cube.rotation.y = time;
  };
  addRenderCallback(update);
};

export default function Web() {
  const { ref } = useThree({ init });

  return <canvas ref={ref}></canvas>;
}
