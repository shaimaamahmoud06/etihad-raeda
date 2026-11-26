/* The hero walk's loader, off the main thread (see hero-walk-loader.ts). */

import { WalkLoader, type ToLoader } from "./hero-walk-loader";

const scope = self as unknown as {
  postMessage(msg: unknown, transfer?: Transferable[]): void;
  onmessage: ((e: MessageEvent<ToLoader>) => void) | null;
  close(): void;
};

const loader = new WalkLoader((msg, transfer) => scope.postMessage(msg, transfer ?? []));

scope.onmessage = (e) => {
  loader.handle(e.data);
  if (e.data.type === "destroy") scope.close();
};
