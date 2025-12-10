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
    member: obj?.member,
    parent: obj?.parent,
    dublincore: { ...obj?.dublincore, title: Array.isArray(obj?.dublincore?.title) ? obj?.dublincore?.title?.[0] : obj?.dublincore?.title },
    extensions: obj?.extensions,
    context: obj?.['@context'],
  }
  return simpleObject
}
