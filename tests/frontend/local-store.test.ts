import assert from "node:assert/strict";
import test from "node:test";
import {
  frontendStoreKeys,
  readVirtualRoomProgress,
  saveOrder,
  saveVirtualRoomProgress,
} from "@/lib/frontend/local-store";

test("frontend local store persists no-backend orders", () => {
  withLocalStorage(() => {
    saveOrder({
      id: "ORD-1",
      artworkId: "1",
      artworkTitle: "Ocean Waves",
      amount: 42000,
      customer: { fullName: "Amina Buyer" },
      paymentMethod: "momo",
      status: "pending_payment",
      createdAt: "2026-05-05T00:00:00.000Z",
    });

    assert.match(localStorage.getItem(frontendStoreKeys.latestOrder) ?? "", /Ocean Waves/);
    assert.match(localStorage.getItem(frontendStoreKeys.orders) ?? "", /pending_payment/);
  });
});

test("frontend local store persists virtual room progress", () => {
  withLocalStorage(() => {
    saveVirtualRoomProgress({ room: "right", wing: 2, selectedArtworkId: 4 });

    assert.equal(readVirtualRoomProgress()?.room, "right");
    assert.equal(readVirtualRoomProgress()?.wing, 2);
    assert.equal(readVirtualRoomProgress()?.selectedArtworkId, 4);
  });
});

function withLocalStorage(run: () => void) {
  const values = new Map<string, string>();
  const previousWindow = globalThis.window;
  const previousLocalStorage = globalThis.localStorage;
  const storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  } as Storage;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });

  try {
    run();
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: previousLocalStorage,
    });
  }
}
