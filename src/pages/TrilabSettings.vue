<template>
    <v-container fluid py-0 px-0>
                <v-row class="pa-3" :dense="$vuetify.breakpoint.mobile">
                    <v-col cols="12" md="4" sm="12">
                        <v-card elevation="25">
                            <v-card-title>System</v-card-title>
                            <v-card-text>
                                <v-row>
                                    <v-col>System version: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row>
                                    <v-col>DUET version: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row>
                                    <v-col>Web interface version: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row>
                                    <v-col>Trilab version: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row>
                                    <v-col>Automatic check for updates: </v-col>
                                    <v-col>XXX</v-col>
                                </v-row>
                                <v-row>
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
import BaseMixin from '@/components/mixins/base'
import SettingsPrinterPanel from '@/components/panels/Settings/SettingsPrinterPanel.vue'
import TrilabUpdateDialog from '@/components/dialogs/TrilabUpdateDialog.vue'

import SystemPanel from '@/components/panels/Machine/SystemPanel.vue'
@Component({
    components: {
        SystemPanel,
        SettingsPrinterPanel,
        TrilabUpdateDialog
    },
})
export default class PageTrilabSettings extends Mixins(BaseMixin) {


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
