<script setup>
import {ref} from 'vue';

import {getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import firebaseApp from "@/firebase.js"
import {Notify} from 'quasar'

const router = useRouter();
const useAuth = useAuthStore();
const error = ref(null);

const provider = new GoogleAuthProvider();
const auth = getAuth();

const allowedDomain = import.meta.env.VITE_ALLOWED_DOMAIN;

const signInWithGoogle = async () => {
  signInWithPopup(auth, provider)
      .then((result) => {
        const userEmailDomain = result.user.email.split("@")[1];
        if (userEmailDomain !== allowedDomain) {
          Notify.create(allowedDomain + "のメールでログインしてください。");
          return;
        }
        useAuth.setUser(result.user);
        router.push('/dashboard');
      }).catch((error) => {
    console.error('Login failed:', error.message);
  });
}
</script>

<template>
  <div class="fullscreen">
    <div class="full-height flex column items-center justify-center">
      <div class="text-weight-bolder q-mb-md text-h3 q-pb-lg">PM式リーダーシップ診断</div>
      <div class="">
        <span>
          <q-btn color="black" @click="signInWithGoogle">
            <span class="float-left" style="width: 30px; height: 30px;">
              <svg>
                <path fill="#4285F4"
                      d="M23.7449 12.27C23.7449 11.48 23.6749 10.73 23.5549 10H12.2549V14.51H18.7249C18.4349 15.99 17.5849 17.24 16.3249 18.09V21.09H20.1849C22.4449 19 23.7449 15.92 23.7449 12.27Z"></path>
                <path fill="#34A853"
                      d="M12.2549 24C15.4949 24 18.2049 22.92 20.1849 21.09L16.3249 18.09C15.2449 18.81 13.8749 19.25 12.2549 19.25C9.12492 19.25 6.47492 17.14 5.52492 14.29H1.54492V17.38C3.51492 21.3 7.56492 24 12.2549 24Z"></path>
                <path fill="#FBBC05"
                      d="M5.52488 14.29C5.27488 13.57 5.14488 12.8 5.14488 12C5.14488 11.2 5.28488 10.43 5.52488 9.71V6.62H1.54488C0.724882 8.24 0.254883 10.06 0.254883 12C0.254883 13.94 0.724882 15.76 1.54488 17.38L5.52488 14.29Z"></path>
                <path fill="#EA4335"
                      d="M12.2549 4.75C14.0249 4.75 15.6049 5.36 16.8549 6.55L20.2749 3.13C18.2049 1.19 15.4949 0 12.2549 0C7.56492 0 3.51492 2.7 1.54492 6.62L5.52492 9.71C6.47492 6.86 9.12492 4.75 12.2549 4.75Z"></path>
              </svg>
            </span>
            Sign in with Google
          </q-btn>
        </span>
        <p v-if="error">{{ error }}</p>
      </div>
    </div>
  </div>
</template>



