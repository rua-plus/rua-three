import Link from 'next/link';
import classnames from 'classnames';

const projects = [
  {
    id: 0,
    path: '/mouse',
    name: 'Mouse Pick',
  },
  {
    id: 1,
    path: '/hover',
    name: 'Mouse Hover',
  },
  {
    id: 2,
    path: '/tween',
    name: 'Tween Animation',
  },
];

export default function Web() {
  return (
    <>
      <div className="flex p-8">
        {projects.map((item) => (
          <Link href={item.path} key={item.id} className="mr-4 last:mr-0">
            <div
              className={classnames(
                'p-4 bg-white rounded-md shadow-md',
                'cursor-pointer select-none mr-4'
              )}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
