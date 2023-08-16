import Vue from 'vue'
import axios from 'axios'
import { TrilabState } from './types'
import { RootState } from '../types'
import { ActionTree } from 'vuex'

export const actions: ActionTree<TrilabState, any> = {
    async toggleLight(context) {
        axios.post(context.getters.trilabPrefix + '/light/toggle').then((response) => {
            context.commit('setData', {
                //light_data: { state: response.data.state },
                light_state: response.data.state
            })
        })
    },
    lightChangeBrightness(context) {
        const data = {
            brightness: context.state.settings.light_data.brightness,
        }

        axios.post(context.getters.trilabPrefix + '/light/brightness', data, {
            timeout: 5000,
        })
    },
    login(context) {
        axios
            .post(
                context.getters.trilabPrefix + '/login',
                { username: 'service', password: 'password' },
                { withCredentials: true }
            )
            .then((response) => {
                //context.dispatch('sendMessage', { type : "auth" , payload: response.data.name + ":" +  response.data.session});
                console.log(response)
                context.dispatch('onConnected')
            })
            .catch((error) => {
                console.log(error)
            })
        context.commit('setConnected', true)
    },
    onConnected(context) {
        context.dispatch('loadSettings')
        context.dispatch('getWifiStatus')
        if ((window as any)['statisticsInterval'] != undefined) {
            clearInterval((window as any)['statisticsInterval'])
        }
        ;(window as any)['statisticsInterval'] = setInterval(function () {
            context.dispatch('getStatisticsCounters')
        }, 30000)
        context.dispatch('getStatisticsCounters')
    },
    getWifiStatus(context) {
        axios
            .get(context.getters.trilabPrefix + '/network', {
                withCredentials: true,
            })
            .then((response) => {
                context.commit('setNetwork', response.data)
            })
    },
    logout(context) {
        axios
            .post(context.getters.apiPrefix + '/logout')
            .then((response) => {
                console.log(response.data)
            })
            .catch((error) => {
                console.log(error)
            })
        context.commit('setConnected', false)
    },
    loadSettings(context) {
        axios
            .get(context.getters.trilabPrefix + '/settings', {
                withCredentials: true,
            })
            .then((response) => {
                context.commit('setSettings', response.data)
            })
            .catch((error) => {
                console.error(error)
            })
    },
    async saveSettings(context) {
        
        const result = await axios.post(context.getters.trilabPrefix + '/settings', context.state.settings)
        return result
    },
    getStatisticsCounters(context) {
        axios
            .get(context.getters.trilabPrefix + '/statistics/counters')
            .then((response) => {
                const rd = response.data
                context.commit('assignRoot', { statistics: rd })
            })
            .catch((error) => {
                console.error(error)
            })
    },
    onSettingsLoaded(context) {
        if (context.state.settings.automatic_check_update === true) {
            // First check, if localStorage is supported.
            if (window.localStorage) {
                // Get the expiration date of the previous popup.
                const nextPopup: number = parseInt(
                    localStorage.getItem('nextCheckForUpdates') || String(new Date().getTime())
                )
                if (nextPopup < new Date().getTime()) {
                    // Store the expiration date of the current popup in localStorage.
                    const expires = new Date()
                    expires.setHours(expires.getHours() + 2)

                    localStorage.setItem('nextCheckForUpdates', expires.getTime().toString())

                    context.dispatch('checkForUpdates', true)
                }
            }
        }

        context.dispatch('getChangelog')
    },
    async checkForUpdates(context, suppressUptodateMsg = false) {
        context.commit('setSupressUpdateMsg', suppressUptodateMsg)
        axios
            .request({
                method: 'get',
                url: context.getters.apiPrefix + '/softwareupdate/check',
                timeout: 30000,
            })
            .then((response) => {
                const data = response.data

                return true
            })
            .catch((error) => {
                return error
            })
    },
    performUpdate(context, targets) {
        const data = {
            targets: targets,
            //"force": true
        }

        axios.post(context.getters.pluginPrefix + '/softwareupdate/update', {
            data: JSON.stringify(data),
            timeout: 10000,
        })
    },
    getChangelog(context) {
        axios.get(context.getters.trilabPrefix + '/changelog').then((response) => {
            const data = response.data
            if (response.data != undefined) {
                let generatedHTML = ''

                if (data.added.length > 0) {
                    generatedHTML += '<p><b>Added:</b><br>'
                    data.added.forEach(function (n: any) {
                        generatedHTML += n + '<br>'
                    })
                    generatedHTML += '</p>'
                }
                if (data.improved.length > 0) {
                    generatedHTML += '<p><b>Improved:</b><br>'
                    data.improved.forEach(function (n: any) {
                        generatedHTML += n + '<br>'
                    })
                    generatedHTML += '</p>'
                }
                if (data.fixed.length > 0) {
                    generatedHTML += '<p><b>Fixed:</b><br>'
                    data.fixed.forEach(function (n: any) {
                        generatedHTML += n + '<br>'
                    })
                    generatedHTML += '</p>'
                }
                generatedHTML +=
                    '<br><p><span class="glyphicon glyphicon-alert"></span><b> Please check the Google Play store for any potential Delta Control app updates</b></p>'
                context.commit('setChangelog', generatedHTML)
                return generatedHTML
            }
        })
    },
    confirmReadChangelog(context) {
        context.commit('setChangelog', '')
        axios.post(context.getters.trilabPrefix + '/changelog/confirmread')
    },
}
