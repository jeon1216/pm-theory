<script setup>
import {ref, onMounted, computed} from 'vue';
import Papa from 'papaparse';
import firebaseApp from "@/firebase.js"
import {useAuthStore} from "@/stores/auth.js";
import {useRouter} from "vue-router";
import {getFirestore, collection, addDoc} from "firebase/firestore";

const headers = ref([]);
const rows = ref([]);
const selectedValues = ref([]);
const useAuth = useAuthStore();
const router = useRouter();
const slide = ref(1);
const showEndButton = ref(false);
const type = ref("");

const db = getFirestore(firebaseApp);

const loadCSV = async () => {
  const csvFilePath = '/assets/csv/selfAssessment.csv';

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
    const docRef = await addDoc(collection(db, 'selfAssessments'), {
      email: useAuth.user.email,
      selectedValues: {pSum: pSum, mSum: mSum},
      requestAssessmentEmails: [],
      name: useAuth.user.displayName,
      timestamp: new Date()
    });

    console.log("Document written with ID: ", docRef.id);
    router.push('/selfSubmit/' + docRef.id);

  } catch (error) {
    console.error("Firestore保存中エラ:", error);
  }
}

onMounted(() => {
  loadCSV();
});
</script>

<template>
  <div class="q-pa-md">
    以下の記述について、それぞれあてはまる選択肢の番号に○をつけてください。
  </div>
  <div class="q-pa-md text-bold text-h5">
    {{ type }}機能（自己評価）
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