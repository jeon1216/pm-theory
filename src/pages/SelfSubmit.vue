<script setup>
import {ref, onMounted} from 'vue';
import { Notify } from 'quasar'
import firebaseApp from "@/firebase.js"
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  where,
  and,
  collection,
  query,
  addDoc
} from "firebase/firestore";
import {useRouter, useRoute} from "vue-router";
import {useAuthStore} from "@/stores/auth.js";

const router = useRouter();
const route = useRoute();
const useAuth = useAuthStore();
const db = getFirestore(firebaseApp);

const data = ref(null);
const emails = ref(['', '']);
const docId = route.params.id;
const confirm = ref(false);

// メール入力ボックスを追加
const addEmail = () => {
  emails.value.push('');
};

// メール入力ボックスを削除
const removeEmail = async (index) => {
  const email = emails.value[index];

  try {
    const docRef = doc(db, 'selfAssessments', docId);
    await updateDoc(docRef, {
      requestAssessmentEmails: arrayRemove(email),
    });

    //requestAssessmentsも削除
    const requestAssessmentsQuery = query(
        collection(db, 'requestAssessments'),
        and(
            where('docId', '==', docId),
            where('email', '==', email)
        )
    );

    const querySnapshot = await getDocs(requestAssessmentsQuery);
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    Notify.create('削除しました。')
  } catch (error) {
    console.error("削除失敗しました: ", error);
  }

  emails.value.splice(index, 1);

};

// 他者評価の対処者を追加
const addRequestAssessmentUpdate = async (email) => {
  try {
    const docRef = doc(db, 'selfAssessments', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const emails = data.requestAssessmentEmails || [];

      // 存在する場合処理しない
      if (emails.includes(email)) {
        Notify.create('依頼リストはすでに存在しています。')
        return;
      }
      // 이메일이 없으면 배열에 추가
      await updateDoc(docRef, {
        requestAssessmentEmails: arrayUnion(email),
      });

      const result = await updateDoc(docRef, {
        requestAssessmentEmails: arrayUnion(email),
      });
      console.log("更新成功: ", result);

      //requestAssessmentsにも追加
      await addDoc(collection(db, 'requestAssessments'), {
        docId: docId,
        email: email,
        requestName: useAuth.user.displayName,
        selectedValues: {},
        timestamp: new Date(),
      });
      Notify.create({message: '依頼リストに追加しました。', color: 'success'})
    } else {
      console.error("存在しないドキュメントです ");
    }
  } catch (error) {
    console.error("アップデート失敗しました: ", error);
  }
}

//完了　dashboardへ移動
const finish = () => {
  router.push('/dashboard');
}


//　メーラーからの転送
const sendEmail = async (index) => {
  const email = emails.value[index];
  const name = useAuth.user.displayName;

  //依頼した人を保存
  await addRequestAssessmentUpdate(email);

  const subject = encodeURIComponent('【PM式リーダーシップ診断】' + name + 'さんの他者評価');
  const body = encodeURIComponent(
      '「' + name + '」から他者評価の依頼が届いています。\n\n' +
      '以下のURLから評価をお願いします。\n\n' +
      '評価はこちらのURLから行うことができます。\n\n' +
      window.location.origin + '#/requestAssessments/' + docId + '\n\n');

  const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

  window.location.href = mailtoLink;
}

const fetchData = async () => {
  try {
    const docRef = doc(db, 'selfAssessments', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      data.value = docSnap.data();
      if (data.value.requestAssessmentEmails.length > 0) {
        emails.value = data.value.requestAssessmentEmails;
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error('Error fetching documents: ', error);
  }
};

onMounted(() => {
  fetchData();
});

</script>

<template>
  <div class="q-pa-md q-gutter-sm">
    <q-banner dense :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'">
      <template v-slot:avatar>
        <q-icon name="feedback" color="primary"/>
      </template>
      <ul>
        <li>他者評価の対象者を追加してください。</li>
        <li>他者診断については、⾃分に部下もしくは後輩がいる場合に、⾃分を上司として診断してもらいます。該当者がいない場合は、同僚でも構いません。</li>
        <li>他者評価は2名以上転送してください。</li>
        <li>該当者のメールに依頼が届けます。</li>
      </ul>
    </q-banner>
  </div>

  <div class="float-right">
    <q-btn class="" size="20px" color="primary" @click="confirm = true">完了</q-btn>
  </div>
  <div class="q-pa-md text-bold">
    <div>
      email：{{ data?.email || "データを読み込み中..." }}
    </div>
    <div>
      提出時間：{{ data?.timestamp ? data.timestamp.toDate().toLocaleString() : "データを読み込み中..." }}
    </div>
  </div>
  <div class="q-pa-md">
    <div class="flex row" v-for="(email, index) in emails" :key="index">
      <q-input class="q-ma-sm" filled v-model="emails[index]" type="email">
        <template v-slot:before>
          <q-icon name="mail"/>
        </template>
      </q-input>
      <q-btn class="q-ma-sm" color="primary" @click="sendEmail(index)">メール送信</q-btn>
      <q-btn class="q-ma-sm" color="red" @click="removeEmail(index)">削除</q-btn>
    </div>
    <q-btn class="q-ma-md" color="primary" @click="addEmail">メール入力ボックスを追加</q-btn>
  </div>

  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="announcement" color="primary" text-color="white" />
        <span class="q-ml-sm">
          メール送信ボタンを押さないと、他者評価の依頼は送信されません。<br/>
          OKボタンを押すとそのままトップ画面に遷移します。
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn flat label="OK" color="primary" v-close-popup @click="finish" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<style scoped>
</style>


