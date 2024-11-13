<script setup>
import { ref, onMounted } from 'vue';
import firebaseApp from "@/firebase.js";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const requestList = ref([]);
const authStore = useAuthStore();
const db = getFirestore(firebaseApp);
const router = useRouter();
const route = useRoute();

const fetchData = async () => {
  const email = authStore.user.email;
  const q = query(
      collection(db, 'requestAssessments'),
      where("email", "==", email)
  );

  const querySnapshot = await getDocs(q);

  requestList.value = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
    };
  });

  // timestamp 降順でソート
  requestList.value.sort((a, b) => b.timestamp - a.timestamp);

};

// 評価する
const evaluate = (docId) => {
  router.push('/requestAssessments/' + docId);
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="q-pa-md">
    <q-card class="my-card" flat bordered>
      <q-card-section>
        <div class="text-h6">診断依頼一覧</div>
      </q-card-section>

      <q-markup-table>
        <thead>
        <tr>
          <th class="text-left">依頼日時</th>
          <th class="text-center">依頼者</th>
          <th class="text-center">状態</th>
          <th class="text-center">操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in requestList" :key="index">
          <td class="text-left">
            {{item.timestamp.toDate().toLocaleString()}}
          </td>
          <td class="text-center">{{ item.requestName }}</td>
          <td class="text-center">{{ Object.keys(item.selectedValues).length > 0 ? "対応済み" : "未対応" }}</td>
          <td class="text-center">
            <q-btn v-if="Object.keys(item.selectedValues).length === 0"
                color="primary"
                label="評価する"
                @click="evaluate(item.docId)"
            />
          </td>
        </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </div>
</template>

<style scoped>
</style>
