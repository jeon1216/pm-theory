<script setup>
import {ref, onMounted} from 'vue';
import firebaseApp from "@/firebase.js"
import {getFirestore, collection, query, where, getDocs, deleteDoc, doc} from "firebase/firestore";
import {useRouter, useRoute} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";
import { Notify } from 'quasar'

const useAuth = useAuthStore();
const router = useRouter();

const email = useAuth.user.email;
const userDataList = ref([]);

const db = getFirestore(firebaseApp);

const fetchUserData = async () => {
  try {
    const q = query(
        collection(db, 'selfAssessments'),
        where('email', '==', email)
    );

    const querySnapshot = await getDocs(q);

    const userDataArray = [];
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const assessmentId = doc.id;

      const requestAssessmentsQuery = query(
          collection(db, 'requestAssessments'),
          where('docId', '==', assessmentId)
      );
      let requestCount = 0;
      const requestAssessmentsSnapshot = await getDocs(requestAssessmentsQuery);
      const requestAssessmentsData = requestAssessmentsSnapshot.docs.map(reqDoc => reqDoc.data());
      requestAssessmentsData.forEach(reqData => {
        if (Object.keys(reqData.selectedValues).length > 0) {
          requestCount++;
        }
      });

      userDataArray.push({
        ...data,
        assessmentId,
        requestCount: requestCount,
      });
    }
    // timestamp 降順でソート
    userDataArray.sort((a, b) => b.timestamp - a.timestamp);

    userDataList.value = userDataArray;
  } catch (error) {
    console.error('Error fetching user data: ', error);
  }
};

//　結果確認画面に遷移
const goToResultAssessment = (assessmentId) => {
  router.push('/resultAssessment/' + assessmentId);
};

// 依頼追加
//　結果確認画面に遷移
const addRequestAssessment = (assessmentId) => {
  router.push('/selfSubmit/' + assessmentId);
};

//　削除
const deleteAssessment = async (assessmentId, index) => {
  try {
    await deleteDoc(doc(db, 'selfAssessments', assessmentId));
    userDataList.value.splice(index, 1);

    //requestAssessmentsも削除
    const requestAssessmentsQuery = query(
        collection(db, 'requestAssessments'),
        where('docId', '==', assessmentId),
    );

    const querySnapshot = await getDocs(requestAssessmentsQuery);
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    Notify.create('削除しました。')
    console.log(`Document ${assessmentId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
}

onMounted(() => {
  fetchUserData();
});
</script>

<template>
  <div class="q-pa-md">
    <q-card class="my-card" flat bordered>
      <q-card-section>
        <div class="text-h6">実施リスト</div>
        <div class="text-subtitle1">
          お互いに評価が完了すると結果ボタンが表示されます
        </div>
      </q-card-section>

      <q-markup-table>
        <thead>
        <tr>
          <th class="text-left">提出日時</th>
          <th class="text-right">依頼人数</th>
          <th class="text-right">解答人数</th>
          <th class="text-center">結果確認</th>
          <th class="text-center">依頼追加</th>
          <th class="text-center">削除</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in userDataList" :key="index">
          <td class="text-left">
            {{ item.timestamp.toDate().toLocaleString() }}
          </td>
          <td class="text-right">{{ item?.requestAssessmentEmails.length || 0 }}</td>
          <td class="text-right">{{ item?.requestCount || 0 }}</td>
          <td class="text-center">
            <q-btn v-if="item.requestCount > 0"
                color="primary"
                label="結果確認"
                @click="goToResultAssessment(item.assessmentId)"
            />
          </td>
          <td class="text-center">
            <q-btn
                color="primary"
                label="追加"
                @click="addRequestAssessment(item.assessmentId)"
            />
          </td>
          <td class="text-center">
            <q-btn
                color="red"
                label="削除"
                @click="deleteAssessment(item.assessmentId, index)"
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