import axios from 'axios'
//import SockJS from 'sockjs-client'
import { Module } from 'vuex'
import { TrilabAdminState } from './types'
import { actions } from './actions'
import { mutations } from './mutations'
import { getters } from './getters'

/**
 * Type of a Vuex machine module
 */

export const getDefaultState = (): TrilabAdminState => {
    return {
        isConnected: false,
        isAuthenticated: false,
        bluetoothMac: '',
        settings: {
            advanced_features: false,
            automatic_check_update: false,
            bluetooth_name: '',
            camera_data: '',
            date_of_manufacture: '',
            duet_autoconnect_interval: 0,
            duet_check_config: false,
            duet_check_eth_interval: 0,
            duet_check_firmware: false,
            factory_device_name: '',
            last_running_version: '',
            light_data: {
                brightness: 0,
                timeout: 0,
                timeout_enable: false,
            },
            login: '',
            manufacturer: '',
            manufacturer_url: '',
            model_description: '',
            model_name: '',
            model_revision: '',
            model_url: '',
            network_data: {
                hostname: '',
                wifi_ap_channel: 0,
                wifi_ap_pass: '',
                wifi_ap_ssid: '',
                wifi_country: '',
                wifi_mode: '',
                wifi_sta_pass: '',
                wifi_sta_ssid: '',
            },
            pause_when_door_open: false,
            release_channel: '',
            remote_access: false,
            serial_number: '',
            status_interval: 0,
            status_led_brightness: 0,
            timelapse: false,
            useInternalBT: false,
            wait_for_hotend_cooling: false,
        },
    }
}
// initial state
const state = getDefaultState()

export const trilab: Module<TrilabAdminState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {},
}
