// app/plugins/font-preload.server.ts v2.0.0
import ztUrl from '@/assets/fonts/zt.ttf?url'
import pmzdUrl from '@/assets/fonts/pmzd.ttf?url'

export default defineNuxtPlugin(() => {
  useHead({
    link: [
      {
        rel: 'preload',
        as: 'font',
        href: ztUrl,
        type: 'font/ttf',
        crossorigin: ''
      },
      {
        rel: 'preload',
        as: 'font',
        href: pmzdUrl,
        type: 'font/ttf',
        crossorigin: ''
      }
    ]
  })
})


