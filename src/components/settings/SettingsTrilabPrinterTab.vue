<template>
    <v-container fluid py-0 px-0>
        <v-row class="pa-3" :dense="$vuetify.breakpoint.mobile">
            <v-col cols="12" md="12" sm="12">
                <v-card elevation="25">
                    <v-card-text>
                        <v-row justify="center" align="center">
                            <v-col>Advanced features: </v-col>
                            <v-col>
                                <v-switch v-model="AdvancedFeatures"></v-switch>

                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="12">
                <settings-light-panel></settings-light-panel>

            </v-col>

        </v-row>
        <v-container class="d-flex align-center justify-center">

            <v-btn @click="save()" color="success">
                <v-icon class="mr-1">mdi-content-save</v-icon>
                {{ $t('General.Save') }}
            </v-btn>
        </v-container>

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


import SystemPanel from '@/components/panels/Machine/SystemPanel.vue'
import store from '@/store'

@Component({
    components: {
        SettingsRow,
        SystemPanel,

    },
})
export default class SettingsPrinterTab extends Mixins(BaseMixin, TrilabMixin) {

    async save() {
        try {
            const result = await this.$store.dispatch('trilab/saveSettings', "printer");
            console.log(result);
            this.$toast.success(this.$t('Files.SuccessfullyUploaded').toString())
        } catch (error) {
            this.$toast.error("An error occured").toString();
        }

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
