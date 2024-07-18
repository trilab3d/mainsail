<style scoped>
/* only for screen with viewport height less than 800px and min 600px */
@media screen and (max-height: 800px) and (min-height: 600px) {
    .tlb_responsive_height {
        min-height: 150px;
        max-height: 30vh;
        margin: 0 auto;
        display: block;
        width: 50%;
    }
}

@media screen and (max-height: 599px) and (min-height: 0px) {
    .tlb_responsive_height {
        min-height: 50px;
        max-height: 20vh;
        margin: 0 auto;
        display: block;
        width: 40%;
    }
}

@media screen and (min-height:801px) {
    .tlb_responsive_height {
        min-height: 200px;
        max-height: 40vh;
        margin: 0 auto;
        display: block;
        width: 100%;
    }

}
</style>
<template>
    <v-dialog v-model="bool" :max-width="400" @click:outside="closeDialog" @keydown.esc="closeDialog">
        <v-card style="overflow-x:hidden">
            <v-card-title class="text-h5">{{ $t('Dialogs.StartPrint.Headline') }}</v-card-title>
            <div v-if="bigThumbnail() ?? false" class="d-flex align-center justify-center tlb_responsive_height"
                style="overflow-y:auto; overflow-x:auto;">
                <v-img :src="bigThumbnail() ?? ''" :max-width="'100%'" :overflow-y="'scroll'" class="d-inline-block;"
                    :style="bigThumbnailStyle" />
            </div>
            <v-card-text class="pb-0 mt-4">
                <p class="body-2">
                    {{ question }}
                </p>
                <div>
                    <div v-if="tlb_filament_ok() == false" class="mx-0 mb-4 px-0 py-0">
                        <h3 class="mb-0"><v-icon color="warning">{{ mdiAlert }}</v-icon> {{
                            $t('App.Trilab.StartPrintDialog.FilamentWarning') }}</h3>
                        <p v-if="tlbFilamentLoaded == 'NONE'" class="warning--text px-0 mx-0 my-0 py-0"> {{
                            $t('App.Trilab.StartPrintDialog.PleaseLoadFilament') }}</p>
                        <p v-if="tlbFilamentLoaded != 'NONE' && tlb_filament_ok() == false">{{
                            $t('App.Trilab.StartPrintDialog.currentFilament') }}: <span class="red--text">{{
                                tlbFilamentLoaded
                            }}</span><br>{{ $t('App.Trilab.StartPrintDialog.requestedFilament') }}: <span
                                class="green--text">{{ tlbFilamentNeeded()
                                }}</span></p>
                    </div>
                    <div v-if="nozzle_ok() == false">
                        <h3 class="mb-0"><v-icon color="warning">{{ mdiAlert }}</v-icon> {{
                            $t('App.Trilab.StartPrintDialog.nozzleWarning') }}</h3>
                        <p class="">{{ $t('App.Trilab.StartPrintDialog.currentNozzle') }}: <span class="red--text">{{
                            nozzleCurrent }}</span><br>{{ $t('App.Trilab.StartPrintDialog.requestedNozzle') }}:
                            <span class="success--text">{{ nozzleWanted() }}</span></p>
                    </div>

                </div>
            </v-card-text>
            <start-print-dialog-spoolman v-if="moonrakerComponents.includes('spoolman')" :file="file" />
            <template v-if="moonrakerComponents.includes('timelapse')">
                <v-divider v-if="!moonrakerComponents.includes('spoolman')" class="mt-3 mb-2" />
                <v-card-text class="py-0">
                    <settings-row :title="$t('Dialogs.StartPrint.Timelapse')">
                        <v-switch v-model="timelapseEnabled" hide-details class="mt-0" />
                    </settings-row>
                </v-card-text>
                <v-divider class="mt-2 mb-0" />
            </template>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="closeDialog">{{ $t('Dialogs.StartPrint.Cancel') }}</v-btn>
                <v-btn color="primary" text :disabled="printerIsPrinting || !klipperReadyForGui"
                    @click="startPrint(getFile()?.filename ?? '')">
                    {{ $t('Dialogs.StartPrint.Print') }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TrilabMixin from '@/components/mixins/trilab'
import { FileStateGcodefile } from '@/store/files/types'
import SettingsRow from '@/components/settings/SettingsRow.vue'
import { mdiPrinter3d, mdiAlert } from '@mdi/js'
import { ServerSpoolmanStateSpool } from '@/store/server/spoolman/types'
import { defaultBigThumbnailBackground } from '@/store/variables'
import { Watch } from 'vue-property-decorator'

@Component({
    components: {
        SettingsRow,
    },
})
export default class StartPrintDialog extends Mixins(BaseMixin, TrilabMixin) {
    mdiPrinter3d = mdiPrinter3d
    mdiAlert = mdiAlert

    @Prop({ required: true, default: false })
    declare readonly bool: boolean

    @Prop({ required: true, default: '' })
    declare readonly currentPath: string

    @Prop({ required: true })
    declare file: null | FileStateGcodefile

    public updatedFile: null | FileStateGcodefile = null;


    @Watch('bool')
    onBoolChange(newVal: boolean) {
        if (newVal == false) {
            this.closeDialog()
        } else {
            this.updatedFile = null;
        }
    }

    getFile(): any {
        if (this.updatedFile != null) {
            return this.updatedFile;
        }
        return this.file;
    }

    public NOZZLE_DICTIONARY: any = {
        "HF": "HF",
        "ObX": "ObXidian",
        "HT": "HT"
    };

    get timelapseEnabled() {
        return this.$store.state.server.timelapse?.settings?.enabled ?? false
    }

    set timelapseEnabled(newVal) {
        this.$socket.emit(
            'machine.timelapse.post_settings',
            { enabled: newVal },
            { action: 'server/timelapse/initSettings' }
        )
    }

    bigThumbnail() {
        return this.getFile()?.big_thumbnail ?? null
    }

    get gCodes() {
        return this.$store.getters['files/getAllGcodes'] ?? []
    }

    /// watch gCodes
    @Watch('gCodes')
    onGCodesChange(newVal: any) {
        //console.log("startPrintDialogOnGcodesChange");
        if (this.getFile() != null) {
            /// for each gcode file, check if it is the same as the current file
            for (let i = 0; i < newVal.length; i++) {
                if (newVal[i].filename == this.getFile().filename) {
                    this.updatedFile = newVal[i];
                    break;
                }
            }
        }
    }

    get bigThumbnailBackground() {
        return this.$store.state.gui.uiSettings.bigThumbnailBackground ?? defaultBigThumbnailBackground
    }

    get bigThumbnailStyle() {
        if (defaultBigThumbnailBackground.toLowerCase() === this.bigThumbnailBackground.toLowerCase()) {
            return {}
        }

        return { backgroundColor: this.bigThumbnailBackground }
    }

    get active_spool(): ServerSpoolmanStateSpool | null {
        return this.$store.state.server.spoolman.active_spool ?? null
    }

    get filamentVendor() {
        return this.active_spool?.filament?.vendor?.name ?? 'Unknown'
    }

    get filamentName() {
        return this.active_spool?.filament.name ?? 'Unknown'
    }

    get filament() {
        return `${this.filamentVendor} - ${this.filamentName}`
    }

    get question() {
        if (this.active_spool)
            return this.$t('Dialogs.StartPrint.DoYouWantToStartFilenameFilament', {
                filename: this.getFile()?.filename ?? 'unknown',
            })

        return this.$t('Dialogs.StartPrint.DoYouWantToStartFilename', { filename: this.getFile()?.filename ?? 'unknown' })
    }

    get maxThumbnailWidth() {
        return this.getFile()?.big_thumbnail_width ?? 400
    }

    startPrint(filename = '') {
        if (filename == '') {
            return;
        }
        filename = (this.currentPath + '/' + filename).substring(1)
        this.closeDialog()
        this.$socket.emit('printer.print.start', { filename: filename }, { action: 'switchToDashboard' })
    }

    get tlb_isFTypePresent() {
        if (this.getFile() == null) {
            return false;
        }
        const isPresent = 'filament_type' in this.getFile()
        return isPresent;
    }

    tlbFilamentNeeded() {
        return this.getFile()?.filament_type ?? 'UNKNOWN';
    }
    get tlb_filamentName() {
        let fNameToReturn = this.getFile()?.filament_name ?? 'UNKNOWN';
        /// split it by @, return first part stripped
        if (fNameToReturn.includes('@')) {
            fNameToReturn = fNameToReturn.split('@')[0];
        }
        return fNameToReturn;
    }

    nozzleWanted() {
        const filament_notes = this.getFile()?.filament_notes ?? null;
        const nozzle_diameter = this.getFile()?.nozzle_diameter ?? null;
        //console.log("filament_notes:");
        //console.log(filament_notes);
        //console.log("nozzle_diameter:");
        //console.log(nozzle_diameter);
        if (filament_notes && nozzle_diameter && filament_notes in this.NOZZLE_DICTIONARY) {
            //            nozzle_wanted = f"{nozzle_diameter} {NOZZLE_DICTIONARY[filament_notes]}"
            return `${nozzle_diameter} ${this.NOZZLE_DICTIONARY[filament_notes]}`;
        }
        return 'UNKNOWN';
    }

    get nozzleCurrent() {
        if (this.savedVariablesExists == false) {
            return 'UNKNOWN';
        }
        if (this.getSavedVariable('nozzle') == null) {
            return 'NONE';
        }
        return this.getSavedVariable('nozzle');
    }

    nozzle_ok() {
        return this.nozzleWanted() == this.nozzleCurrent;
    }

    tlb_filament_ok() {
        return this.tlbFilamentNeeded() == this.tlbFilamentLoaded;
    }

    get AllOk() {
        return this.nozzle_ok() && this.tlb_filament_ok;
    }

    get tlbFilamentLoaded() {
        if (this.savedVariablesExists == false) {
            return 'UNKNOWN';
        }
        const floaded = this.getSavedVariable('loaded_filament');
        if (floaded == null) {
            return 'NONE';
        }
        if (typeof floaded === 'string') {
            return floaded.replaceAll('-', '');
        }
        return floaded;
    }


    closeDialog() {
        this.updatedFile = null;
        this.$emit('closeDialog')
    }
}
</script>
