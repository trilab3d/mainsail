<template>
    <div>
        <v-app-bar app elevate-on-scroll :height="topbarHeight" class="topbar pa-0" clipped-left>
            <v-app-bar-nav-icon tile @click.stop="naviDrawer = !naviDrawer"></v-app-bar-nav-icon>
            <router-link to="/">
                <template v-if="sidebarLogo">
                    <img :src="sidebarLogo" style="height: 32px" class="nav-logo ml-4 mr-1 d-none d-sm-flex" alt="Logo" />
                </template>
                <template v-else>
                    <mainsail-logo :color="logoColor" style="height: 32px" class="nav-logo ml-4 mr-1 d-none d-sm-flex"
                        router to="/" :ripple="false"></mainsail-logo>
                </template>
            </router-link>
            <v-toolbar-title class="text-no-wrap ml-0 pl-2 mr-2">{{ printerName }}</v-toolbar-title>
            <printer-selector v-if="countPrinters"></printer-selector>
            <v-divider
                v-if="$store.state.trilab.advancedView || $store.state.trilab.hiddenView || $store.state.trilab.serviceView"
                class="mx-2" vertical></v-divider>
            <v-chip v-if="$store.state.trilab.advancedView" color="#C0CBD8">
                <v-icon class="d-md-none">{{ mdiPaletteAdvanced }}</v-icon>
                <b class="hidden-md-and-down">{{ $t('App.TopBar.ViewStatus.Advanced') }}</b>
            </v-chip>
            <v-chip v-if="$store.state.trilab.hiddenView" color="#31FF3C">
                <b>{{ $t("Trilab.TheTopbar.HiddenViewEnbled") }}</b>
            </v-chip>
            <v-chip v-if="$store.state.trilab.serviceView" color="#FF4820">
                <b>{{ $t("Trilab.TheTopbar.ServiceViewEnabled") }}</b>
            </v-chip>
            <v-divider v-if="liveUpdateStatus != 'UP_TO_DATE'" class="mx-2" vertical></v-divider>
            <v-chip v-if="liveUpdateStatus != 'UP_TO_DATE'" color="#FFA500" @click="showLiveUpdateDialogAction()">
                <b> {{ $t('TrilabLiveUpdate.statuses.' + liveUpdateStatus) }} </b>
            </v-chip>

            <v-spacer></v-spacer>
            <input ref="fileUploadAndStart" type="file" :accept="gcodeInputFileAccept.join(', ')" style="display: none"
                @change="uploadAndStart" />
            <v-btn v-if="showSaveConfigButton" tile :icon="$vuetify.breakpoint.smAndDown"
                :text="$vuetify.breakpoint.mdAndUp" color="primary"
                class="button-min-width-auto px-3 d-none d-sm-flex save-config-button" :disabled="printerIsPrinting"
                :loading="loadings.includes('topbarSaveConfig')" @click="saveConfig">
                <v-icon class="d-md-none">{{ mdiContentSave }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.SAVE_CONFIG') }}</span>
            </v-btn>
            <t-light-btn></t-light-btn>
            <v-btn v-if="TrilabServiceView" tile :icon="$vuetify.breakpoint.smAndDown" :text="$vuetify.breakpoint.mdAndUp"
                color="primary" :disabled="['printing'].includes(printer_state)"
                class="button-min-width-auto px-3 d-none d-sm-flex home-button upload-and-start-button" @click="doHome">
                <v-icon class="mr-md-2">{{ mdiHome }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.HomeBtn') }}</span>
            </v-btn>
            <v-btn v-if="boolShowUploadAndPrint" tile :icon="$vuetify.breakpoint.smAndDown"
                :text="$vuetify.breakpoint.mdAndUp" color="primary"
                class="button-min-width-auto px-3 d-none d-sm-flex upload-and-start-button"
                :loading="loadings.includes('btnUploadAndStart')" @click="btnUploadAndStart">
                <v-icon class="mr-md-2">{{ mdiFileUpload }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.UploadPrint') }}</span>
            </v-btn>
            <v-btn v-if="klippyIsConnected" tile :icon="$vuetify.breakpoint.smAndDown" :text="$vuetify.breakpoint.mdAndUp"
                color="error" class="button-min-width-auto px-3 emergency-button"
                :loading="loadings.includes('topbarEmergencyStop')" @click="btnEmergencyStop">
                <v-icon class="mr-md-2">{{ mdiAlertOctagonOutline }}</v-icon>
                <span class="d-none d-md-inline">{{ $t('App.TopBar.EmergencyStop') }}</span>
            </v-btn>
            <the-notification-menu></the-notification-menu>
            <the-settings-menu></the-settings-menu>
            <the-top-corner-menu></the-top-corner-menu>
        </v-app-bar>
        <v-snackbar v-model="uploadSnackbar.status" :timeout="-1" :value="true" fixed right bottom dark>
            <strong>{{ $t('App.TopBar.Uploading') }} {{ uploadSnackbar.filename }}</strong>
            <br />
            {{ Math.round(uploadSnackbar.percent) }} % @ {{ formatFilesize(Math.round(uploadSnackbar.speed)) }}/s
            <br />
            <v-progress-linear class="mt-2" :value="uploadSnackbar.percent"></v-progress-linear>
            <template #action="{ attrs }">
                <v-btn color="red" text v-bind="attrs" style="min-width: auto" @click="cancelUpload">
                    <v-icon class="0">{{ mdiClose }}</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="showEmergencyStopDialog" width="400" :fullscreen="isMobile">
            <panel :title="$t('EmergencyStopDialog.EmergencyStop').toString()" toolbar-color="error"
                card-class="emergency-stop-dialog" :icon="mdiAlertOctagonOutline" :margin-bottom="false">
                <template #buttons>
                    <v-btn icon tile @click="showEmergencyStopDialog = false">
                        <v-icon>{{ mdiCloseThick }}</v-icon>
                    </v-btn>
                </template>
                <v-card-text>{{ $t('EmergencyStopDialog.AreYouSure') }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showEmergencyStopDialog = false">{{ $t('EmergencyStopDialog.No') }}</v-btn>
                    <v-btn color="primary" text @click="emergencyStop">{{ $t('EmergencyStopDialog.Yes') }}</v-btn>
                </v-card-actions>
            </panel>
        </v-dialog>
        <trilab-update-dialog-live :showp="showLiveUpdateDialog"
            @closeLiveUpdateDialog="closeLiveUpdateDialog()"></trilab-update-dialog-live>
        <trilab-start-door-open-dialog></trilab-start-door-open-dialog>
        <trilab-print-door-open-dialog></trilab-print-door-open-dialog>

    </div>
</template>

<script lang="ts">
import TrilabStartDoorOpenDialog from '@/components/dialogs/TrilabStartDoorOpenDialog.vue'
import TrilabPrintDoorOpenDialog from '@/components/dialogs/TrilabPrintDoorOpenDialog.vue'
import { Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TrilabMixin from './mixins/trilab'
import { validGcodeExtensions } from '@/store/variables'
import Component from 'vue-class-component'
import axios from 'axios'
import { formatFilesize } from '@/plugins/helpers'
import TheTopCornerMenu from '@/components/TheTopCornerMenu.vue'
import TheSettingsMenu from '@/components/TheSettingsMenu.vue'
import TrilabUpdateDialogLive from '@/components/dialogs/TrilabUpdateDialogLive.vue'
import Panel from '@/components/ui/Panel.vue'
import PrinterSelector from '@/components/ui/PrinterSelector.vue'
import MainsailLogo from '@/components/ui/MainsailLogo.vue'
import TheNotificationMenu from '@/components/notifications/TheNotificationMenu.vue'
import { topbarHeight } from '@/store/variables'
import { mdiAlertOctagonOutline, mdiContentSave, mdiFileUpload, mdiClose, mdiCloseThick, mdiHome, mdiLightbulbOff, mdiLightbulbOn, mdiPaletteAdvanced } from '@mdi/js'
import ControlMixin from './mixins/control'
import { Watch } from 'vue-property-decorator'

type uploadSnackbar = {
    status: boolean
    filename: string
    percent: number
    speed: number
    total: number
    cancelTokenSource: any
    lastProgress: {
        time: number
        loaded: number
    }
}

@Component({
    components: {
        Panel,
        TheSettingsMenu,
        TheTopCornerMenu,
        PrinterSelector,
        MainsailLogo,
        TrilabUpdateDialogLive,
        TheNotificationMenu,
        TrilabStartDoorOpenDialog,
        TrilabPrintDoorOpenDialog,
    },
})
export default class TheTopbar extends Mixins(BaseMixin, ControlMixin, TrilabMixin) {
    mdiAlertOctagonOutline = mdiAlertOctagonOutline
    mdiContentSave = mdiContentSave
    mdiFileUpload = mdiFileUpload
    mdiClose = mdiClose
    mdiCloseThick = mdiCloseThick
    mdiHome = mdiHome
    mdiLightbulbOff = mdiLightbulbOff
    mdiLightbulbOn = mdiLightbulbOn
    mdiPaletteAdvanced = mdiPaletteAdvanced


    lightFirstRun = false

    topbarHeight = topbarHeight
    showEmergencyStopDialog = false

    uploadSnackbar: uploadSnackbar = {
        status: false,
        filename: '',
        percent: 0,
        speed: 0,
        total: 0,
        cancelTokenSource: null,
        lastProgress: {
            time: 0,
            loaded: 0,
        },
    }

    formatFilesize = formatFilesize

    declare $refs: {
        fileUploadAndStart: HTMLFormElement
    }


    get showLiveUpdateDialog() {
        return this.$store.state.trilab.showLiveUpdateDialog;
    }
    set showLiveUpdateDialog(value) {
        this.$store.commit('trilab/setData', { showLiveUpdateDialog: value })
    }

    get gcodeInputFileAccept() {
        if (this.isIOS) return []

        return validGcodeExtensions
    }


    get naviDrawer() {
        return this.$store.state.naviDrawer
    }

    set naviDrawer(newVal) {
        this.$store.dispatch('setNaviDrawer', newVal)
    }

    get currentPage() {
        return this.$route.fullPath
    }

    get saveConfigPending() {
        return this.$store.state.printer.configfile?.save_config_pending ?? false
    }

    get hideSaveConfigForBedMash() {
        return this.$store.state.gui.uiSettings.hideSaveConfigForBedMash ?? false
    }

    get showSaveConfigButton() {
        if (!this.klipperReadyForGui) return false
        if (!this.TrilabServiceView) { return false; }
        if (!this.hideSaveConfigForBedMash) return this.saveConfigPending
        let pendingKeys = Object.keys(this.$store.state.printer.configfile?.save_config_pending_items ?? {})
        pendingKeys = pendingKeys.filter((key: string) => !key.startsWith('bed_mesh '))

        return pendingKeys.length > 0
    }

    get printerName(): string {
        if (this.$store.state.gui.general.printername.length) return this.$store.state.gui.general.printername

        return this.$store.state.printer.hostname
    }

    get boolWideNavDrawer() {
        return this.$store.state.gui.uiSettings.boolWideNavDrawer ?? false
    }

    get countPrinters() {
        return this.$store.getters['farm/countPrinters']
    }

    get boolHideUploadAndPrintButton() {
        return this.$store.state.gui.uiSettings.boolHideUploadAndPrintButton ?? false
    }

    get sidebarLogo(): string {
        return this.$store.getters['files/getSidebarLogo']
    }

    get logoColor(): string {
        return this.$store.state.gui.uiSettings.logo
    }

    get boolShowUploadAndPrint() {
        return (
            this.klippyIsConnected &&
            this.existGcodesRootDirectory &&
            ['standby', 'complete', 'cancelled'].includes(this.printer_state) &&
            !this.boolHideUploadAndPrintButton
        )
    }


    showLiveUpdateDialogAction() {
        this.showLiveUpdateDialog = true;
        this.$store.dispatch('trilab/setupLiveUpdateTimer', 2000);
    }
    closeLiveUpdateDialog() {
        this.showLiveUpdateDialog = false;
        this.$store.dispatch('trilab/setupLiveUpdateTimer', 30000);
    }

    btnEmergencyStop() {
        const confirmOnEmergencyStop = this.$store.state.gui.uiSettings.confirmOnEmergencyStop
        if (confirmOnEmergencyStop) {
            this.showEmergencyStopDialog = true
        } else {
            this.emergencyStop()
        }
    }

    emergencyStop() {
        this.showEmergencyStopDialog = false
        this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' })
    }

    saveConfig() {
        this.$store.dispatch('server/addEvent', { message: 'SAVE_CONFIG', type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: 'SAVE_CONFIG' }, { loading: 'topbarSaveConfig' })
    }

    btnUploadAndStart() {
        this.$refs.fileUploadAndStart.click()
    }

    async uploadAndStart() {
        if (this.$refs.fileUploadAndStart?.files.length) {
            await this.$store.dispatch('socket/addLoading', { name: 'btnUploadAndStart' })
            let successFiles = []
            for (const file of this.$refs.fileUploadAndStart?.files || []) {
                const result = await this.doUploadAndStart(file)
                successFiles.push(result)
            }

            await this.$store.dispatch('socket/removeLoading', { name: 'btnUploadAndStart' })
            for (const file of successFiles) {
                const text = this.$t('App.TopBar.UploadOfFileSuccessful', { file: file }).toString()
                this.$toast.success(text)
            }

            this.$refs.fileUploadAndStart.value = ''
            if (this.currentPage !== '/') await this.$router.push('/')
        }
    }

    doUploadAndStart(file: File) {
        const formData = new FormData()
        const filename = file.name

        this.uploadSnackbar.filename = filename
        this.uploadSnackbar.status = true
        this.uploadSnackbar.percent = 0
        this.uploadSnackbar.speed = 0
        this.uploadSnackbar.lastProgress.loaded = 0
        this.uploadSnackbar.lastProgress.time = 0

        formData.append('file', file, filename)
        formData.append('print', 'true')

        return new Promise((resolve) => {
            this.uploadSnackbar.cancelTokenSource = axios.CancelToken.source()
            axios
                .post(this.apiUrl + '/server/files/upload', formData, {
                    cancelToken: this.uploadSnackbar.cancelTokenSource.token,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent: ProgressEvent) => {
                        this.uploadSnackbar.percent = (progressEvent.loaded * 100) / progressEvent.total
                        if (this.uploadSnackbar.lastProgress.time) {
                            const time = progressEvent.timeStamp - this.uploadSnackbar.lastProgress.time
                            const data = progressEvent.loaded - this.uploadSnackbar.lastProgress.loaded

                            if (time) this.uploadSnackbar.speed = data / (time / 1000)
                        }

                        this.uploadSnackbar.lastProgress.time = progressEvent.timeStamp
                        this.uploadSnackbar.lastProgress.loaded = progressEvent.loaded
                        this.uploadSnackbar.total = progressEvent.total
                    },
                })
                .then((result) => {
                    this.uploadSnackbar.status = false
                    resolve(result.data.result)
                })
                .catch(() => {
                    this.uploadSnackbar.status = false
                    this.$store.dispatch('socket/removeLoading', { name: 'btnUploadAndStart' })
                    const text = this.$t('App.TopBar.CannotUploadTheFile').toString()
                    this.$toast.error(text)
                })
        })
    }

    cancelUpload(): void {
        this.uploadSnackbar.cancelTokenSource.cancel()
        this.uploadSnackbar.status = false
    }

}
</script>

<style>
/*noinspection CssUnusedSymbol*/
.topbar .v-toolbar__content {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}
</style>
<style scoped>
.button-min-width-auto {
    min-width: auto !important;
}

/*noinspection CssUnusedSymbol*/
.topbar .v-btn {
    height: 100% !important;
    max-height: none;
}

/*noinspection CssUnusedSymbol*/
.topbar .v-btn.v-btn--icon {
    /*noinspection CssUnresolvedCustomProperty*/
    width: var(--topbar-icon-btn-width) !important;
}

/*noinspection CssUnusedSymbol*/
@media (min-width: 768px) {
    header.topbar {
        z-index: 8 !important;
    }
}
</style>
