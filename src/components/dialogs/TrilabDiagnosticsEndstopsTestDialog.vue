<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Endstops check wizard</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>Checking for default states. You should not see this page for long</p>
                </div>
                <div v-if="step == 1">
                    Check endstop A functionality. Press the following endstop multiple times until you see "Registered"
                    message
                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="endStopARegistered">Registered</span><span color="red"
                            v-if="!endStopARegistered">NOT
                            Registered</span></p>
                    <v-btn v-if="endStopARegistered" block color="primary" @click="step = 2">Next</v-btn>
                    <v-btn v-if="!endStopARegistered" block color="red" @click="fail()">Mark as fail</v-btn>


                </div>

                <div v-if="step == 2">
                    Check endstop B functionality. Press the following endstop multiple times until you see "Registered"
                    message

                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="endStopBRegistered">Registered</span><span color="red"
                            v-if="!endStopBRegistered">NOT
                            Registered</span></p>

                    <v-btn v-if="endStopBRegistered" block color="primary" @click="step = 3">Next</v-btn>
                    <v-btn v-if="!endStopBRegistered" block color="red" @click="fail()">Mark as fail</v-btn>

                </div>

                <div v-if="step == 3">
                    Check endstop C functionality. Press the following endstop multiple times. If it is registered, dialog
                    will close

                    <p class="mb-4 mt-4" style="text-align:center; font-weight:bold; font-size:125%"><span
                            style="color:lime" v-if="endStopCRegistered">Registered</span><span color="red"
                            v-if="!endStopCRegistered">NOT
                            Registered</span></p>

                    <v-btn v-if="!endStopCRegistered" block color="red" @click="fail()">Mark as fail</v-btn>

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

@Component
export default class TrilabDiagnosticsEndstopsTestDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    public closeBtnVisible = false;
    public showSelectFilamentDialog: boolean = false;

    public step_internal = 0;

    public endStopsData = '';
    public endStopARegistered = false;
    public endStopBRegistered = false;
    public _endStopCRegistered = false;

    get endStopCRegistered(): boolean {
        return this._endStopCRegistered;
    }
    set endStopCRegistered(value: boolean) {
        this._endStopCRegistered = value;
        if (value) {
            this.success();
        }
    }


    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == true && oldValue == false) {
            this.endStopsData = '';
            this.sendGcodeHidden('QUERY_ENDSTOPS');
        }
    }


    get step(): number {
        return this.step_internal;
    }
    set step(value: number) {
        /// if step is 2, we have to set timeout on window to wait for endstop to be pressed, each 50 ms
        this.step_internal = value;
        if (value == 1) {
            this.setCheckTimeout();
        }
    }


    setCheckTimeout() {
        console.log("setting check timeout");
        var refe = this;
        if (this.step != 0) {
            (window as any)["trilab_diagnostics_endstops_test_dialog_timeout"] = setTimeout(() => {
                /// check if this dialog is visible, if not clear interval
                console.log("refe step:" + refe.step);
                refe.sendGcodeHidden('QUERY_ENDSTOPS');
                /// set timeout again
                refe.setCheckTimeout();
            }, 250);
        } else {
            console.log("clearing timeout");
            if ((window as any)["trilab_diagnostics_endstops_test_dialog_timeout"]) {
                clearTimeout((window as any)["trilab_diagnostics_endstops_test_dialog_timeout"]);
            }

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


    get socketResponses() {
        return this.$store.state.trilab.socketResponses;
    }
    /// watch trilab store state for socketResponses changes, and if indexof a: b: and c: is not -1, then set the testResults.endstopA to 1
    @Watch('socketResponses')
    onSocketResponsesChanged() {
        const socketResponses = this.$store.state.trilab.socketResponses;
        const lastResponse = socketResponses[socketResponses.length - 1];
        const indexOfA = lastResponse.indexOf("a:");
        const indexOfB = lastResponse.indexOf("b:");
        const indexOfC = lastResponse.indexOf("c:");

        const Aopen = lastResponse.indexOf("a:open");
        const Bopen = lastResponse.indexOf("b:open");
        const Copen = lastResponse.indexOf("c:open");

        if (this.step == 0 && Aopen == -1 || Bopen == -1 || Copen == -1) {
            if (Aopen == -1) {
                this.$toast.error("Endstop A is not free, please check the endstop and try again");
            }
            if (Bopen == -1) {
                this.$toast.error("Endstop B is not free, please check the endstop and try again");
            }
            if (Copen == -1) {
                this.$toast.error("Endstop C is not free, please check the endstop and try again");
            }
            this.fail();
        } else if(this.step == 0 && Aopen != -1 && Bopen != -1 && Copen != -1) {
            this.step = 1; /// automatically advance the step
        }


        if (indexOfA != -1 && indexOfB != -1 && indexOfC != -1) {
            this.endStopsData = lastResponse;
            /// check for each closed endstop and add it to the testResults
            if (lastResponse.indexOf("a:TRIGGERED") != -1 && this.step == 1) {
                this.endStopARegistered = true;
            }
            if (lastResponse.indexOf("b:TRIGGERED") != -1 && this.step == 2) {
                this.endStopBRegistered = true;
            }
            if (lastResponse.indexOf("c:TRIGGERED") != -1 && this.step == 3) {
                this.endStopCRegistered = true;
            }
        }
    }
    fail() {
        this.$emit('catchResult', 'endstopsOpenState', 0);
        this.closeReset();
    }
    success() {
        this.$emit('catchResult', 'endstopsOpenState', 1);
        this.closeReset();
    }

    closeReset() {
        console.log("close resetting");
        this.step = 0;
        this.endStopsData = '';
        this.endStopARegistered = false;
        this.endStopBRegistered = false;
        this._endStopCRegistered = false;

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
  