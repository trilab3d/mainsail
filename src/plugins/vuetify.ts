import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import chamberIconVue from '@/components/icons/chamberIcon.vue'
import { Touch, Ripple } from 'vuetify/lib/directives'
Vue.use(Vuetify, {
    directives: { Touch, Ripple },
})

export default new Vuetify({
    theme: {
        dark: true,
        themes: {
            dark: {
                panel: '#1e1e1e',
                toolbar: '#272727',
            },
        },
        options: { customProperties: true },
    },
    icons: {
        iconfont: 'mdiSvg',
        values: {
            chamberIcon:{
                component: chamberIconVue,
            }
        }

    },
    breakpoint: {
        mobileBreakpoint: 768,
    },
})
