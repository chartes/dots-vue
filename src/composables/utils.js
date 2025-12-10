// simplify and sort Objet
export function getSimpleObject (obj) {
  const simpleObject = {
    identifier: obj.identifier ? obj.identifier : obj['@id'],
    citeType: obj['@type'] ? obj['@type'] : obj.citeType,
    expanded: obj?.expanded,
    title: obj?.title,
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
