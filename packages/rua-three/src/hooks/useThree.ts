import RUAThree, { defaultProps, ThreeProps } from '../three';
import { useEffect, useRef } from 'react';

export type InitFn = (three: RUAThree) => void | (() => void);
type Props = {
  init: InitFn;
} & ThreeProps;

const useThree = (props: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const three = useRef<RUAThree>();

  useEffect(() => {
    if (!ref.current) throw new Error('Cannot access canvas element.');
    // When React created the canvas element.
    // pass to renderer
    const threeProps = {
      ...defaultProps,
      canvas: ref.current,
    };
    three.current = new RUAThree(
      props ? { ...threeProps, ...props } : threeProps
    );

    const cleanup = props.init(three.current);

    // Cleanup
    return () => {
      three.current?.clean();
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!three.current) return;
    if (props.width == null || props.height == null) return;
    three.current.setCanvasSize(props.width, props.height);
  }, [props.width, props.height]);

  return {
    three: three.current,
    ref,
  };
};

export default useThree;
export { THREE } from '../three';
