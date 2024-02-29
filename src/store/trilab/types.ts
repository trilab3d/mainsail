 
  export interface TrilabState {
    socketResponses: Array<String>;
    lastEmitCommand: any;
    updateFile: any;
    showStartDoorOpenDialog: boolean;
    showDoorOpenDialog: boolean;
    showLiveUpdateDialog: boolean;
    updateStateStatus : any;
    askUpdateInterval: any;
    connectedHostname: string;
    advancedView: boolean;
    hiddenView: boolean;
    serviceView: boolean;
    isConnected: boolean;
    data: any;
    loading: boolean;
    host: string;
    socket: any;
    recInterval: any;
    statisticsInterval: any;
    light_state: any;
    interfaces: any;
    settings: {
      automatic_download_update: boolean;
      bluetooth_MAC: "",
      bluetooth_name: "",
      model_name: string;
      model_revision: string;
      manufacturer: string;
      date_of_manufacture: string;
      last_running_version: string;
      locked: boolean; /// locked from public
      manufacturer_url: string;
      model_url: string;
      advanced_features: boolean;
      automatic_check_update: boolean;
      camera_data: string;
      factory_device_name: string;
      hostname: string;
      light_data: {
        brightness: number;
        timeout: number;
        timeout_enable: boolean;
      };
      login: {
        password: string;
        username: string;
      };
      remote_access: {
        auto_off: boolean;
        enabled: boolean;
        username: string;
      };
      serial_number: string;
      light_status: number;
      timelapse: {
        FPS: number;
        interval: number;
        postRoll: number;
        type: string;
      };
      wait_for_hotend_cooling: boolean;
      pause_when_door_open: boolean;
      network_data: {
        hostname: string;
        wifi_ap_channel: number;
        wifi_ap_pass: string;
        wifi_ap_ssid: string;
        wifi_country: string;
        wifi_mode: string;
        wifi_sta_pass: string;
        wifi_sta_ssid: string;
      };
      ///
      release_channel: string;
    };
    statistics: {
      resettable: {
        cancelled_prints: number;
        finished_prints: number;
        last_reset: string;
        printed_filament: number;
        printing_time: number;
      };
      total: {
        cancelled_prints: number;
        finished_prints: number;
        printed_filament: number;
        printing_time: number;
      };
    };
    pluginManager: {
      safe_mode: boolean;
      octoprint: string;
      online: boolean;
      os: string;
      pip: {
        additional_args: any;
        available: boolean;
        install_dir: string;
        python: string;
        use_user: boolean;
        version: string;
        virtual_env: boolean;
      };
      plugins: Array<any>;
    };
    repository: {
      available: boolean;
      plugins: Array<any>;
    };
    network: {
      interfaces: Array<networkInterface>;
    };
    updates: {
      targets: Array<any>;
      supressUpTodateMsg: boolean;
      changelog: string;
    };
    error: any;
    availablePrinters: Array<any>;
    adminAuthenticated: boolean;
  }
  export interface networkInterface {
    interface: string;
    ip: string;
    mac: string;
    type: string;
    wifi: {
      bit_rate: string;
      channel: string;
      signal: string;
    };
  }
