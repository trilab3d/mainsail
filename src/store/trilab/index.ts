import axios from 'axios'
//import SockJS from 'sockjs-client'
import { Module } from 'vuex'
import {TrilabState} from './types'
import { actions } from '@/store/trilab/actions'
import { mutations } from '@/store/trilab/mutations'
import { getters } from '@/store/trilab/getters'

/**
 * Type of a Vuex machine module
 */


export const getDefaultState = (): TrilabState => {
    return {
            ///trilab
            connectedHostname: '',
            advancedView: false,
            hiddenView: false,
            serviceView: false,
            data: {},
            socket: false,
            loading: false,
            isConnected: false,
            host: window.location.origin,
            recInterval: null,
            statisticsInterval: null,
            light_state: null,
            settings: {
                model_name: '',
                model_revision: '',
                last_running_version: "",
                manufacturer: '',
                manufacturer_url: '',
                model_url: '',
                advanced_features: false,
                automatic_check_update: true,
                automatic_download_update: true,
                bluetooth_MAC: "",
                bluetooth_name: "",
                camera_data: 'external',
                factory_device_name: '',
                hostname: '',
                light_data: {
                    brightness: 0,
                    timeout: 0,
                    timeout_enable: false,
                },
                login: {
                    password: '',
                    username: '',
                },
                remote_access: {
                    auto_off: false,
                    enabled: true,
                    username: '',
                },
                serial_number: '',
                light_status: 0,
                timelapse: {
                    FPS: 25,
                    interval: 10,
                    postRoll: 10,
                    type: 'timed',
                },
                wait_for_hotend_cooling: false,
                pause_when_door_open: true,
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
                ///
                release_channel: '',
                date_of_manufacture: '',
            },

            statistics: {
                resettable: {
                    cancelled_prints: 0,
                    finished_prints: 0,
                    last_reset: '',
                    printed_filament: 0,
                    printing_time: 0,
                },
                total: {
                    cancelled_prints: 0,
                    finished_prints: 0,
                    printed_filament: 0,
                    printing_time: 0,
                },
            },

            pluginManager: {
                safe_mode: false,
                octoprint: '',
                online: false,
                os: '',
                pip: {
                    additional_args: null,
                    available: true,
                    install_dir: '',
                    python: '',
                    use_user: false,
                    version: '',
                    virtual_env: false,
                },
                plugins: [],
            },
            repository: {
                available: false,
                plugins: [],
            },
            network: {
                interfaces: [
                    {
                        interface: '',
                        ip: '',
                        mac: '',
                        type: '',
                        wifi: {
                            bit_rate: '',
                            channel: '',
                            signal: '',
                        },
                    },
                ],
            },

            updates: {
                targets: [],
                supressUpTodateMsg: false,
                changelog: '',
            },
            ////  loading: false,
            error: null,
            availablePrinters: [],
            adminAuthenticated: false,
        }

}
// initial state
const state = getDefaultState()

export const trilab: Module<TrilabState, any> = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
    modules: {
        //trilabadmin,
    },
}
