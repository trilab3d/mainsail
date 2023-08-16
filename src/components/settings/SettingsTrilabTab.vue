<template>
    <v-container fluid py-0 px-0>
        <trilab-update-dialog :file="file"></trilab-update-dialog>
                <v-row class="pa-3" :dense="$vuetify.breakpoint.mobile">
                    <v-col cols="12" md="12" sm="12">
                        <v-card elevation="25">
                            <v-card-title>System</v-card-title>
                            <v-card-text>
                                <v-row>
                                    <v-col>System version: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row>
                                    <v-col>Web interface version: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row justify="center" align="center">
                                    <v-col>Automatic check for updates: </v-col>
                                    <v-col>
                                        <v-switch v-model="$store.state.trilab.settings.automatic_check_update"></v-switch>
                                    </v-col>
                                </v-row>
                                <v-row justify="center" align="center">
                                    <v-col>Update system</v-col>
                                    <v-col>
                                        <v-btn color="primary" block dark :loading="isSelecting" @click="handleFileImport"
                                            class="mt-3">
                                            Upload
                                        </v-btn>
                                        <input ref="fileInputUpdate" class="d-none" type="file" @change="onFileSelected">
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


import SettingsPrinterPanel from '@/components/panels/Settings/SettingsPrinterPanel.vue'
import TrilabUpdateDialog from '@/components/dialogs/TrilabUpdateDialog.vue'
import SystemPanel from '@/components/panels/Machine/SystemPanel.vue'
import store from '@/store'

@Component({
    components: {
        SettingsRow,
        SystemPanel,
        SettingsPrinterPanel,
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
            this.file = file;
        }
    }

    file: File | null = null;

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
