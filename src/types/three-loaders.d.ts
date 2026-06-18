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

declare module "three/addons/controls/PointerLockControls.js" {
  import { Camera, Vector3 } from "three";

  export class PointerLockControls {
    constructor(camera: Camera, domElement?: HTMLElement | null);
    readonly isLocked: boolean;
    pointerSpeed: number;
    enabled: boolean;
    lock(): void;
    unlock(): void;
    moveForward(distance: number): void;
    moveRight(distance: number): void;
    getObject(): Camera;
    getDirection(target: Vector3): Vector3;
    connect(): void;
    disconnect(): void;
    dispose(): void;
    addEventListener(type: string, listener: (event: unknown) => void): void;
    removeEventListener(type: string, listener: (event: unknown) => void): void;
  }
}
