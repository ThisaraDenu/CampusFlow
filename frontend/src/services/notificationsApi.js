import { store } from './store'

export const notificationsApi = {
  listSync() {
    return store.notifications
  },
}

