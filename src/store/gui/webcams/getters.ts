import { GetterTree } from 'vuex'
import { GuiWebcamState, GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiWebcam } from '@mdi/js'
import axios from 'axios'

// eslint-disable-next-line
export const getters: GetterTree<GuiWebcamState, any> = {
    getWebcams: (state, getters, rootState, rootGetters) => {
        const webcams = state.webcams.filter((webcam: GuiWebcamStateWebcam) => webcam.enabled)
        /// check if webcam exists
        // eslint-disable-next-line no-var
        var defaultWebcamIsPresent = false
        webcams.forEach((webcam: GuiWebcamStateWebcam) => {
            /// if webcam.stream_url starts with /webcam/
            if (webcam.stream_url.startsWith('/webcam/')) {
                defaultWebcamIsPresent = true
            }
        })
        /// if no default webcam is present, add one, but first check if

        if (defaultWebcamIsPresent == false) {
            /// check if webcam url returns status 200
            axios
                .get(rootGetters['trilab/getMainAddress'] + '/webcam/', {
                    responseType: 'text',
                })
                .then((response) => {
                    if (response.status == 200) {
                        if (
                            state.webcams.filter(
                                (webcam: GuiWebcamStateWebcam) => webcam.stream_url == '/webcam/?action=stream'
                            ).length == 0
                        ) {
                            state.webcams.push({
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
                    }
                })
        }

        return webcams
    },

    getWebcam: (_, getters) => (name: string) => {
        const webcams = getters['getWebcams'] ?? []

        return webcams.find((webcam: GuiWebcamStateWebcam) => webcam.name === name)
    },
}
