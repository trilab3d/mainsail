import Dashboard from '../pages/Dashboard.vue'
import Webcam from '../pages/Webcam.vue'
import Farm from '../pages/Farm.vue'
import Console from '../pages/Console.vue'
import Files from '../pages/Files.vue'
import History from '../pages/History.vue'
import Timelapse from '../pages/Timelapse.vue'
import Machine from '../pages/Machine.vue'
import TrilabSlicers from '../pages/TrilabSlicers.vue'
import TrilabCalibrations from '../pages/TrilabCalibrations.vue'
import { AsyncComponent, Component } from 'vue'

const iconString = `<svg class="v-icon__svg" width="100%" height="100%" x="0" y="0" viewBox='0 0 320 320' xmlns="http://www.w3.org/2000/svg" version="1.1"
style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd"
xmlns:xlink="http://www.w3.org/1999/xlink">
<g>
    <path style="opacity:0.365" fill="#a8a8a8"
        d="M 192.5,11.5 C 180.158,11.5232 167.825,11.5232 155.5,11.5C 167.827,10.1884 180.16,10.1884 192.5,11.5 Z" />
</g>
<g>
    <path style="opacity:1" fill="#6e6e6e"
        d="M 155.5,11.5 C 167.825,11.5232 180.158,11.5232 192.5,11.5C 219.713,15.8566 243.213,27.5233 263,46.5C 263.667,47.1667 263.667,47.8333 263,48.5C 203.024,108.476 143.357,168.143 84,227.5C 52.2162,194.793 40.5495,155.793 49,110.5C 64.1303,55.5348 99.6303,22.5348 155.5,11.5 Z" />
</g>
<g>
    <path style="opacity:1" fill="#e5e4e4"
        d="M 232.5,93.5 C 236.415,95.7433 239.749,98.7433 242.5,102.5C 272.54,142.283 278.707,185.95 261,233.5C 237.484,282.853 198.318,308.52 143.5,310.5C 117.043,309.736 92.7097,302.236 70.5,288C 64.9813,283.738 59.6479,279.238 54.5,274.5C 53.479,273.998 53.3123,273.332 54,272.5C 113.701,212.965 173.201,153.299 232.5,93.5 Z" />
</g>
</svg>`;
import {
    mdiMonitorDashboard,
    mdiWebcam,
    mdiConsoleLine,
    mdiGrid,
    mdiFileDocumentMultipleOutline,
    mdiVideo3d,
    mdiHistory,
    mdiTimelapse,
    mdiWrench,
    mdiPencilRuler,
} from '@mdi/js'
import store from '@/store'

const routes: AppRoute[] = [
    {
        title: 'Dashboard',
        path: '/',
        icon: mdiMonitorDashboard,
        component: Dashboard,
        alwaysShow: true,
        showInNavi: true,
        position: 10,
    },
    {
        title: 'Printers',
        path: '/allPrinters',
        identificator: 'printers',
        component: Farm,
        alwaysShow: false,
        showInNavi: false,
    },
    {
        title: 'Webcam',
        path: '/cam',
        icon: mdiWebcam,
        component: Webcam,
        alwaysShow: true,
        showInNavi: true,
        position: 20,
    },
    {
        title: 'Console',
        path: '/console',
        icon: mdiConsoleLine,
        component: Console,
        alwaysShow: true,
        showInNavi: true,
        identificator: 'console',
        klipperIsConnected: true,
        position: 30,
    },
    {
        title: 'Heightmap',
        path: '/heightmap',
        icon: mdiGrid,
        component: () => import('../pages/Heightmap.vue'),
        alwaysShow: false,
        showInNavi: true,
        identificator: 'heightmap',
        klipperComponent: 'bed_mesh',
        position: 40,
    },
    {
        title: 'G-Code Files',
        path: '/files',
        icon: mdiFileDocumentMultipleOutline,
        component: Files,
        alwaysShow: true,
        showInNavi: true,
        identificator: 'gfiles',
        registeredDirectory: 'gcodes',
        position: 50,
    },
    {
        title: 'G-Code Viewer',
        path: '/viewer',
        icon: mdiVideo3d,
        component: () => import('../pages/Viewer.vue'),
        alwaysShow: true,
        identificator: 'gviewer',
        showInNavi: true,
        position: 60,
    },
    {
        title: 'History',
        path: '/history',
        icon: mdiHistory,
        component: History,
        alwaysShow: true,
        showInNavi: true,
        moonrakerComponent: 'history',
        position: 70,
    },
    {
        title: 'Timelapse',
        path: '/timelapse',
        icon: mdiTimelapse,
        component: Timelapse,
        alwaysShow: true,
        showInNavi: true,
        moonrakerComponent: 'timelapse',
        position: 80,
    },
    {
        title: 'Machine',
        path: '/config',
        icon: mdiWrench,
        component: Machine,
        alwaysShow: true,
        identificator: 'machine',
        showInNavi: true,
        position: 90,
    },
    {
        title: 'Slicers',
        path: '/slicers',
        iconString: iconString,
        component: TrilabSlicers,
        alwaysShow: true,
        identificator: 'slicers',
        showInNavi: true,
        position: 90,
    },
    {
        title: 'Calibration',
        path: '/trilabcalibration',
        icon: mdiPencilRuler,
        component: TrilabCalibrations,
        alwaysShow: true,
        identificator: 'trilabcalibration',
        showInNavi: true,
        position: 90,
    },
    {
        title: null,
        component: null,
        alwaysShow: false,
        showInNavi: false,
        path: '/settings/machine',
        redirect: '/config',
    },
]

export default routes;

export interface AppRoute {
    title: string | null
    path: string
    redirect?: string
    icon?: string
    iconString?: string
    customIcon?: string
    component: Component | AsyncComponent | null
    alwaysShow: boolean
    showInNavi: boolean
    identificator?: string
    condition?: any
    registeredDirectory?: string
    moonrakerComponent?: string
    klipperComponent?: string
    klipperIsConnected?: boolean
    children?: AppRoute[]
    position?: number
}
