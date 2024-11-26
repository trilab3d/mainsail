import VueRouter from 'vue-router'
import Vue from 'vue'
import routes from '@/routes'
import store from '@/store'

Vue.use(VueRouter)
const router = new VueRouter({ mode: 'history', routes })

router.beforeEach((to, from, next) => {
    const routeFound = routes.find((route) => route.name === to.name)
    const isAuthenticated = store.state.trilab?.hiddenView == true || store.state.trilab?.serviceView == true

    if (routeFound?.securityLevel == 'service' && !isAuthenticated) {
        // Redirect to login if user is not authenticated
        console.log('Not authenticated!')
        next({ name: 'dashboard' })
    } else {
        next() // ok
    }
})

export default router
