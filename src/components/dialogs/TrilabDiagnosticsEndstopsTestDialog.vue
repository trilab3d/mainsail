<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Endstops check wizard</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>First make space for the endstops, make sure they are not pushed down and click check state</p>
                    <v-btn color="primary" @click="endStopsData = ''; sendGcodeHidden('QUERY_ENDSTOPS')">CHECK OPEN STATE</v-btn>
                    <div v-if="endStopsData != ''">
                        <hr class="mb-4 mt-4" />
                        <p>Does following message say "open" for endstop A, B and C?</p>
                        <p style="font-weight:bold; text-align:center" v-if="endStopsData != ''">{{
                            endStopsData }}</p>
                    </div>
                </div>
                <div v-if="step == 1">

                </div>

                <div v-if="step == 2">



                </div>

                <div v-if="step == 3">

                </div>

                <div v-if="isCloseBtnVisible">
                    <v-divider class="mt-4 mb-4"></v-divider>
                    <v-btn color="primary" @click="$emit('close')">{{ $t("Trilab.TrilabFilamentLoadWizard.CancelWizard")
                    }}</v-btn>
                </div>
            </v-card-text>
        </v-card>


    </v-dialog>
</template>
    
<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import TrilabMixin from '@/components/mixins/trilab';
import { PrinterStateAdditionalSensor, PrinterStateTemperatureObject } from '@/store/printer/types'

@Component
export default class TrilabDiagnosticsEndstopsTestDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    public closeBtnVisible = false;
    public showSelectFilamentDialog: boolean = false;

    public step = 0;

    public endStopsData = '';


    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
    sendGcodeHidden(gcode: string) {
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }




    get isCloseBtnVisible() {
        return this.closeBtnVisible || this.step == 0;
    }

    get isDialogVisible() {
        return this.showp;
    }
    set isDialogVisible(value) {
        if (!value) {
            this.$emit('close', value);
            this.showp = false;
        }
    }


}
</script>
    
<style scoped>
/* Adjust the styles as per your design */
.v-dialog--active {
    transition: opacity 0.3s ease-in-out;
}
</style>
  