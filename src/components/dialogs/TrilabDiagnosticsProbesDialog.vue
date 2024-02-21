<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Bed probes check wizard</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>Remove any possible weights from the bed and click "Check empty weight"</p>
                    <v-btn block color="primary" @click="sendAnalogProbeCommand()">Check empty weight</v-btn>
                </div>
                <div v-if="step == 1 && !waitingForChange">
                    Check bed probe A functionality. Place heavy hammer on the left bottom corner of the bed and press
                    "Check"
                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="probeARegistered">Registered</span><span color="red"
                            v-if="!probeARegistered">NOT
                            Registered</span></p>

                    <v-btn v-if="probeARegistered" block color="primary" @click="step = 2">Next</v-btn>

                </div>

                <div v-if="step == 2 && !waitingForChange">
                    Check bed probe B functionality. Place heavy hammer on the right bottom corner of the bed and press
                    "Check"
                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="probeBRegistered">Registered</span><span color="red"
                            v-if="!probeBRegistered">NOT
                            Registered</span></p>

                    <v-btn v-if="probeBRegistered" block color="primary" @click="step = 3">Next</v-btn>

                </div>

                <div v-if="step == 3 && !waitingForChange">
                    Check bed probe C functionality. Place heavy hammer on the middle far corner of the bed and press
                    "Check"
                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="endStopCRegistered">Registered</span><span color="red"
                            v-if="!endStopCRegistered">NOT
                            Registered</span></p>

                </div>


                <div v-if="waitingForChange">
                    <p style="text-align:center">Now remove the heavy object from the desk</p>
                </div>

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
import { maxEventHistory } from '@/store/variables';

@Component
export default class TrilabDiagnosticsProbesDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    /// THIS WIZARD CHECKS FOR THREE PROBES ON THE BED, IF THEY REPORT CORRECT (AND SIMILAR) VALUES. MAXIMUM ALLOWED DISCREPANCY 10% OF EACH OTHER

    public waitingForChange = false;

    public closeBtnVisible = false;

    public step_internal = 0;

    public valueWithoutWeight = 0;

    public firstValueWithWeight = 0; //// on other probe locations shouldnt show more discrepancy than 70

    public probeARegistered = false;
    public probeBRegistered = false;
    public probeCRegistered = false;


    public lastVal: any = null;

    public lastValBeforeChange: any = null;



    public maxCheckRetries = 10;

    public lastStepForRetry = 0;

    public checkRetries = 0;


    get endStopCRegistered(): boolean {
        return this.probeCRegistered;
    }
    set endStopCRegistered(value: boolean) {
        this.probeCRegistered = value;
        if (value) {
            this.success();
        }
    }

    sendAnalogProbeCommand() {
        this.sendGcodeHidden('ANALOG_PROBE_DEBUG');
    }

    setupTimeout(forStep: number) {
        setTimeout(() => {
            if (this.isDialogVisible == false) {
                return;
            }
            if(this.checkRetries > this.maxCheckRetries){
                this.fail();
                this.$toast.error("Probe is probably not working or you didnt place the object to the bed in time, more than" + this.maxCheckRetries + " retries");
                return;
            }
            if (this.waitingForChange) {
                this.setupTimeout(forStep);
                this.sendAnalogProbeCommand();
                console.log('waiting for change');
                return;
            }
            if (this.step < 1) {
                this.setupTimeout(forStep);
                console.log('step je pod jedna');
                return;
            }
            if (this.step == forStep) {
                this.sendAnalogProbeCommand();
                this.checkRetries += 1;
                this.setupTimeout(forStep);
            } else {
                this.checkRetries = 0;
                this.setupTimeout(this.step);
            }
        }, 1000);
    }


    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == true && oldValue == false) {
            this.probeARegistered = false;
            this.probeBRegistered = false;
            this.probeCRegistered = false;
            this.valueWithoutWeight = 0;
            this.firstValueWithWeight = 0;
            this.setupTimeout(this.step);
            //this.sendGcodeHidden('ANALOG_PROBE_DEBUG');
        }
    }


    get step(): number {
        return this.step_internal;
    }
    set step(value: number) {
        /// if step is 2, we have to set timeout on window to wait for endstop to be pressed, each 50 ms
        this.step_internal = value;

        if (this.step_internal != value) {
            this.checkRetries = 0;
        }


    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
    sendGcodeHidden(gcode: string) {
        console.log("sending request for endstops query");
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }


    waitForChange() {
        this.waitingForChange = true;
        this.lastValBeforeChange = this.lastVal;
    }
    get socketResponses() {
        return this.$store.state.trilab.socketResponses;
    }
    /// watch trilab store state for socketResponses changes, and if indexof a: b: and c: is not -1, then set the testResults.endstopA to 1
    @Watch('socketResponses')
    onSocketResponsesChanged() {
        const socketResponses = this.$store.state.trilab.socketResponses;
        const lastResponse = socketResponses[socketResponses.length - 1];
        const isNeededMessage = lastResponse.indexOf("Analog Probe debug. ADC Value=");

        console.log("TDPD last response: " + lastResponse);

        if (isNeededMessage != -1) {
            console.log("To odpovida");
            /// to je ono
            /// get the value after = and before ,
            const equalsIndex = lastResponse.indexOf("=");
            const commaIndex = lastResponse.indexOf(",");
            const neededValue = lastResponse.substring(equalsIndex + 1, commaIndex);
            this.lastVal = parseInt(neededValue);

            if(Math.abs(parseInt(neededValue) - this.lastValBeforeChange) > 300 && this.lastValBeforeChange != null){
                this.waitingForChange = false;
                console.log("waiting for change reset because of difference of" + this.lastValBeforeChange + " : vs now : " + neededValue);
            }

            if(this.waitingForChange){
                console.log("waiting for change");
                return false;
            }


            if (this.step == 0) {
                /// set the value to the valueWithoutWeight
                this.valueWithoutWeight = parseInt(neededValue);
                this.step = 1;
            } else if (this.step == 1) {
                /// check if the value was changed significantly (more than 150)
                if (Math.abs(this.valueWithoutWeight - parseInt(neededValue)) < 150) {
                    /// toast that the probe is not working, not registered any weight
                    if (this.checkRetries > this.maxCheckRetries) {
                        this.$toast.error("Probe is not working, registered no change");
                        this.fail();
                    }

                } else {
                    this.firstValueWithWeight = parseInt(neededValue);
                    if (this.firstValueWithWeight < 2390 && this.checkRetries > this.maxCheckRetries) {
                        this.$toast.error("Probe is not working, sensor value under 2390. Try something heavier or sensor is not working");
                        this.fail();
                    }
                    this.waitForChange();
                    this.step = 2;
                }
            } else if (this.step == 2) {
                /// check if the value was changed more than 70 from the first reading, if yes, then fail, if no, then step 3
                if (Math.abs(this.firstValueWithWeight - parseInt(neededValue)) > 70) {
                    /// toast
                    if (this.checkRetries > this.maxCheckRetries) {
                        this.$toast.error("Probe is not working, more than 70 difference in readings. Please check the sensor and try again." + "Current value: " + neededValue + " First value with weight: " + this.firstValueWithWeight);
                        this.fail();
                    }
                } else {
                    this.waitForChange();
                    this.step = 3;
                }

            } else if (this.step == 3) {
                /// check if the value was changed significantly (more than 100)
                if (Math.abs(this.firstValueWithWeight - parseInt(neededValue)) > 70) {
                    /// toast
                    if (this.checkRetries > this.maxCheckRetries) {
                        this.$toast.error("Probe C is not working, more than 70 difference in readings. Please check the sensor and try again." + "Current value: " + neededValue + " First value with weight: " + this.firstValueWithWeight);
                        this.fail();
                    }
                } else {
                    this.success();
                }
            }


        }

    }
    fail() {
        this.closeReset();
        this.$emit('catchResult', 'bedProbes', 0);
    }
    success() {
        this.$emit('catchResult', 'bedProbes', 1);
        this.closeReset();
    }

    closeReset() {
        console.log("close resetting");
        this.step = 0;
        this.firstValueWithWeight = 0;
        this.valueWithoutWeight = 0;
        this.probeARegistered = false;
        this.probeBRegistered = false;
        this.probeCRegistered = false;
        this.isDialogVisible = false;
        this.waitingForChange = false;
        this.checkRetries = 0;
        this.lastVal = null;
    }

    get isCloseBtnVisible() {
        return true;

        //return this.closeBtnVisible || this.step == 0;
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
  