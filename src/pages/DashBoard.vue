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
      PM式リーダーシップ診断（自己評価）を開始しますか？
      <template v-slot:action>
        <q-btn class="text-bold" color="primary"  label="作成" @click="handleStart"/>
      </template>
    </q-banner>
  </div>

  <AssessmentList/>
  <RequestList/>
</template>
