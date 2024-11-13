<!--<template>-->
<!--  <div id="q-app">-->
<!--    <div class="q-pa-md">-->
<!--      <q-layout view="hHh LpR fFf" style="height: 300px" class="rounded-borders">-->
<!--        <q-header bordered>-->
<!--          <q-toolbar>-->
<!--            <q-btn flat @click="leftDrawerOpen = !leftDrawerOpen" round dense>-->
<!--              <svg style="width:24px;height:24px" viewBox="0 0 24 24">-->
<!--                <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />-->
<!--              </svg>-->
<!--            </q-btn>-->
<!--            <q-toolbar-title>{{$q.screen.width}}</q-toolbar-title>-->
<!--          </q-toolbar>-->
<!--        </q-header>-->

<!--        <q-drawer bordered-->
<!--                  v-model="leftDrawerOpen"-->
<!--                  :width="200"-->
<!--                  :breakpoint="500"-->
<!--                  :behavior="$q.screen.width > 500 ? 'desktop' : 'mobile'"-->
<!--        >-->
<!--          <q-scroll-area class="fit">-->
<!--            <q-list padding class="menu-list">-->
<!--              <q-item clickable v-ripple>-->
<!--                <q-item-section avatar>-->
<!--                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">-->
<!--                    <path fill="currentColor" d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" />-->
<!--                  </svg>-->
<!--                </q-item-section>-->

<!--                <q-item-section>-->
<!--                  Inbox-->
<!--                </q-item-section>-->
<!--              </q-item>-->


<!--            </q-list>-->
<!--          </q-scroll-area>-->
<!--        </q-drawer>-->
<!--        <q-page-container>-->
<!--          <router-view />-->
<!--        </q-page-container>-->
<!--      </q-layout>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import {ref} from 'vue'-->

<!--const leftDrawerOpen = ref(false)-->
<!--const rightDrawerOpen = ref(false)-->

<!--const toggleLeftDrawer = () => {-->
<!--  leftDrawerOpen.value = !leftDrawerOpen.value-->
<!--}-->

<!--const toggleRightDrawer = () => {-->
<!--  rightDrawerOpen.value = !rightDrawerOpen.value-->
<!--}-->

<!--</script>-->