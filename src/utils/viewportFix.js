function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

export function initializeViewportFix() {
  setViewportHeight();
  window.addEventListener("resize", setViewportHeight);
}

export function cleanupViewportFix() {
  window.removeEventListener("resize", setViewportHeight);
}
