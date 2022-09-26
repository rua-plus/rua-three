import { useThree } from 'rua-three';
import { InitFn } from 'rua-three/lib/esm/hooks/useThree';

const init: InitFn = () => {};

export default function Web() {
  const { ref } = useThree({ init });

  return <canvas ref={ref}></canvas>;
}
