<template>
    <v-container fluid py-0 px-0>
        <v-row class="pa-3" :dense="$vuetify.breakpoint.mobile">
            <v-col cols="12" md="12" sm="12">
                <v-card elevation="25">
                    <v-card-title>{{ $t("Trilab.SettingsTrilabTab.System") }}</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col>{{ $t("Trilab.SettingsTrilabTab.SystemVersion") }} </v-col>
                            <v-col>{{ hostStats.os }}</v-col>
                        </v-row>
                        <v-row>
                            <v-col>{{ $t("Trilab.SettingsTrilabTab.UpdateChannelTitle") }} </v-col>
                            <v-col>
                                {{ $store.state.trilab.settings.release_channel }}
                            </v-col>
                        </v-row>
                        <v-row v-if="TrilabServiceView">
                            <v-col>{{ $t("Trilab.SettingsTrilabTab.WenInterfaceVersion") }} </v-col>
                            <v-col>1.0.1 (Build date: 30.01.2024)</v-col>
                        </v-row>
                        <v-row justify="center" align="center">
                            <v-col>{{ $t("Trilab.SettingsTrilabTab.AutomaticCheckForUpdates") }} </v-col>
                            <v-col>
                                <v-switch v-model="$store.state.trilab.settings.automatic_check_update"></v-switch>
                            </v-col>
                        </v-row>
                        <v-row justify="center" align="center">
                            <v-col>{{ $t("Trilab.SettingsTrilabTab.UploadUpdateFile") }}</v-col>
                            <v-col>
                                <v-btn color="primary" block dark :loading="isSelecting" @click="handleFileImport"
                                    class="mt-3">
                                    {{ $t("Trilab.SettingsTrilabTab.Upload") }}
                                </v-btn>
                                <input ref="fileInputUpdate" class="d-none" type="file" @change="onFileSelected">
                            </v-col>
                        </v-row>
                        <v-row justify="center" align="center">
                            <v-col>
                                <v-btn color="primary" block dark :loading="checkingForUpdate" @click="checkForUpdate()"
                                    class="mt-3">
                                    {{ $t("Trilab.SettingsTrilabTab.CheckForLiveUpdate") }}
                                </v-btn>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import TrilabMixin from '../mixins/trilab'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { GuiWebcamStateWebcam } from '@/store/gui/webcams/types'
import { mdiMenuDown, mdiDelete, mdiPencil, mdiWebcam } from '@mdi/js'
import WebcamMixin from '@/components/mixins/webcam'
import { FileStateFile } from '@/store/files/types'


import TrilabUpdateDialog from '@/components/dialogs/TrilabUpdateDialog.vue'
import SystemPanel from '@/components/panels/Machine/SystemPanel.vue'
import store from '@/store'

@Component({
    components: {
        SettingsRow,
        SystemPanel,
        TrilabUpdateDialog

    },
})
export default class SettingsTrilabTab extends Mixins(BaseMixin, TrilabMixin) {

    handleFileImport() {
        (this.$refs.fileInputUpdate as HTMLInputElement).click();
    }
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files && files.length > 0) {
            const file = files[0];
            console.log(file);
            /// call mutation from trilab/setUpdateFile
            this.$store.commit('trilab/setUpdateFile', file);
        } else {
            /// remove file from trilab/setUpdateFile
            this.$store.commit('trilab/setUpdateFile', null);
        }
    }
    public checkingForUpdate = false;
    

    async checkForUpdate() {
        this.checkingForUpdate = true;
        const result = await this.$store.dispatch('trilab/getLiveUpdateStatus');
        if (result.update_status != "UP_TO_DATE") {
            this.$store.commit('trilab/setData', { showLiveUpdateDialog: true })
        } else {
            this.$toast.info(this.$t("Trilab.SettingsTrilabTab.NoUpdateAvailable").toString() );
        }
        this.checkingForUpdate = false;
    }




    get hostStats() {
        return this.$store.getters['server/getHostStats'] ?? null
    }

    get printerName() {
        return "XXX"
    }
    set printerName(value: string) {
        console.log(value);
    }

    get isSelecting() {
        return false
    }

    get tab() {
        return null;
    }
}
</script>
