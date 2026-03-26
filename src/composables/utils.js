import store from '@/store'

// simplify and sort Object
export function getSimpleObject(obj, parentId, projId) {
  const dtsRootCollectionId = store.state.dtsRootCollectionId
  const identifier = obj.identifier ? obj.identifier : obj['@id']
  //console.log('check dtsRootCollectionId.length > 0 && obj.parent === dtsRootCollectionId', identifier, dtsRootCollectionId, obj.parent, parentId)
  let projectId
  // si racine
  if (projId) {
    projectId = projId
  } else if ((dtsRootCollectionId.length > 0 && (obj.parent || parentId) === dtsRootCollectionId) && (dtsRootCollectionId.length > 0 && dtsRootCollectionId !== identifier)  || dtsRootCollectionId.length === 0 && obj.totalParents === 0) {
    projectId = identifier
    //console.log('identifier, dtsRootCollectionId, projectId, projId, obj.totalParents, obj.member : ', identifier, dtsRootCollectionId, projectId, projId, obj.totalParents, obj.member)
  }

  const simpleObject = {
    ...obj,

    identifier,
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,

    dublincore: {
      ...obj?.dublincore,
      title: Array.isArray(obj?.dublincore?.title)
        ? obj?.dublincore?.title?.[0]
        : obj?.dublincore?.title
    },
    parent: obj?.parent ? obj.parent : parentId ? parentId : null,
    // map + parent assignation
    member: obj?.member?.map((m) => getSimpleObject(m, identifier, projectId)),

    children: obj?.children
      ? obj.children.map((m) => getSimpleObject(m, identifier, projectId))
      : obj?.member
        ? obj.member.map((m) => getSimpleObject(m, identifier, projectId))
        : [],

    context: obj?.['@context'],

    projectIdentifier: obj?.projectIdentifier ? obj.projectIdentifier : projectId
  }

  //console.log('dtsRootCollectionId identifier simpleObject', dtsRootCollectionId, identifier, simpleObject)

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
