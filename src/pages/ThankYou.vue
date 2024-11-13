<template>
  <div class="q-pa-md text-center">
    <q-icon name="check_circle" color="green" size="100px" class="q-mb-md" />
    <h2>ご協力ありがとうございます！</h2>
    <p>評価が正常に送信されました。</p>

    <div class="q-mt-md">
      <q-btn color="primary" label="ホームに戻る" @click="goToHome" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
</style>