import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useUserStore } from './modules/user'

export const pinia = createPinia().use(piniaPluginPersistedstate)

export { useUserStore }
