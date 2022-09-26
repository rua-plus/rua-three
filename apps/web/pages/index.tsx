import { Button } from 'ui';
import test from 'rua-three';

export default function Web() {
  return (
    <div>
      <h1>Web</h1>
      <Button onClick={() => console.log(test())} />
    </div>
  );
}
