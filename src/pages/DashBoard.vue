<script setup>
import {ref} from "vue";
import {signOut} from "firebase/auth";
import {useRouter} from "vue-router";
import AssessmentList from '@/components/AssessmentList.vue';
import RequestList from "@/components/RequestList.vue";

const router = useRouter();

const handleStart = async () => {
  router.push('/selfAssessment');
}

</script>
<template>
  <div class="q-pa-md q-gutter-sm">
    <q-banner dense class="bg-grey-2">
      PM式リーダーシップ診断は、日本の心理学者三隅二不二（みすみ・じふじ）氏によって提唱されたリーダーシップ理論をもとにした診断です。この理論では、リーダーシップの要素を「P（Performance：目標達成機能）」と「M（Maintenance：集団維持機能）」の2つの側面で捉え、リーダーが組織やチームに与える影響を分析します。<br><br>
      PM式リーダーシップ診断（自己評価）を開始しますか？
      <template v-slot:action>
        <q-btn class="text-bold" color="primary"  label="作成" @click="handleStart"/>
      </template>
    </q-banner>
  </div>

  <AssessmentList/>
  <RequestList/>
</template>
