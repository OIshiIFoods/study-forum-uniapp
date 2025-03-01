export const filterObjectByKeys = (
  obj: Record<string, any>,
  keys: string[]
): Record<string, any> => {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) {
        acc[key] = obj[key]
      }
      return acc
    },
    {} as Record<string, any>
  )
}

export const parseHtmlString = (htmlString: string) => {
  // 使用正则表达式去除 HTML 标签
  return htmlString.replace(/<[^>]+>/g, '')
}

export const transformListToTree = <T extends Array<Record<string, any>>>(
  list: T,
  keyField: string,
  pField: string
) => {
  const roots = [] as (T[0] & { children: T })[]
  list.forEach((item: any) => {
    const parent = list.find((i) => i[keyField] === item[pField]) as any
    if (parent) {
      parent.children = parent.children ?? []
      parent.children.push(item)
    } else {
      roots.push(item)
    }
  })
  return roots
}

export const getEleFromTree = <T extends Array<Record<string, any>>>(
  tree: T,
  keyFieldValue: any,
  keyField: string = 'id',
  childField: string = 'children'
) => {
  const stack: { node: any; path: string }[] = tree.map((node, index) => ({
    node,
    path: `${index}`,
  }))

  while (stack.length) {
    const { node, path } = stack.pop()!
    if (node[keyField] === keyFieldValue) {
      return { path, value: node as T[0] }
    }
    if (node[childField]) {
      stack.push(
        ...node[childField].map((child: any, childIndex: number) => ({
          node: child,
          index: childIndex,
          path: `${path}.${childIndex}`,
        }))
      )
    }
  }
  return false
}

export const transformTreeToList = <T extends Array<any>>(
  tree: T,
  childField: string
) => {
  const list = []
  const stack = [...tree]
  while (stack.length) {
    const node = stack.pop()!
    list.push(node)
    if (node[childField]) {
      stack.push(...node[childField])
    }
  }
  return list as T
}
