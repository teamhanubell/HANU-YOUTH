import { FC } from 'react';

declare module '*.tsx' {
  const Component: FC;
  export default Component;
}
