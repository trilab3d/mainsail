<template>
    <v-card flat>
        <v-card-text>

            <settings-row title="Klipper">
                <v-btn :href="apiUrl + '/server/files/klippy.log'" block class="primary--text" @click="downloadLog"
                    download>
                    <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                    {{ $t('Trilab.SlicerPanel.Download') }}
                </v-btn>
            </settings-row>
            <v-divider class="my-2"></v-divider>


            <settings-row title="Moonraker">
                <v-btn :href="apiUrl + '/server/files/moonraker.log'" block class="primary--text" @click="downloadLog"
                    download>
                    <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                    {{ $t('Trilab.SlicerPanel.Download') }}
                </v-btn>
            </settings-row>
            <v-divider v-if="existsCrowsnestLog" class="my-2"></v-divider>

            <settings-row v-if="existsCrowsnestLog" title="Crowsnest">
                <v-btn :href="apiUrl + '/server/files/logs/crowsnest.log'" block class="primary--text" download>
                    <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                    {{ $t('Trilab.SlicerPanel.Download') }}
                </v-btn>
            </settings-row>
            <v-divider v-if="existsSonarLog" class="my-2"></v-divider>

            <settings-row v-if="existsSonarLog" title="Sonar">
                <v-btn :href="apiUrl + '/server/files/logs/sonar.log'" block class="primary--text" download>
                    <v-icon class="mr-2">{{ mdiDownload }}</v-icon>
                    {{ $t('Trilab.SlicerPanel.Download') }}
                </v-btn>
            </settings-row>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import TrilabMixin from '../mixins/trilab'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiDownload, mdiFileSyncOutline, mdiCloseThick } from '@mdi/js'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiMenuDown, mdiDelete, mdiPencil, mdiWebcam } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import { FileStateFile } from '@/store/files/types'
import LogfilesPanel from '@/components/panels/Machine/LogfilesPanel.vue'
import { rolloverLogfiles } from '@/store/variables'


import SystemPanel from '@/components/panels/Machine/SystemPanel.vue'
import store from '@/store'

@Component({
    components: {
        SettingsRow,
        SystemPanel,
        LogfilesPanel,

    },
})
export default class SettingsLogsTab extends Mixins(BaseMixin, TrilabMixin) {

    mdiDownload = mdiDownload
    mdiFileSyncOutline = mdiFileSyncOutline
    mdiCloseThick = mdiCloseThick
    rolloverLogfiles = rolloverLogfiles


    public showRolloverDialog = false
    public selectedRolloverLogs: string[] = []

    get logfiles() {
        return this.$store.getters['files/getDirectory']('logs')?.childrens ?? []
    }

    get existsCrowsnestLog(): boolean {
        return this.logfiles.findIndex((log: FileStateFile) => log.filename === 'crowsnest.log') !== -1
    }

    get existsSonarLog(): boolean {
        const sonarLog = this.logfiles.find((log: FileStateFile) => log.filename === 'sonar.log')

        return sonarLog?.size > 0
    }

    get loadingRolloverLogs() {
        return this.loadings.filter((log) => log.startsWith('rolloverLog_')).length > 0
    }

    downloadLog(event: any) {
        //event.preventDefault()
        //let href = ''
        //if ('href' in event.target.attributes) href = event.target.attributes.href.value
        //if ('href' in event.target.parentElement.attributes) href = event.target.parentElement.attributes.href.value

        //window.open(href)
    }

    btnRolloverLogs() {
        if (this.selectedRolloverLogs.length === 0) return

        this.selectedRolloverLogs.forEach((name) => {
            this.$socket.emit(
                'server.logs.rollover',
                { application: name },
                { loading: 'rolloverLog_' + name, action: 'files/rolloverLog' }
            )
        })

        this.selectedRolloverLogs = []
    }

    @Watch('loadingRolloverLogs')
    loadingRolloverLogsChanged(newVal: boolean) {
        if (newVal) this.showRolloverDialog = false
    }

    get isSelecting() {
        return false
    }

    get tab() {
        return null;
    }
}
</script>
