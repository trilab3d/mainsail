<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">{{ heaterType }} temperature rise check</v-card-title>
            <v-card-text>
                <div v-if="step == 0">
                    <p style="text-align:center">Please first off cool down the temperature to at least 50°C celsius</p>
                    <p style="text-align:center">Current temperature</p>
                    <p style="text-align:center"> {{ targetHeaterFromTemperatureObjects?.temperature ?? "?" }} </p>
                    <v-btn block color="primary" @click="coolingCheck()">Start cooling down</v-btn>

                </div>

                <div v-if="step == 1">
                    <p>Waiting for temperature rise to {{ configObject.tempTo }}</p>
                    <p style="text-align:center">Current temp: {{ watchedTemperature }}</p>
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
import { maxEventHistory, thumbnailSmallMax } from '@/store/variables';

@Component
export default class TrilabDiagnosticsProbesDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    @Prop({ required: false, default: "Extruder" })
    declare heaterType: string


    public heatingStartTime = 0;
    public heatingEndTime = 0;

    public startedHeatingFromWizard = false;

    public timeoutRef: any = null;
    public targetTempCheckTimeoutRef: any = null;

    public configCheckSettings: any = {
        "Extruder": {
            "tempTo": 200,
            "maxTimeAllowed": 50000,
            "minValueToStartTest": 130,
            "returnKey": "extruderCheck"
        },
        "Bed": {
            "tempTo": 150,
            "minValueToStartTest": 50,
            "maxTimeAllowed": 600000,
            "returnKey": "bedCheck"
        },
        "Panels": {
            "tempTo": 90,
            "minValueToStartTest": 50,
            "maxTimeAllowed": 1600000,
            "returnKey": "panelCheck"
        }
    }



    public closeBtnVisible = false;

    public step_internal = 0;

    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == true && oldValue == false) {
            /// inicialize of values based on type and start the heating process
            this.initialization();
        }
    }

    coolingCheck() {
        this.setTemp(this.targetHeaterFromTemperatureObjects, 0);
        this.startedHeatingFromWizard = false;
    }

    get targetHeaterFromTemperatureObjects() {
        if (this.heaterType == "Extruder") {
            return this.temperatureObjects.find((sensor: any) => sensor.name == "extruder");
        } else if (this.heaterType == "Bed") {
            return this.temperatureObjects.find((sensor: any) => sensor.name == "heater_bed");
        } else if (this.heaterType == "Panels") {
            return this.temperatureObjects.find((sensor: any) => sensor.name == "heater_chamber");
        }
        return null;

    }
    get targetHeaterBedFromTemperatureObjects() {
        return this.temperatureObjects.find((sensor: any) => sensor.name == "heater_bed");
    }

    public initialization() {

        if (this.targetHeaterFromTemperatureObjects == null) {
            /// error toast and closeReset
            this.$toast.error("No temperature sensor found for " + this.heaterType);
            this.closeReset();
        }


        if(this.targetHeaterFromTemperatureObjects.temperature < this.configCheckSettings[this.heaterType].minValueToStartTest){
            this.step = 1; /// it is minimum so we will step into step 2 automatically
            console.log("AUTOSTEPPING 1");
        } else {
            console.log("DID NOT STEP BECAUSE OF TEMPERATURE VALUE:");
            console.log(this.targetHeaterFromTemperatureObjects.temperature);
        }

    }

    get watchedTemperature() {
        return this.targetHeaterFromTemperatureObjects?.temperature ?? 0;
    }

    get configObject(){
        return this.configCheckSettings[this.heaterType];
    }

    @Watch('watchedTemperature')
    onWatchedTemperatureChanged(newValue: number, oldValue: number) {
        if(this.isDialogVisible == false){
            return;
        }
        if (this.targetHeaterFromTemperatureObjects?.temperature < this.configObject.minValueToStartTest && !this.startedHeatingFromWizard) {
            this.setTemp(this.targetHeaterFromTemperatureObjects, this.configCheckSettings[this.heaterType].tempTo);
            if(this.heaterType == "Panels"){
                this.setTemp(this.targetHeaterBedFromTemperatureObjects, 140);
            }
            this.startedHeatingFromWizard = true;
            this.heatingStartTime = new Date().getTime();
            this.step = 1;
            clearTimeout(this.targetTempCheckTimeoutRef);
            this.targetTempCheckTimeoutRef = setTimeout(() => {
                this.fail();
                this.$toast.error("Temperature not reached in time");
            }, this.configCheckSettings[this.heaterType].maxTimeAllowed);
        }
        if (!this.startedHeatingFromWizard) {
            return;
        }
        if (newValue >= this.configCheckSettings[this.heaterType].tempTo) {
            clearTimeout(this.targetTempCheckTimeoutRef);
            this.success();
            this.$toast.success("Temperature (" + this.heaterType + ") reached in time");
        }
        if (this.heatingStartTime + this.configCheckSettings[this.heaterType].maxTimeAllowed < new Date().getTime()) {
            console.log("time is up why? Time now:");
            console.log(new Date().getTime());
            console.log("heating start time:");
            console.log(this.heatingStartTime);
            clearTimeout(this.targetTempCheckTimeoutRef);
            this.fail();
            this.$toast.error("Temperature not reached in time");
        }
    }


    get step(): number {
        return this.step_internal;
    }
    set step(value: number) {
        /// if step is 2, we have to set timeout on window to wait for endstop to be pressed, each 50 ms
        this.step_internal = value;
    }

    get percentage() {
        if (this.targetHeaterFromTemperatureObjects == null) return 0;
        return (this.targetHeaterFromTemperatureObjects.temperature / this.configCheckSettings[this.heaterType].tempTo) * 100;
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
        this.closeReset();
        this.$emit('catchResult', this.configCheckSettings[this.heaterType].returnKey, 0);
    }
    success() {
        this.$emit('catchResult', this.configCheckSettings[this.heaterType].returnKey, 1);
        this.closeReset();
    }

    closeReset() {
        console.log("close resetting");
        if (this.startedHeatingFromWizard) {
            this.setTemp(this.targetHeaterFromTemperatureObjects, 0); ///auto cool down if heating  was started from this wizard
            if(this.heaterType == "Panels"){
                this.setTemp(this.targetHeaterBedFromTemperatureObjects, 0); /// also cool off the bed
            }
        }
        this.startedHeatingFromWizard = false;
        this.step = 0;
        this.isDialogVisible = false;
        /// remove timeout for cooling
        clearTimeout(this.timeoutRef);
        clearTimeout(this.targetTempCheckTimeoutRef);

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

    get temperatureObjects() {
        const sensors = this.$store.getters['printer/getTemperatureObjects'] ?? []
        return sensors.filter((sensor: PrinterStateTemperatureObject) => !sensor.name.startsWith('_'))
    }


    setTemp(temperatureObject: any, targetTemp: number) {
        if (typeof temperatureObject.value === 'object') temperatureObject.value = temperatureObject.value.value ?? 0

        if (targetTemp > temperatureObject.max_temp) {
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooHigh', { name: temperatureObject.name, max: temperatureObject.max_temp }) + ''
            )
        } else if (targetTemp < temperatureObject.min_temp && targetTemp != 0) {
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooLow', { name: temperatureObject.name, min: temperatureObject.min_temp }) + ''
            )
        } else if (temperatureObject.target !== targetTemp) {
            console.log(temperatureObject);
            const gcode = temperatureObject.command + ' ' + temperatureObject.commandAttributeName + '=' + temperatureObject.name + ' TARGET=' + targetTemp
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
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
  