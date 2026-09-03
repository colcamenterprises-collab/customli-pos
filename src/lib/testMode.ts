const TEST_MODE_KEY = "customli.pos.managerTestMode.v1";

export function isManagerTestMode() {
  return window.localStorage.getItem(TEST_MODE_KEY) === "on";
}

export function enableManagerTestMode() {
  window.localStorage.setItem(TEST_MODE_KEY, "on");
}

export function disableManagerTestMode() {
  window.localStorage.removeItem(TEST_MODE_KEY);
}
