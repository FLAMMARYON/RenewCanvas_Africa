// three@0.179 ships these example loaders as plain .js without co-located
// type declarations, and the installed @types/three does not cover the
// examples/jsm path. Declare the minimal surface we use so the dynamic import
// in the virtual room stays type-safe (no @ts-ignore) and needs no new dep.
declare module "three/examples/jsm/loaders/RGBELoader.js" {
  import { DataTexture, Loader, LoadingManager } from "three";

  export class RGBELoader extends Loader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad: (texture: DataTexture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: unknown) => void
    ): void;
    setDataType(type: number): this;
  }
}
