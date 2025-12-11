// simplify and sort Object
export function getSimpleObject (obj) {
  const simpleObject = {
    identifier: obj.identifier ? obj.identifier : obj['@id'],
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,
    description: obj?.description,
    title: obj?.title,
    expanded: obj?.expanded,
    level: obj?.level,
    editorialLevelIndicator: obj?.editorialLevelIndicator,
    totalChildren: obj?.totalChildren,
    totalDescendants: obj?.totalDescendants,
    children: obj?.children,
    member: obj?.member?.map((m) => getSimpleObject(m)),
    parent: obj?.parent,
    dublincore: { ...obj?.dublincore, title: Array.isArray(obj?.dublincore?.title) ? obj?.dublincore?.title?.[0] : obj?.dublincore?.title },
    extensions: obj?.extensions,
    context: obj?.['@context'],
  }
  return simpleObject
}

// https://gist.github.com/aurbano/383e691368780e7f5c98?permalink_comment_id=3560352#gistcomment-3560352
export const removeKeys = (obj, keys) => obj !== Object(obj)
      ? obj
      : Array.isArray(obj)
      ? obj.map((item) => removeKeys(item, keys))
      : Object.keys(obj)
          .filter((k) => !keys.includes(k))
          .reduce(
            (acc, x) => Object.assign(acc, { [x]: removeKeys(obj[x], keys) }),
            {}
          )

// Manage customCss
export function createCustomCssManager(initialCss = '') {
  // create / apply style
  let el = document.getElementById('customCss');
  if (!el) {
    el = document.createElement('style');
    el.id = 'customCss';
    // Initial append
    document.head.appendChild(el);
  }
  el.textContent = initialCss;

  // Observer : if customCss style tag isn't the last child, replace (e.g. move) it
  const observer = new MutationObserver(() => {
    // if customCss style tag is already the last child, do nothing
    if (document.head.lastElementChild !== el) {
      document.head.appendChild(el);
    }
  });

  observer.observe(document.head, { childList: true });

  return {
    update(css) {
      el.textContent = css;
      // if customCss style tag isn't the last child, replace (e.g. move) it
      if (document.head.lastElementChild !== el) {
        document.head.appendChild(el)
      }
    },
    disconnect() {
      observer.disconnect();
    },
    element: el
  };
}

// Use customCss manager
import { onMounted, onBeforeUnmount, watch } from 'vue';

export function useCustomCss(customCssRef) {
  let mgr;

  onMounted(() => {
    mgr = createCustomCssManager(customCssRef.value || '');
  });

  watch(customCssRef, (newVal) => {
    if (mgr) mgr.update(newVal);
  });

  onBeforeUnmount(() => {
    if (mgr) mgr.disconnect();
  });

  return {
    getElement: () => mgr && mgr.element
  };
}