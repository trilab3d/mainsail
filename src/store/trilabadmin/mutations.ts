import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { TrilabAdminState } from './types'
import { setDataDeep } from '../../plugins/helpers'

export const mutations: MutationTree<TrilabAdminState> = {
    setData(state, payload) {
        setDataDeep(state, payload)
    },
    setConnected(state, val) {
        state.isConnected = val
    },
    setAuthenticated(state, val) {
        state.isAuthenticated = val
    },
    assignSetting(state, updateObject) {
        setDataDeep(state.settings, updateObject)
    },
    assignRoot(state, updateObject) {
        setDataDeep(state, updateObject)
    },
    setSettings(state, settings) {
        state.settings = settings;
    },
}
