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
