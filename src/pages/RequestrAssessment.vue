<script setup>
import {ref, onMounted, computed} from 'vue';
import Papa from 'papaparse';
import firebaseApp from "@/firebase.js"
import {useAuthStore} from "@/stores/auth.js";
import {useRouter, useRoute} from "vue-router";
import {getFirestore, collection, addDoc, doc, getDoc, updateDoc, query, limit, where, getDocs} from "firebase/firestore";
import {Notify} from 'quasar'

const data = ref(null);

const headers = ref([]);
const rows = ref([]);
const selectedValues = ref([]);
const useAuth = useAuthStore();
const router = useRouter();
const route = useRoute();
const slide = ref(1);
const showEndButton = ref(false);
const type = ref("");

const db = getFirestore(firebaseApp);
const docId = route.params.id;
let requestDocId = null;

const notifyAndRedirect = (message) => {
  Notify.create(message);
  router.push('/dashboard');
};

const loadCSV = async () => {
  const csvFilePath = '/assets/csv/requestAssessment.csv';

  try {
    const response = await fetch(csvFilePath);
    const data = await response.text();
    Papa.parse(data, {
      header: true,
      complete: (results) => {
        headers.value = results.meta.fields;
        rows.value = results.data;
        selectedValues.value = Array(rows.value.length).fill(null);
        type.value = rows.value[0].type;
      },
    });
  } catch (error) {
    console.error('CSV ファイル読み込み中エラー:', error);
  }
};

// スライド切り替え時に表示するページ番号
const visibleSlideOptions = computed(() => {
  const start = Math.max(1, slide.value - 3);
  const end = Math.min(rows.value.length, slide.value);
  if (slide.value < rows.value.length - 1) {
    type.value = rows.value[slide.value - 1].type;
  }
  return Array.from({length: end - start + 1}, (_, i) => ({
    label: start + i,
    value: start + i,
  }));
});

//次のスライドに進む
const handleOptionSelect = (currentIndex) => {
  if (currentIndex < rows.value.length - 1) {
    slide.value = currentIndex + 2;
    type.value = rows.value[currentIndex + 1].type;
  }

  // 最後のページで選択が完了したら終了ボタン表示
  if (selectedValues.value[rows.value.length - 1] !== null) {
    showEndButton.value = true;
  }
};

// 終了ボタンクリック時の処理
const handleClick = async () => {
  let pSum = 0;
  let mSum = 0;

  //選択した結果の合計
  for (const row of rows.value) {
    const type = row.type;
    const value = selectedValues.value[row.no - 1];

    if (type === "P") {
      pSum += value;
    } else if (type === "M") {
      mSum += value;
    }
  }

  try {
    const docRef = doc(db, 'requestAssessments', requestDocId);
    await updateDoc(docRef, {
      selectedValues: {pSum: pSum, mSum: mSum},
      updatedAt: new Date(),
    });
    router.push('/thankYou');

  } catch (error) {
    console.error("Firestore保存中エラ:", error);
  }
}

const fetchData = async () => {
  try {
    const docRef = doc(db, 'selfAssessments', docId);
    const docSnap = await getDoc(docRef);
    const email = useAuth.user.email;

    if (docSnap.exists()) {
      data.value = docSnap.data();
      if (!data.value.requestAssessmentEmails.includes(email)) {
        notifyAndRedirect('依頼リストに存在しないか、削除されています。');
        return;
      }
    } else {
      notifyAndRedirect('DocIdが存在しないか、削除されています。');
      return;
    }

    // 評価してないことを確認
    const requestAssessmentsQuery = query(
        collection(db, 'requestAssessments'),
        where('docId', '==', docId),
        where('email', '==', email),
        limit(1)
    );
    const querySnapshot = await getDocs(requestAssessmentsQuery);

    if (querySnapshot.empty) {
      notifyAndRedirect('削除されてる依頼です。');
      return;
    }

    const firstDoc = querySnapshot.docs[0];
    const existingSelectedValues = firstDoc.data().selectedValues;
    if (existingSelectedValues.length > 0) {
      notifyAndRedirect('すでに評価されています。');
      return;
    }
    requestDocId = firstDoc.id;
  } catch (error) {
    console.error('Error fetching documents: ', error);
  }
};

onMounted(() => {
  fetchData();
  loadCSV();
});
</script>

<template>
  <div class="q-pa-md">
    <div>{{ data?.name }}さんのリーダーシップ診断に協力してください</div>
    <q-banner dense :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
      <template v-slot:avatar>
        <q-icon name="feedback" color="primary"/>
      </template>
      <ul>
        <li>詳細は公開せずに、合計の結果だけを公開します。</li>
        <li>結果には誰の結果なのか公開しません。</li>
        <li>評価ではなく診断のための設問ですので率直に答えてください。</li>
        <li>該当者のメールに依頼が届けます。</li>
      </ul>
    </q-banner>
    以下の記述について、それぞれあてはまる選択肢の番号に○をつけてください。
  </div>
  <div class="q-pa-md text-bold text-h5">
    {{type}}機能（自己評価）
  </div>
  <div class="q-pa-md">
    <q-carousel
        v-model="slide"
        transition-prev="slide-right"
        transition-next="slide-left"
        animated
        control-color="primary"
        class="rounded-borders"
    >
      <q-carousel-slide
          v-for="(row, rowIndex) in rows"
          :key="rowIndex"
          :name="rowIndex + 1"
          class="column no-wrap flex-center"
      >
        <div class="q-mt-md text-left a-area">
          <div class="q-mb-md">
            {{ row["no"] }}. {{ row["question"] }}
          </div>
          <q-radio v-for="(header, index) in headers.slice(3)"
                   :key="index"
                   v-model="selectedValues[row.no - 1]"
                   @click="handleOptionSelect(rowIndex)"
                   checked-icon="task_alt"
                   unchecked-icon="panorama_fish_eye"
                   :val="(5 - index)"
                   :label="(5 - index) + '. ' + row[header]"/>
        </div>
      </q-carousel-slide>
    </q-carousel>

    <div class="row justify-center">
      <q-btn-toggle
          glossy
          v-model="slide"
          :options="visibleSlideOptions"
      />
    </div>
    <div class="q-pa-md float-right" v-if="showEndButton">
      <q-btn color="primary" label="終了" @click="handleClick"/>
    </div>
  </div>
</template>

<style scoped>
.a-area {
  display: grid;
  margin-bottom: 20px;
}
</style>