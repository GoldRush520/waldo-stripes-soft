import { registerProps } from './registry';
import { PROPS as ARCH } from './arch/index';
import { PROPS as CIVIC } from './civic/index';
import { PROPS as STREET } from './street/index';
import { PROPS as TRANSPORT } from './transport/index';
import { PROPS as NATURE } from './nature/index';
import { PROPS as LEISURE } from './leisure/index';
import { PROPS as CRAFT } from './craft/index';

let registered = false;

/** Register every prop library exactly once. */
export function registerAllProps(): void {
  if (registered) return;
  registered = true;
  const libs = { arch: ARCH, civic: CIVIC, street: STREET, transport: TRANSPORT, nature: NATURE, leisure: LEISURE, craft: CRAFT };
  for (const [name, lib] of Object.entries(libs)) registerProps(lib, name);
}
