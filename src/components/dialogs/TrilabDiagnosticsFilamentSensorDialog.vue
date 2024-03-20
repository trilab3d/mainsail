<template>
    <v-dialog v-model="isDialogVisible" @close="closeReset" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Filament sensor check wizard</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>The filament is detected. On the start of this dialog, filament should not be detected. Please
                        remove the filament to continue</p>
                </div>

                <div v-if="step == 1">
                    <p>Now insert the filament into the printer</p>
                </div>

                <div v-if="step==2">
                    <p>Now remove the filament from the printer</p>
                </div>

                <v-btn block color="red" @click="fail()">Mark as fail</v-btn>

                <div v-if="isCloseBtnVisible">
                    <v-divider class="mt-4 mb-4"></v-divider>
                    <v-btn color="primary" @click="closeReset()">{{ $t("Trilab.TrilabFilamentLoadWizard.CancelWizard")
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
export default class TrilabDiagnosticsFilamentSensorDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    public closeBtnVisible = false;

    public step_internal = 0;


    public filamentSensorStatusBeforeStart : any = null;

    setThisFilamentSensorOnOff(value: number) {
        const gcode = 'SET_FILAMENT_SENSOR SENSOR=' + this.filamentSensorObject.name + ' ENABLE=' + value;
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }


    checkFilamentSensorStart() {
        /// check if the sensor is enabled, if not enable it
        if (this.filamentSensorObject != false) {
            this.filamentSensorStatusBeforeStart = (this.filamentSensorObject.enabled ? 1 : 0);
            console.log("remembering the status. Now status is: ");
            console.log(this.filamentSensorStatusBeforeStart);
            if (this.filamentSensors[0].enabled != true) {
                this.setThisFilamentSensorOnOff(1);
            }
        }
    }



    get filamentSensorStatus() {
        // return first sensor status
        return this.filamentSensors[0]?.filament_detected ?? false;
    }

    get filamentSensorObject() {
        return this.filamentSensors[0] ?? false;
    }

    get filamentSensors() {
        return this.$store.getters['printer/getFilamentSensors'] ?? []
    }



    @Watch('filamentSensorStatus')
    onFilamentSensorStatusChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == false && this.step == 0 && this.filamentSensorObject.enabled == 1) {
            this.step = 1; /// if user is on the step to remove the filament first, automatically advance the step
        } else
            if (this.step == 1 && newValue == true) {
                this.step = 2;
            }
        if (this.step == 2 && newValue == false) {
            this.success();
        }
    }


    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        console.log('onIsDialogVisibleChanged');
        console.log("FIALMENT SENSOR STATUS: " + this.filamentSensorStatusBeforeStart) 
        if (newValue == true && oldValue == false) {
            this.checkFilamentSensorStart(); /// remember the status and temporarily enable the sensor if it is disabled
            /// also check if the status is 0, if yes, set step to 1
            if (this.filamentSensorStatus == 0) { ///dialog should start from not detected (filament) step, so if it is detected on the start, give user a message to remove the filament before continuing
                this.step = 1;
            }
        } else {
            /// closing wizard, set the sensor back to its original state
            if (this.filamentSensorStatusBeforeStart != 1 && this.filamentSensorStatusBeforeStart != null) {
                console.log("SETTING FILAMENT SENSOR STATUS TO PREVIOUS STATE: " + this.filamentSensorStatusBeforeStart)
                this.setThisFilamentSensorOnOff(this.filamentSensorStatusBeforeStart);
            } else {
                console.log("value of the filamentsensorstatusbeforestart " + this.filamentSensorStatusBeforeStart)
            }
        }
    }


    get step(): number {
        return this.step_internal;
    }
    set step(value: number) {
        /// if step is 2, we have to set timeout on window to wait for endstop to be pressed, each 50 ms
        this.step_internal = value;
    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
    sendGcodeHidden(gcode: string) {
        console.log("sending request for endstops query");
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    fail() {
        this.$emit('catchResult', 'filamentCheck', 0);
        this.closeReset();
    }
    success() {
        
        this.$emit('catchResult', 'filamentCheck', 1);
        this.closeReset();
    }

    closeReset() {
        console.log("close resetting");
        this.step = 0;
        this.isDialogVisible = false;
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