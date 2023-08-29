import Vue from 'vue'
import { getDefaultState } from './index'
import { MutationTree } from 'vuex'
import { TrilabState } from './types'
import { setDataDeep } from '../../plugins/helpers'

export const mutations: MutationTree<TrilabState> = {
    setData(state, payload) {
        setDataDeep(state, payload)
    },
    setConnected(state, val) {
        state.isConnected = val
    },
    setAdminAuthenticated(state, val) {
        state.adminAuthenticated = val
    },
    setHost(state, host) {
        state.host = host
    },
    setConnectedHostname(state, hostname) {
        state.connectedHostname = hostname
    },
    setSocket(state, socket) {
        state.socket = socket
    },
    setSettings(state, settings) {
        state.settings = settings
    },
    setPluginManager(state, object) {
        state.pluginManager = object
    },
    setrecInterval(state, val) {
        state.recInterval = val
    },
    clearrecInterval(state) {
        clearInterval(state.recInterval)
    },
    setNetwork(state, updateObject) {
        state.network = updateObject
    },
    setAdvancedFeatures(state) {
        state.advancedView = !state.advancedView
    },
    setServiceView(state) {
        state.serviceView = !state.serviceView
    },
    setHiddenView(state) {
        state.hiddenView = !state.hiddenView
    },
    setChangelog(state, val) {
        state.updates.changelog = val
    },
    setSupressUpdateMsg(state, val) {
        state.updates.supressUpTodateMsg = val
    },
    addUpdateTarget(state, target) {
        state.updates.targets.push(target)
    },
}
