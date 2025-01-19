import { nextTick } from 'vue'
import type {
  NavigateToOptions,
  RedirectToOptions,
  FormatUrlOptions,
  NavigateBackOptions,
  SwitchTabOptions,
  ReLaunchOptions,
  RouteInfo,
  RouterConstructorOptions,
  CreateRouterOptions,
  ParseUrlOptions,
  GetRouteOptions,
  BeforeGuard,
  AfterGuard,
  RunGuardOptions,
} from './type'

class Router {
  static defaults = {
    navigateToOptions: {
      animationType: 'slide-in-right',
      animationDuration: 300,
    } as NavigateToOptions,
    navigateBackOptions: {
      delta: 1,
      animationType: 'slide-out-right',
      animationDuration: 300,
    } as NavigateBackOptions,
  }

  routes: RouteInfo[] = []
  route: RouteInfo = { path: '' }
  private beforeGuards: BeforeGuard[] = []
  private afterGuards: AfterGuard[] = []

  constructor({ routes = [] }: RouterConstructorOptions) {
    this.routes = routes
    this.route = this.getRoute()
  }

  /** 添加全局前置导航守卫 */
  registerBeforeGuarg(guard: BeforeGuard) {
    this.beforeGuards.push(guard)
  }

  /** 添加全局后置导航守卫 */
  registerAfterGuarg(guard: AfterGuard) {
    this.afterGuards.push(guard)
  }

  /** 执行全局前置导航守卫 */
  private async runBeforeGuards({
    path,
    query,
  }: RunGuardOptions): Promise<boolean> {
    for (const guard of this.beforeGuards) {
      const result = await guard({
        from: this.route,
        to: this.getRoute({ path, query }),
      })
      if (!result) return false
    }
    return true
  }

  /** 执行全局后置导航守卫 */
  private async runAfterGuards({
    path,
    query,
  }: RunGuardOptions): Promise<boolean> {
    for (const guard of this.afterGuards) {
      const result = await guard({
        from: this.route,
        to: this.getRoute({ path, query }),
      })
      if (!result) return false
    }
    return true
  }

  /** 普通跳转 */
  async push({ name, path, query, ...otherOptions }: NavigateToOptions) {
    // route name 高于 path
    if (name) {
      const routeInfo = this.routes.find((route) => route.name === name)
      if (routeInfo) {
        path = routeInfo.path
      } else {
        return
      }
    }
    if (!path) {
      return
    }
    if (!(await this.runBeforeGuards({ path, query }))) return
    uni.navigateTo({
      url: this.formatUrl({ path, query }),
      ...otherOptions,
    })
    if (!(await this.runAfterGuards({ path, query }))) return
    this.route = this.getRoute()
  }

  /** 重定向 */
  async replace({ name, path, query, ...otherOptions }: RedirectToOptions) {
    if (name) {
      const routeInfo = this.routes.find((route) => route.name === name)
      if (routeInfo) {
        path = routeInfo.path
        query = routeInfo.query
      } else {
        return
      }
    }
    if (!path) {
      return
    }
    if (!(await this.runBeforeGuards({ path, query }))) return
    uni.redirectTo({
      url: this.formatUrl({ path, query }),
      ...otherOptions,
    })
    if (!(await this.runAfterGuards({ path, query }))) return
    this.route = this.getRoute()
  }

  /** 返回 */
  back(options: NavigateBackOptions) {
    uni.navigateBack(options)
    this.route = this.getRoute()
    return
  }

  /** 跳转到 tabBar */
  async switchTab({ name, path, query, ...otherOptions }: SwitchTabOptions) {
    if (name) {
      const routeInfo = this.routes.find((route) => route.name === name)
      if (routeInfo) {
        path = routeInfo.path
        query = routeInfo.query
      } else {
        return
      }
    }
    if (!path) {
      return
    }
    if (!(await this.runBeforeGuards({ path, query }))) return
    uni.switchTab({
      url: this.formatUrl({ path, query }),
      ...otherOptions,
    })
    if (!(await this.runAfterGuards({ path, query }))) return
    this.route = this.getRoute()
  }

  /** 重启到指定页面 */
  async reLaunch({ name, path, query, ...otherOptions }: ReLaunchOptions) {
    if (name) {
      const routeInfo = this.routes.find((route) => route.name === name)
      if (routeInfo) {
        path = routeInfo.path
        query = routeInfo.query
      } else {
        return
      }
    }
    if (!path) {
      return
    }
    if (!(await this.runBeforeGuards({ path, query }))) return
    uni.reLaunch({
      url: this.formatUrl({ path, query }),
      ...otherOptions,
    })
    if (!(await this.runAfterGuards({ path, query }))) return
    this.route = this.getRoute()
  }

  /** 获取路由对象, 不传递则获取当前页面的Router对象 */
  private getRoute(params?: GetRouteOptions): RouteInfo {
    if (!params) {
      const pageInfo = getCurrentPages().at(-1) as any
      if (!pageInfo) {
        params = {
          path: this.routes[0].path,
        }
      } else {
        params = this.parseUrl(pageInfo?.$page.fullPath)
      }
    }
    const { path, query } = params
    const { name } = this.routes.find((route) => route.path === path) ?? {}
    return {
      path,
      query,
      name,
    }
  }

  /** 处理 url 和参数 */
  formatUrl({ path, query }: FormatUrlOptions): string {
    if (!query) return path

    const queryStr = Object.entries(query)
      .map(
        ([key, value]) =>
          `${key}=${encodeURIComponent(typeof value === 'object' ? JSON.stringify(value) : String(value))}`
      )
      .join('&')

    return `${path}${path.includes('?') ? '&' : '?'}${queryStr}`
  }

  /** 解析 url 和参数 */
  parseUrl(url: string = ''): ParseUrlOptions {
    const [path, queryStr] = url.split('?')
    const query = queryStr
      ? Object.fromEntries(
          queryStr
            .split('&')
            .map((item) => item.split('='))
            .map(([key, value]) => [key, decodeURIComponent(value)])
        )
      : undefined
    return {
      path,
      query,
    }
  }
}

export function createRouter({ routes }: CreateRouterOptions) {
  routes = routes.map(({ name, path }) => ({
    name,
    path: path.startsWith('/') ? path : `/${path}`,
  }))
  return new Router({ routes })
}

// 使用示例
// import { createRouter } from './core/Router'
// import pagesConfig from '@/pages.json'

// export const router = createRouter({
//   routes: pagesConfig.pages,
// })

// 存在问题
// tabbar 页面如何引入到 routes 中
// getCurrentPages 初始化太晚问题，如何获取到第一个加载的页面
// 第三方组件的内部执行页面跳转，router 监测不到
