import Vue from 'vue'
import { TrilabState } from './types'
import { GetterTree } from 'vuex'
import {    PrinterStateDoorSensors } from '@/store/trilab/types'
import { caseInsensitiveSort } from '@/plugins/helpers'

export const getters: GetterTree<TrilabState, any> = {
    data: (state) => {
        return state.data
    },
    loading: (state) => state.loading,
    error: (state) => state.error,
    trilabPrefix: (state, getters, rootState) => {
        return 'http://' + rootState.socket.hostname + '/tpc'
    },
    getUpdateFile: (state) => {
        return state.updateFile
    },
    getMainAddress: (state, getters, rootState) => {
        return window.location.protocol + '//' + rootState.socket.hostname
    },

    getDoorSensors: (state, getters, rootState) => {
        const sensorObjectNames = ['door_sensor']
        const sensors: PrinterStateDoorSensors[] = []

        console.log(Object.entries(state));

        for (const [key, value] of Object.entries(rootState.printer)) {
            const nameSplit = key.split(' ')

            if (sensorObjectNames.includes(nameSplit[0])) {
                sensors.push({
                    name: key,
                    enabled: ((value) as any).enabled,
                    door_closed: ((value) as any).door_closed,
                })
            }
        }

        return caseInsensitiveSort(sensors, 'name')
    },

}
