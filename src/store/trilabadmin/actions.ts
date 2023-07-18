import Vue from 'vue'
import axios from 'axios'
import { TrilabAdminState } from './types'
import { RootState } from '../types'
import { ActionTree } from 'vuex'

export const actions: ActionTree<TrilabAdminState, any> = {
    async saveSettings(context) {
        const result = await axios.post(context.getters.corePrefix + '/settings', context.state.settings, {
            withCredentials: true,
        })
        return result
    },
    loadSettings(context) {
        axios
            .get(context.getters.corePrefix + '/settings', {
                withCredentials: true,
            })
            .then((response) => {
                context.commit('setSettings', response.data)
            })
            .catch((error) => {
                console.error(error)
            })

        axios
            .get(context.getters.corePrefix + '/bluetooth/mac', {
                withCredentials: true,
            })
            .then((response) => {
                context.commit('assignRoot', { bluetoothMac: response.data.mac })
            })
    },
}
