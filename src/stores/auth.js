import {defineStore} from 'pinia';


export const useAuthStore = defineStore('auth', {
      state: () => ({
        user: null,
      }),
      persist: true,
      getters: {
        isLoggedIn: (state) => {
          return !!state.user
        },
      },
      actions: {
        setUser(user) {
          this.user = user;
        },
        clearUser() {
          this.user = null;
        },
      },
    },
);
