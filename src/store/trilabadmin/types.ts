export interface TrilabAdminState {
    isConnected: boolean
    isAuthenticated: boolean
    bluetoothMac: string
    settings: {
        advanced_features: boolean
        automatic_check_update: boolean
        bluetooth_name: string
        camera_data: string
        date_of_manufacture: string
        duet_autoconnect_interval: number
        duet_check_config: boolean
        duet_check_eth_interval: number
        duet_check_firmware: boolean
        factory_device_name: string
        last_running_version: string
        light_data: {
            brightness: number
            timeout: number
            timeout_enable: boolean
        }
        login: string
        manufacturer: string
        manufacturer_url: string
        model_description: string
        model_name: string
        model_revision: string
        model_url: string
        network_data: {
            hostname: string
            wifi_ap_channel: number
            wifi_ap_pass: string
            wifi_ap_ssid: string
            wifi_country: string
            wifi_mode: string
            wifi_sta_pass: string
            wifi_sta_ssid: string
        }
        pause_when_door_open: boolean
        release_channel: string
        remote_access: boolean
        serial_number: string
        status_interval: number
        status_led_brightness: number
        timelapse: boolean
        useInternalBT: boolean
        wait_for_hotend_cooling: boolean
    }
}
