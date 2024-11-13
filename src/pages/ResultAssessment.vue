<script setup>
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {getFirestore, doc, getDoc, query, collection, where, getDocs} from "firebase/firestore";
import {Notify} from 'quasar';
import firebaseApp from "@/firebase.js";
import {useAuthStore} from "@/stores/auth.js";

import {use} from 'echarts/core';
import {ScatterChart} from 'echarts/charts';
import {GridComponent, TooltipComponent, TitleComponent, MarkLineComponent, GraphicComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import VChart from 'vue-echarts';

use([ScatterChart, TitleComponent, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer, GraphicComponent]);

const db = getFirestore(firebaseApp);
const router = useRouter();
const route = useRoute();

const assessmentId = ref(route.params.id);
const data = ref(null);
const useAuth = useAuthStore();
const email = useAuth.user.email;
const requestResults = ref([]);

const chartOption = ref(null);

const notifyAndRedirect = (message) => {
  Notify.create(message);
  router.push('/dashboard');
};

const fetchData = async () => {
  try {
    const docRef = doc(db, 'selfAssessments', assessmentId.value);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      notifyAndRedirect('評価結果が見つかりませんでした。');
      return;
    }
    data.value = docSnap.data();

    if (data.value.email !== email) {
      notifyAndRedirect('評価結果が見つかりませんでした。');
      return;
    }

    const requestAssessmentsQuery = query(
        collection(db, 'requestAssessments'),
        where('docId', '==', assessmentId.value)
    );
    const querySnapshot = await getDocs(requestAssessmentsQuery);


    for (const docSnap of querySnapshot.docs) {
      const resultData = docSnap.data();
      if (Object.keys(resultData.selectedValues).length > 0) {
        requestResults.value.push(resultData.selectedValues);
      }
    }

    if (requestResults.value.length === 0) {
      notifyAndRedirect('評価結果が見つかりませんでした。');
      return;
    }

    showChart(data.value.selectedValues, requestResults.value);
  } catch (error) {
    console.error("Error fetching document: ", error);
  }
};

const showChart = (selectedValues, requestResults) => {
  const data = [[selectedValues.mSum, selectedValues.pSum]];
  for (const result of requestResults) {
    data.push([result.mSum, result.pSum]);
  }

  chartOption.value = {
    title: {
      text: 'PM式リーダーシップ分析',
      left: 'center',
    },
    tooltip: {
      position: 'top',
      trigger: 'item',
      formatter: (params) =>
          params.dataIndex === 0 ? `自己評価（M機能: ${params.value[0]} P機能: ${params.value[1]}）` : `他人評価（M機能: ${params.value[0]} P機能: ${params.value[1]}）`,
    },
    xAxis: {
      name: 'M機能',
      min: 0,
      max: 50,
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      name: 'P機能',
      min: 0,
      max: 50,
      nameLocation: 'middle',
      nameGap: 30
    },
    series: [
      {
        name: 'Scatter Data',
        type: 'scatter',
        data: data,
        symbolSize: 10,
        itemStyle: {
          color: (params) => params.dataIndex === 0 ? 'red' : 'blue'
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: {
            type: 'dashed',
            color: 'gray'
          },
          data: [
            {xAxis: 25},
            {yAxis: 25}
          ]
        },
      },
    ],
    graphic: [
      {
        type: 'text',
        left: '20%',
        top: '25%',
        style: {
          text: 'P型\n\n\nリーダーシップ',
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'middle',
          fill: '#4e4e4e'
        }
      },
      {
        type: 'text',
        left: '60%',
        top: '25%',
        style: {
          text: 'PM型\n\n\nリーダーシップ',
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'middle',
          fill: '#4e4e4e'
        }
      },
      {
        type: 'text',
        left: '20%',
        top: '60%',
        style: {
          text: 'pm型\n\n\nリーダーシップ',
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'middle',
          fill: '#4e4e4e'
        }
      },
      {
        type: 'text',
        left: '60%',
        top: '60%',
        style: {
          text: 'M型\n\n\nリーダーシップ',
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'middle',
          fill: '#4e4e4e'
        }
      }
    ]
  };
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="text-h5">結果確認 <span v-if="data">（{{ data.name }}）</span></div>
    <p v-if="data">実施時間: {{ data.timestamp.toDate().toLocaleString() }} </p>
    <p v-if="data">自己診断: M機能: {{ data.selectedValues.mSum }} P機能: {{ data.selectedValues.pSum }}</p>
    <p v-if="requestResults.length > 0">他人の評価:</p>
    <ul v-if="requestResults.length > 0">
      <li v-for="(result, index) in requestResults" :key="index">
        M機能: {{ result.mSum }} P機能: {{ result.pSum }}
      </li>
    </ul>
    <p v-else>データを読み込み中...</p>
    <div>
      <v-chart :option="chartOption" autoresize class="chart"/>
      <span class="text-red">⚫︎ 自己評価の色: 赤</span> <span class="text-blue">⚫︎ 他人の評価の色: 青</span>
    </div>
    <q-banner dense class="bg-grey-2 q-ma-md">
      P（Performance）機能：タスクの目標達成を重視するスタイルです。業績向上や成果を出すための指導、計画の管理など、仕事を効果的に進めることに重点を置きます。<br/>
      M（Maintenance）機能：メンバー間の人間関係やチームの雰囲気を重視するスタイルです。メンバーのモチベーションやサポートに気を配り、良好な関係性を維持することに注力します。<br/>
      <br/>
      診断の結果、リーダーは以下の4つのタイプに分類されます。<br/>
      PM型（成果と人間関係の両方を重視する）<br/>
      Pm型（成果重視で人間関係はあまり重視しない）<br/>
      pM型（人間関係を重視し、成果へのこだわりは低い）<br/>
      pm型（成果も人間関係もあまり重視しない）<br/>
      この診断は、リーダーシップのスタイルがチームのパフォーマンスや士気にどのように影響するかを理解するために役立ち、リーダーとしての強みや改善ポイントを見つけるのに使われます。
    </q-banner>
  </div>
</template>

<style scoped>
.chart {
  height: 400px;
  width: 400px;
}
</style>
