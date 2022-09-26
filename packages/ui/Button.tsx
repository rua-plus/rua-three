import * as React from 'react';

type Props = {} & React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export const Button = ({ ...rest }: Props) => {
  return <button {...rest}>Boop</button>;
};
