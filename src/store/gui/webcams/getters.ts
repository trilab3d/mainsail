import { GetterTree } from 'vuex'
import { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiWebcam } from '@mdi/js'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams: (state) => {
        const webcams = state.webcams.filter((webcam: GuiWebcamStateWebcam) => webcam.enabled)
        /// check if webcams is empty array and if so, create a default webcam
        if (webcams.length === 0) {
            webcams.push({
                name: 'Default webcam',
                icon: mdiWebcam,
                service: 'mjpegstreamer-adaptive',
                target_fps: 15,
                stream_url: '/webcam/?action=stream',
                snapshot_url: '/webcam/?action=snapshot',
                rotation: 0,
                flip_horizontal: false,
                flip_vertical: false,
                enabled: true,                
            })
        }

        return webcams
    },

    getWebcam: (_, getters) => (name: string) => {
        const webcams = getters['getWebcams'] ?? []

        return webcams.find((webcam: GuiWebcamStateWebcam) => webcam.name === name)
    },
}
