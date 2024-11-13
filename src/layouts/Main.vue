<template>
  <div id="q-app">
    <div class="q-pa-md">
      <q-layout view="hHh LpR fFf" style="height: 300px" class="rounded-borders">
        <q-header bordered>
          <q-toolbar>
              <q-btn flat @click="goToDashboard" round dense>
                <q-icon name="dashboard" />
              </q-btn>
            <q-toolbar-title @click="goToDashboard">{{ title }}</q-toolbar-title>
            <q-avatar>
              <img v-if="useAuth.user.photoURL" :src="useAuth.user.photoURL" alt="User Picture">
            </q-avatar>
            <q-item-label class="q-pl-sm">
              {{ useAuth.user.displayName }}
            </q-item-label>
            <span class="q-pl-sm">
              <q-btn label="SignOut" @click="handleSignOut"/>
            </span>
          </q-toolbar>
        </q-header>
        <q-page-container>
          <router-view/>
        </q-page-container>
      </q-layout>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
// import firebaseApp from "@/firebase.js"
import {getAuth, signOut} from "firebase/auth";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";

const useAuth = useAuthStore();
const router = useRouter();
const title = ref();

//page タイトル設定
const currentMeta = router.currentRoute.value.meta;
if (currentMeta && currentMeta.title) {
  title.value = currentMeta.title;
}

const updateTitle = () => {
  title.value = document.title;
};

router.afterEach(updateTitle);

const auth = getAuth();

const handleSignOut = async () => {
  useAuth.clearUser();
  signOut(auth).then(() => {
    router.push('/signin');
  }).catch((error) => {
    console.error('SignOut failed:', error.message);
  });
}

const goToDashboard = () => {
  router.push('/dashboard');
}
</script>