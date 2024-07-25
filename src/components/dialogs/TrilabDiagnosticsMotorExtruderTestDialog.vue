<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Extruder motor test dialog</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>Waiting for extruder temperature to reach {{ tempToSet }} °C. Current temp: {{ currentTemp }}</p>
                </div>
                <div v-if="step == 1">

                    <v-btn color="primary" @click="rollExtruderMotor()">Move extruder motor</v-btn>


                    <p class="mt-3">Did the extruder move?</p>

					<v-row class="">
						<v-col cols="6">
							<v-btn v-if="true" block color="success" @click="success()">Yes</v-btn>
						</v-col>
						<v-col cols="6">
							<v-btn block color="red" @click="fail()">No</v-btn>
						</v-col>
                    </v-row>


                </div>


                <div v-if="isCloseBtnVisible">
                    <v-divider class="mt-4 mb-4"></v-divider>
                    <v-btn color="primary" @click="fail()">{{ $t("App.Trilab.TrilabFilamentLoadWizard.CancelWizard")
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


    public tempToSet = 250;
    public closeBtnVisible = false;
    public showSelectFilamentDialog: boolean = false;
    public showQuestion = false;

    public step_internal = 0;


    get extruderObject() {
        return this.getTrilabTemperatureObject(
            this.heatersObjectNames.find((sensor: any) => sensor == 'extruder')
        )
    }
    get heatersObjectNames() {
        const sensors = this.$store.getters['printer/getAvailableHeaters'] ?? []
        return sensors
    }

    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == true && oldValue == false) {
            this.initialize();
        }
    }


    initialize() {
        /// setujeme teplotu na extruder
        if (typeof this.extruderObject != 'object') {
            this.$toast.error("Extruder object not found");
            this.fail();
            return;
        }



        this.setTemp(this.extruderObject, this.tempToSet);
    }

    rollExtruderMotor() {
        /// send m83
        this.sendGcodeHidden('M83')
        this.sendGcodeHidden('G0 E30 F500')
    }
    get currentTemp() {
        return this.extruderObject.temperature;
    }

    @Watch('currentTemp')
    onCurrentTempChanged(newValue: number, oldValue: number) {
        if(this.isDialogVisible == false) return;
        if (newValue >= this.tempToSet && this.step == 0) {
            this.step = 1;
        }
        console.log("NEW CURRENT TEMP OF EXTRUDER: " + newValue);
    }


    setTemp(temperatureObject: any, targetTemp: number) {
        if (typeof temperatureObject.value === 'object') temperatureObject.value = temperatureObject.value.value ?? 0

        if (targetTemp > temperatureObject.settings.max_temp) {
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooHigh', {
                    name: temperatureObject.name,
                    max: temperatureObject.max_temp,
                }) + ''
            )
        } else if (targetTemp < temperatureObject.settings.min_temp && targetTemp != 0) {
            this.$toast.error(
                this.$t('Panels.TemperaturePanel.TempTooLow', {
                    name: temperatureObject.name,
                    min: temperatureObject.min_temp,
                }) + ''
            )
        } else if (temperatureObject.target !== targetTemp) {
            console.log(temperatureObject)
            const gcode =
                temperatureObject.command +
                ' ' +
                temperatureObject.commandAttributeName +
                '=' +
                temperatureObject.name +
                ' TARGET=' +
                targetTemp
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
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


    get socketResponses() {
        return this.$store.state.trilab.socketResponses;
    }
    fail() {
        this.$emit('catchResult', 'extruderMotorCheck', 0);
        this.closeReset();
    }
    success() {
        this.$emit('catchResult', 'extruderMotorCheck', 1);
        this.closeReset();
    }

    closeReset() {
        /// setting extruder temp to 0, extruder heating is no longer needed
        this.setTemp(this.extruderObject, 0);
        console.log("close resetting TDMETD");
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