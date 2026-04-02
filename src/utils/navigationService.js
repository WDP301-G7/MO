import { createRef } from "react";

// A single stable ref held outside React's lifecycle.
// Set this as <NavigationContainer ref={navigationRef}> in App.js.
// Then any module can call navigationRef.current?.reset(...) directly
// without going through an event emitter (which can break on hot reload).
export const navigationRef = createRef();
