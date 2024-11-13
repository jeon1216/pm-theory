// users Data Page
export default [
  {
    path: '/dashBoard',
    name: 'dashBoard',
    component: () => import('@/pages/DashBoard.vue'),
    meta: {title: 'DashBoard'}
  },
  {
    path: '/selfAssessment',
    name: 'selfAssessment',
    component: () => import('@/pages/SelfAssessment.vue'),
    meta: {title: 'PM式リーダーシップ診断（自己評価）'}
  },
  {
    path: '/requestAssessments/:id',
    name: 'requestAssessments',
    component: () => import('@/pages/RequestrAssessment.vue'),
    meta: {title: 'PM式リーダーシップ診断（他者評価）'},
    props: route => ({id: route.params.id}),
  },
  {
    path: '/selfSubmit/:id',
    name: 'selfSubmit',
    component: () => import('@/pages/SelfSubmit.vue'),
    meta: {title: 'PM式リーダーシップ診断（自己評価）：提出'},
    props: route => ({id: route.params.id}),
  },
  {
    path: '/ResultAssessment/:id',
    name: 'ResultAssessment',
    component: () => import('@/pages/ResultAssessment.vue'),
    meta: {title: 'PM式リーダーシップ診断：結果'},
    props: route => ({id: route.params.id}),
  },
  {
    path: '/thankYou',
    name: 'thankYou',
    component: () => import('@/pages/ThankYou.vue'),
    meta: {title: '終了'},
  },
];