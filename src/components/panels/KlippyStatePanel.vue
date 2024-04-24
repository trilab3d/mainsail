<template>
    <div v-if="klipperState !== 'ready' && socketIsConnected">
        <template v-if="klippyIsConnected">
            <v-alert :color="messageType.color" dense text border="left" class="mb-0 mb-6">
                <!-- KLIPPER MESSAGE TITLE -->
                <p class="font-weight-medium d-flex align-center">
                    <v-icon :color="messageType.color" class="pr-2">{{ messageType.icon }}</v-icon>
                    {{ $t('Panels.KlippyStatePanel.ServiceReports', { service: 'Klipper' }) }}:
                    {{ klipperState.toUpperCase() }}
                </p>
                <!-- KLIPPER MESSAGE -->
                <div v-if="klippy_message !== null">
                    <pre style="white-space: pre-wrap">{{ klippy_message.trim() }}</pre>
                    <v-divider v-if="klippy_message.indexOf('ADC out of range') != -1" class="mt-2 mb-2"></v-divider>
                    <div v-if="klippy_message.indexOf('ADC out of range') != -1">
                        <!--- TRILAB ADDITION --->
                        <p class="font-weight-medium">
                            <v-icon :color="messageType.color" class="pr-2">{{ mdiFireAlert }}</v-icon>
                        Last known temps (Current/Min - Max):</p>
                        <pre v-for="heater in fullHeatingObjects" :key="heater.name" style="white-space: pre-wrap">{{ heater.name ?? "UNKNOWN" }}: {{ heater.temperature ?? "?" }}°C / {{ heater?.settings?.min_temp ?? "?" }} to {{ heater?.settings?.max_temp ?? "?" }}°C</pre>


                    </div>
                    <v-divider class="mt-2 pb-3"></v-divider>
                    <v-row>
                        <!-- RESTART BUTTONS -->
                        <v-col>
                            <v-btn small outlined text :class="`${messageType.color}--text my-1`" style="width: 100%"
                                @click="restart">
                                <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                                {{ $t('Panels.KlippyStatePanel.Restart') }}
                            </v-btn>
                            <v-btn small outlined text :class="`${messageType.color}--text my-1`" style="width: 100%"
                                @click="firmwareRestart">
                                <v-icon class="mr-sm-2">{{ mdiRestart }}</v-icon>
                                {{ $t('Panels.KlippyStatePanel.FirmwareRestart') }}
                            </v-btn>
                        </v-col>
                        <!-- LOG DOWNLOAD BUTTONS -->
                        <v-col>
                            <v-btn :href="apiUrl + '/server/files/klippy.log'" small outlined text
                                :class="`${messageType.color}--text my-1`" style="width: 100%" @click="downloadLog">
                                <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                                Klipper Log
                            </v-btn>
                            <v-btn :href="apiUrl + '/server/files/moonraker.log'" small outlined text
                                :class="`${messageType.color}--text my-1`" style="width: 100%" @click="downloadLog">
                                <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                                Moonraker Log
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
                <!-- LOADER -->
                <v-card-text v-else class="text-center py-3">
                    <v-progress-circular indeterminate :color="messageType.color"></v-progress-circular>
                </v-card-text>
            </v-alert>
        </template>
        <!-- Power OFF panel -->
        <template v-else-if="isPrinterPowerOff">
            <v-alert dense text border="left" class="mb-6">
                <p class="font-weight-medium d-flex align-center">
                    <v-icon class="pr-2">{{ messageType.icon }}</v-icon>
                    {{ $t('Panels.KlippyStatePanel.PrinterSwitchedOff') }}
                </p>
                <p>{{ $t('Panels.KlippyStatePanel.PrinterSwitchedOffDescription') }}</p>
                <v-row>
                    <v-col class="text-center">
                        <v-btn small outlined text :class="`${messageType.color}--text my-1`" @click="powerOn">
                            <v-icon class="mr-sm-2">{{ mdiPower }}</v-icon>
                            {{ $t('Panels.KlippyStatePanel.PowerOn') }}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-alert>
        </template>
        <!-- DISCONNECTED INFOGRAPHIC -->
        <template v-else-if="klipperState === 'disconnected'">
            <v-alert dense text border="left" class="mb-6">
                <p class="font-weight-medium d-flex align-center">
                    <v-icon class="pr-2">{{ messageType.icon }}</v-icon>
                    {{ $t('Panels.KlippyStatePanel.ServiceReports', { service: 'Moonraker' }) }}:
                    {{ klipperState.toUpperCase() }}
                </p>
                <connection-status :moonraker="true" :klipper="false"></connection-status>
                <p class="mt-2 mb-0 text-center">{{ $t('Panels.KlippyStatePanel.MoonrakerCannotConnect') }}</p>
                <p class="mb-0 text-center">{{ $t('Panels.KlippyStatePanel.CheckKlippyAndUdsAddress') }}</p>
            </v-alert>
        </template>
    </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import TrilabMixin from '../mixins/trilab'
import ConnectionStatus from '../ui/ConnectionStatus.vue'
import Panel from '@/components/ui/Panel.vue'
import {
    mdiRestart,
    mdiDownload,
    mdiMessageOutline,
    mdiAlertOutline,
    mdiRocketLaunch,
    mdiConnection,
    mdiPrinter3d,
    mdiPower,
    mdiFireAlert,
} from '@mdi/js'

@Component({
    components: { Panel, ConnectionStatus },
})

export default class KlippyStatePanel extends Mixins(BaseMixin, TrilabMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiRestart = mdiRestart
    mdiDownload = mdiDownload
    mdiPower = mdiPower
    mdiFireAlert = mdiFireAlert


    loadHeatersInfo() {
        /// printer actions call init action, because if error state, printer is not initialised
        this.$store.dispatch('printer/init', { force: true });


    }

    get fullHeatingObjects() {

        console.log("FULL HEATING OBJECTS:");
        /// trilab
        var heaterNamesList = this.$store.state.printer?.heaters?.available_heaters ?? [];
        /// method from trilabmixin getTrilabTemperatureObject(objectName)
        console.log(heaterNamesList);
        for (var i = 0; i < heaterNamesList.length; i++) {
            heaterNamesList[i] = this.getTrilabTemperatureObject(heaterNamesList[i]);
        }
        console.log(heaterNamesList);
        if (heaterNamesList.length == 0) {
            this.loadHeatersInfo();
        }
        return heaterNamesList;
    }



    get klippy_message() {
        return this.$store.state.server.klippy_message ?? null
    }

    get messageType(): { color: string; icon: string } {
        switch (this.klipperState) {
            case 'startup':
                return { color: 'info', icon: mdiRocketLaunch }
            case 'shutdown':
                return { color: 'warning', icon: mdiAlertOutline }
            case 'error':
                return { color: 'error', icon: mdiAlertOutline }
            case 'disconnected':
                return { color: '', icon: mdiConnection }
            default:
                return { color: '', icon: mdiMessageOutline }
        }
    }

    restart() {
        this.$socket.emit('printer.restart', {}, { loading: 'restart' })
    }

    firmwareRestart() {
        this.$socket.emit('printer.firmware_restart', {}, { loading: 'firmwareRestart' })
    }

    downloadLog(event: any) {
        event.preventDefault()
        let href = ''
        if ('href' in event.target.attributes) href = event.target.attributes.href.value
        if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value

        window.open(href)
    }

    powerOn() {
        this.$socket.emit(
            'machine.device_power.post_device',
            {
                device: this.printerPowerDevice,
                action: 'on',
            },
            { action: 'server/power/responseToggle' }
        )
    }
}
</script>
