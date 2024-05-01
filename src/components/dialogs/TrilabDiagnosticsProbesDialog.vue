<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Bed probes check wizard</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>Remove any possible weights from the bed and click button below</p>
                    <v-btn :loading="probeCheckingInProgress" block color="primary"
                        @click="sendAnalogProbeCommand(); probeCheckingInProgress = true">Bed is empty, continue</v-btn>
                    <p v-if="probeCheckingInProgress">Averaging the values, please wait...</p>
                </div>
                <div v-if="step == 1 && !waitingForChange">
                    <p>Place 500 grams on place that is highlighted in following image.
                        Then press "Check" and wait for checking to complete </p>
                    <img src="/img/bedExampleA.jpg" alt="A" style="width:100%; max-width:300px; margin:0 auto; display:block">

                    <hr class="mt-2 mb-2">

                    <v-btn v-if="!probeARegistered" block color="primary" :loading="probeCheckingInProgress"
                        @click="sendAnalogProbeCommand(); probeCheckingInProgress = true">{{ checkText }}</v-btn>

                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="probeARegistered">Registered</span><span color="red"
                            v-if="!probeARegistered">{{ lastVal }}</span></p>

                    <v-btn v-if="probeARegistered" block color="primary" @click="step = 2">Next</v-btn>

                </div>

                <div v-if="step == 2 && !waitingForChange">
                    <p>Place 500 grams on place that is highlighted in following image.
                        Then press "Check" and wait for checking to complete </p>

                    <img src="/img/bedExampleB.jpg" alt="B" style="width:100%; max-width:300px; display:block; margin:0 auto">


                    <hr class="mt-2 mb-2">


                    <v-btn v-if="!probeBRegistered" color="primary" :loading="probeCheckingInProgress" block
                        @click="sendAnalogProbeCommand(); probeCheckingInProgress = true">{{ checkText }}</v-btn>


                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="probeBRegistered">Registered</span><span color="red"
                            v-if="!probeBRegistered">{{ lastVal }}</span></p>

                    <v-btn v-if="probeBRegistered" block color="primary" @click="step = 3">Next</v-btn>

                </div>

                <div v-if="step == 3 && !waitingForChange">
                    <p>Place 500 grams on place that is highlighted in following image.
                        Then press "Check" and wait for checking to complete </p>
                    <img src="/img/bedExampleC.jpg" alt="B" style="width:100%; max-width:300px; display:block;margin:0 auto;">


                    <hr class="mt-2 mb-2">

                    <v-btn v-if="!probeCRegistered" block color="primary" :loading="probeCheckingInProgress"
                        @click="sendAnalogProbeCommand(); probeCheckingInProgress = true">{{ checkText }}</v-btn>


                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="endStopCRegistered">Registered</span><span color="red"
                            v-if="!endStopCRegistered">{{ lastVal }}</span></p>

                </div>

                <!-- last step, just the results, beautiful -->
                <div v-if="step == 4">
                    <p style="color:lime">All points were successfully registered. Please remove the object from the bed and close the wizard with the button below</p>

                    <v-btn block class="mt-2 mb-2" color="green" @click="success()">Close</v-btn>
                </div>



                <div v-if="waitingForChange">
                    <p style="text-align:center; color:lime">Now remove the heavy object from the desk {{ lastVal }}</p>
                </div>

                <div>
                    <small v-if="valueWithoutWeightAvgd != 0">W/o weight: {{ valueWithoutWeightAvgd }}</small><br>
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
import TheTimelapseRenderingSnackbar from '../TheTimelapseRenderingSnackbar.vue';

@Component
export default class TrilabDiagnosticsProbesDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    /// THIS WIZARD CHECKS FOR THREE PROBES ON THE BED, IF THEY REPORT CORRECT (AND SIMILAR) VALUES. MAXIMUM ALLOWED DISCREPANCY 10% OF EACH OTHER

    public waitingForChange = false;

    public closeBtnVisible = false;

    public step_internal = 0;

    public valueWithoutWeightAvgd = 0; /// averaged value of the Array values after it is completed


    public firstValueWithWeight = -1; //// on other probe locations shouldnt show more discrepancy than 70

    public probeARegistered = false;
    public probeBRegistered = false;
    public probeCRegistered = false;

    public probeCheckingInProgress = false;

    public firstWeightArrayForAverage: any = [];
    public firstNoWeightArrayForAverage: any = [];

    public Avals: any = [];
    public Bvals: any = [];
    public Cvals: any = [];


    public lastVal: any = null;

    public lastValBeforeChange: any = null;


    public minCheckRetries = 15;

    public lastStepForRetry = 0;

    public checkRetries = 0; /// logic changes now, checkRetries is now the number of how many more times the check has to proceed until it allows or fails next step

    public weightObjectToleranceMin = 150;
    public weightObjectToleranceMax = 300;

    public waitingTimeoutRef: any = null;
    public probeTimeoutRef: any = null;




    get endStopCRegistered(): boolean {
        return this.probeCRegistered;
    }
    set endStopCRegistered(value: boolean) {
        this.probeCRegistered = value;
        if (value) {
            this.success();
        }
    }



    get checkText() {
        if (this.probeCheckingInProgress) {
            return "Checking... Please wait..."
        } else {
            return "Check"
        }
    }

    sendAnalogProbeCommand() {
        /// check if dialog is visible
        if (!this.isDialogVisible) {
            return;
        }
        this.sendGcodeHidden('ANALOG_PROBE_DEBUG');
    }


    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == true && oldValue == false) {
            this.probeARegistered = false;
            this.probeBRegistered = false;
            this.probeCRegistered = false;
            this.valueWithoutWeightAvgd = 0;
            this.firstValueWithWeight = 0;
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


    waitToNoWeight() {
        this.waitingForChange = true;
        this.lastValBeforeChange = this.valueWithoutWeightAvgd;
        this.sendAnalogProbeCommand();
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

        //console.log("TDPD last response: " + lastResponse);

        if (isNeededMessage != -1) {
            /// to je ono
            /// get the value after = and before ,

            // increment checkRetries if step > 0
            if (this.step > 0 && !this.waitingForChange) {
                this.checkRetries++;
            }

            const equalsIndex = lastResponse.indexOf("=");
            const commaIndex = lastResponse.indexOf(",");
            const parsedValue = lastResponse.substring(equalsIndex + 1, commaIndex);
            this.lastVal = parseInt(parsedValue);

            if (Math.abs(parseInt(parsedValue) - this.lastValBeforeChange) < 50 && this.lastValBeforeChange != null) {
                if (this.waitingForChange == true) {
                    this.waitingForChange = false;
                    return;
                }
                /// clear timeout
                clearTimeout(this.waitingTimeoutRef);
                console.log("waiting for change reset because of difference of" + this.lastValBeforeChange + " : vs now : " + parsedValue);
            }

            if (this.waitingForChange) {
                console.log("waiting for change");
                console.log("last val before change: " + this.lastValBeforeChange);
                console.log("val now: " + parsedValue);
                console.log("needs to be less than 80 difference");
                this.waitingTimeoutRef = setTimeout(() => {
                    this.sendAnalogProbeCommand();
                }, 1000);
                return false;
            }


            if (this.step == 0) {
                this.probeCheckingInProgress = true;
                this.firstNoWeightArrayForAverage.push(parseInt(parsedValue));
                if (this.firstNoWeightArrayForAverage.length < 15) {
                    this.probeTimeoutRef = setTimeout(() => {
                        this.sendAnalogProbeCommand();
                    }, 200);
                } else {
                    clearTimeout(this.probeTimeoutRef);
                    /// averaging the values to one variable
                    this.valueWithoutWeightAvgd = Math.round(this.firstNoWeightArrayForAverage.reduce((a: number, b: number) => a + b, 0) / this.firstNoWeightArrayForAverage.length);
                    let min = Math.min(...this.firstNoWeightArrayForAverage);
                    let max = Math.max(...this.firstNoWeightArrayForAverage);

                    /// the difference between min and max must be less than 400
                    if (max - min > 400) {
                        this.$toast.error("Bed weight sensor value difference is more than 400 from min and max. The sensor is probably not working correctly.");
                        this.fail();
                        return;
                    }



                    this.probeCheckingInProgress = false;
                    this.step = 1;
                }


            } else if (this.step == 1) {
                this.Avals.push(parseInt(parsedValue));
                if (this.checkRetries >= this.minCheckRetries) {
                    /// make avg
                    clearTimeout(this.probeTimeoutRef);
                    let avgA = this.Avals.reduce((a: number, b: number) => a + b, 0) / this.Avals.length;
                    /// the avgA has to be min noWeightAvgd + 150 and less than +250 (from the variables)
                    if (avgA < this.valueWithoutWeightAvgd + this.weightObjectToleranceMin || avgA > this.valueWithoutWeightAvgd + this.weightObjectToleranceMax) {
                        console.log("avgA: " + avgA + " valueWithoutWeightAvgd: " + this.valueWithoutWeightAvgd);
                        this.$toast.error("Probe A is not working, the value is not in the expected range. Please check the sensor and try again." + "Current value: " + parsedValue + " First value with weight: " + this.firstValueWithWeight);
                        this.fail();
                        return;
                    }

                    this.probeARegistered = true;
                    this.checkRetries = 0;
                    this.probeCheckingInProgress = false;
                    this.waitToNoWeight();
                    this.step = 2;
                } else {
                    /// call again
                    this.probeTimeoutRef = setTimeout(() => {
                        this.sendAnalogProbeCommand();
                    }, 200);
                }
            } else if (this.step == 2) {
                this.Bvals.push(parseInt(parsedValue));
                if (this.checkRetries >= this.minCheckRetries) {
                    /// make avg
                    let avgB = this.Bvals.reduce((a: number, b: number) => a + b, 0) / this.Bvals.length;
                    /// the avgA has to be min noWeightAvgd + 150 and less than +250 (from the variables)
                    if (avgB < this.valueWithoutWeightAvgd + this.weightObjectToleranceMin || avgB > this.valueWithoutWeightAvgd + this.weightObjectToleranceMax) {
                        this.$toast.error("Probe B is not working, the value is not in the expected range. Please check the sensor and try again." + "Current value: " + parsedValue + " First value with weight: " + this.firstValueWithWeight);
                        this.fail();
                        return;
                    }
                    clearTimeout(this.probeTimeoutRef);
                    this.waitToNoWeight();
                    this.step = 3;
                    this.probeBRegistered = true;
                    this.probeCheckingInProgress = false;
                    this.checkRetries = 0;
                    this.probeBRegistered = true;
                } else {
                    /// call again
                    this.probeTimeoutRef = setTimeout(() => {
                        this.sendAnalogProbeCommand();
                    }, 200);
                }

            } else if (this.step == 3) {
                this.Cvals.push(parseInt(parsedValue));
                if (this.checkRetries >= this.minCheckRetries) {
                    clearTimeout(this.probeTimeoutRef);
                    let avgC = this.Cvals.reduce((a: number, b: number) => a + b, 0) / this.Cvals.length;
                    /// the avgC has to be min noWeightAvgd + 150 and less than +250 (from the variables)
                    if (avgC < this.valueWithoutWeightAvgd + this.weightObjectToleranceMin || avgC > this.valueWithoutWeightAvgd + this.weightObjectToleranceMax) {
                        this.$toast.error("Probe C is not working, the value is not in the expected range. Please check the sensor and try again." + "Current value: " + parsedValue + " First value with weight: " + this.firstValueWithWeight);
                        this.fail();
                        return;
                    }

                    this.probeCheckingInProgress = false;
                    this.step = 4;
                } else {
                    /// call again
                    this.probeTimeoutRef = setTimeout(() => {
                        this.sendAnalogProbeCommand();
                    }, 200);

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
        this.firstValueWithWeight = -1;
        this.valueWithoutWeightAvgd = -1;
        this.firstWeightArrayForAverage = [];
        this.probeCheckingInProgress = false;
        this.firstNoWeightArrayForAverage = [];
        this.Avals = [];
        this.Bvals = [];
        this.Cvals = [];
        this.probeARegistered = false;
        this.probeBRegistered = false;
        this.probeCRegistered = false;
        this.isDialogVisible = false;
        this.waitingForChange = false;
        this.checkRetries = 0;
        this.lastVal = null;
    }

    get isCloseBtnVisible() {
        if(this.step == 4){
            return false;
        }
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