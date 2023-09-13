import { GetterTree } from 'vuex'
import { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiWebcam } from '@mdi/js'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams: (state) => {
        const webcams: GuiWebcamStateWebcam[] = []

        Object.keys(state.webcams).forEach((id: string) => {
            webcams.push({ ...state.webcams[id], id })
        })

        /// check if webcams is empty array and if so, create a default webcam
        if (webcams.length === 0) {
            webcams.push({
                name: "Default webcam",
                icon: mdiWebcam,
                service: 'mjpegstreamer-adaptive',
                targetFps: 15,
                urlStream: '/webcam/?action=stream',
                urlSnapshot: '/webcam/?action=snapshot',
                rotate: 0,
                flipX: false,
                flipY: false        
            })
        }

        return webcams
    },

    getWebcam: (state, getters) => (camId: string) => {
        const webcams = getters['getWebcams'] ?? []

        return webcams.find((webcam: GuiWebcamStateWebcam) => webcam.id === camId)
    },
}
