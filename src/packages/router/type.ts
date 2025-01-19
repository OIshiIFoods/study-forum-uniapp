export type RouteInfo = {
  name?: string
  path: string
  query?: Record<string, any>
}

export type NavigateGuardOptions = {
  from: RouteInfo
  to: RouteInfo
}

export type BeforeGuard = (
  options: NavigateGuardOptions
) => boolean | Promise<boolean>

export type AfterGuard = (
  options: NavigateGuardOptions
) => boolean | Promise<boolean>

export type RunGuardOptions = {
  path: string
  query?: Record<string, any>
}

export type RouterConstructorOptions = {
  routes: RouteInfo[]
}

export type CreateRouterOptions = {
  routes: RouteInfo[]
}

export type NavigateToOptions = Omit<UniNamespace.NavigateToOptions, 'url'> & {
  name?: string
  path?: string
  query?: Record<string, any>
}
export type NavigateBackOptions = UniNamespace.NavigateBackOptions

export type RedirectToOptions = Omit<UniNamespace.RedirectToOptions, 'url'> & {
  name?: string
  path?: string
  query?: Record<string, any>
}

export type ReLaunchOptions = Omit<UniNamespace.ReLaunchOptions, 'url'> & {
  name?: string
  path?: string
  query?: Record<string, any>
}

export type SwitchTabOptions = Omit<UniNamespace.SwitchTabOptions, 'url'> & {
  name?: string
  path?: string
  query?: Record<string, any>
}

export type FormatUrlOptions = {
  path: string
  query?: Record<string, any>
}

export type ParseUrlOptions = {
  path: string
  query?: Record<string, any>
}

export type GetRouteOptions = {
  path: string
  query?: Record<string, any>
}
