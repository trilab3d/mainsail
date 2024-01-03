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
    setUpdateFile(state, val){
        state.updateFile = val
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
    setAdvancedFeatures(state, value) {
        state.advancedView = value
    },
    setServiceView(state, value) {
        state.serviceView = value
    },
    setHiddenView(state, value) {
        state.hiddenView = value
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
