/** Cursor’s in-app browser injects data-cursor-ref before hydrate; strip it so React matches SSR HTML. */
function stripCursorRefs(root: ParentNode = document) {
  if (root instanceof Element) root.removeAttribute("data-cursor-ref");
  root.querySelectorAll("[data-cursor-ref]").forEach((node) => node.removeAttribute("data-cursor-ref"));
}

stripCursorRefs();

const observer = new MutationObserver((records) => {
  for (const record of records) {
    if (record.type === "attributes") {
      (record.target as Element).removeAttribute("data-cursor-ref");
      continue;
    }
    for (const node of record.addedNodes) {
      if (node instanceof Element || node instanceof DocumentFragment) stripCursorRefs(node);
    }
  }
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ["data-cursor-ref"],
});

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    stripCursorRefs();
    observer.disconnect();
  });
});
