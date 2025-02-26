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
    item.children = []
    const parent = list.find((i) => i[keyField] === item[pField]) as any
    if (parent) {
      parent.children.push(item)
    } else {
      roots.push(item)
    }
  })
  return roots
}
