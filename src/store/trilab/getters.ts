import Vue from 'vue'
import { TrilabState } from './types'
import { GetterTree } from 'vuex'

export const getters: GetterTree<TrilabState, any> = {
    data: (state) => {
        return state.data
    },
    loading: (state) => state.loading,
    error: (state) => state.error,
    trilabPrefix: (state) => {
        return state.host + '/tpc'
    },
}
