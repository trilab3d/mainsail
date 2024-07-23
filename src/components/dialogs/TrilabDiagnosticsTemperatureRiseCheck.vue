<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">{{ heaterTypeText }} temperature rise check</v-card-title>
            <v-card-text>
                <div v-if="step == 0">
                    <p style="text-align: center">
                        Please first off cool down the temperature to at least {{ minTempText }}
                    </p>
                    <p style="text-align: center">Current temperature</p>
                    <p style="text-align: center"><span v-if="heaterType == 'Panels'">Chamber:</span> {{
                        targetHeaterFromTemperatureObjects?.temperature?.toFixed(1) ?? '?' }}</p>
                    <p style="text-align:center" v-if="heaterType == 'Panels'">Bed: {{
                        targetHeaterBedFromTemperatureObjects?.temperature?.toFixed(1) ?? "?"
                        }}
                    </p>
                    <v-btn block color="primary" @click="coolingCheck()">Start cooling down</v-btn>
                </div>

                <div v-if="step == 1">
                    <p v-if="heaterType != 'Panels'">Waiting for temperature rise to {{ tempTo }}. Door has to be closed
                    </p>
                    <p v-if="heaterType == 'Panels'">Waiting for temperature rise to {{ tempTo }} for chamber and {{
                        configCheckSettings.Bed.tempTo }} for bed. Door has to be closed</p>
                    <p style="text-align: center">Current temp: {{ parseFloat(watchedTemperature)?.toFixed(1) }}</p>
                    <p v-if="heaterType == 'Panels' && bedOk" style="text-align: center">Bed temperature: {{
                        parseFloat(targetHeaterBedFromTemperatureObjects?.temperature).toFixed(1) ?? "?" }} °C <v-icon v-if="bedOk"
                            color="success">{{ mdiCheckCircle }}</v-icon></p>

                    <p style="text-align:center">Remaining time: {{
                        getRemainingTimeFormatted(getRemainingTimeInSeconds()) }}</p>
                    <p v-if="heaterType == 'Panels' && bedOk == false">
                        Remaining time for bed: {{ getRemainingTimeFormatted(getBedRemainingTimeInSeconds()) }}</p>

                </div>

                <div v-if="isCloseBtnVisible">
                    <v-divider class="mt-4 mb-4"></v-divider>
                    <v-btn color="primary" @click="fail(true, true)">{{ $t('App.Trilab.Generic.CancelWizard') }}</v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import TrilabMixin from '@/components/mixins/trilab'
import { PrinterStateAdditionalSensor, PrinterStateHeater } from '@/store/printer/types'
import { maxEventHistory, thumbnailSmallMax } from '@/store/variables'
import { mdiCheckCircle } from '@mdi/js'

@Component
export default class TrilabDiagnosticsTemperatureRiseCheckDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean

    @Prop({ required: false, default: 'Extruder' })
    declare heaterType: string

    public heatingStartTime = 0
    public heatingEndTime = 0

    mdiCheckCircle = mdiCheckCircle


    public bedOk = false
    public startedHeatingFromWizard = false

    get heaterTypeText() {
        if (this.heaterType == 'Panels') {
            return 'Chamber & Bed'
        }
        return this.heaterType

    }

    getRemainingTimeInSeconds() {
        return Math.floor((this.heatingStartTime + this.maxTime - new Date().getTime()) / 1000)
    }
    getRemainingTimeFormatted(seconds: number) {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        if (minutes <= 0 && remainingSeconds <= 0) {
            return '0m 0s'
        }
        return minutes + 'm ' + remainingSeconds + 's'
    }

    getBedRemainingTimeInSeconds() {
        return Math.floor((this.heatingStartTime + this.configCheckSettings.Bed.maxTimeAllowed - new Date().getTime()) / 1000)


    }




    public configCheckSettings: any = {
        Extruder: {
            tempTo: 200,
            maxTimeAllowed: 50000,
            minValueToStartTest: 130,
            returnKey: 'extruderCheck',
        },
        Bed: {
            tempTo: 150,
            minValueToStartTest: 50,
            maxTimeAllowed: 600000, ///10min
            returnKey: 'bedCheck',
        },
        Panels: {
            tempTo: 90,
            minValueToStartTest: 50,
            maxTimeAllowed: 2880000, ///48min
            returnKey: 'panelCheck',
        },
    }

    public closeBtnVisible = false

    public step_internal = 0

    //// watch isDialogVisible and if true and was false, then sendGcodeHidden('QUERY_ENDSTOPS') and automatically check if all are a:open b:open c:open, if not give toast message and close dialog with fail
    @Watch('isDialogVisible')
    onIsDialogVisibleChanged(newValue: boolean, oldValue: boolean) {
        if (newValue == true && oldValue == false) {
            /// inicialize of values based on type and start the heating process
            const gcode = `SET_FAN_SPEED FAN=intake_flap SPEED=0`
            this.sendGcode(gcode)
            this.initialization()
        }
    }

    coolingCheck() {
        this.setTemp(this.targetHeaterFromTemperatureObjects, 0)
        if (this.heaterType == 'Panels') {
            this.setTemp(this.targetHeaterBedFromTemperatureObjects, 0)
        }
        this.startedHeatingFromWizard = false
    }

    get minTemp() {
        return this.configCheckSettings[this.heaterType].minValueToStartTest
    }

    get minTempText() {
        if (this.heaterType == 'Panels') {
            return this.configCheckSettings['Bed'].minValueToStartTest + '°C for bed' + ' and ' + this.configCheckSettings['Panels'].minValueToStartTest + '°C for Panels'
        }
        return this.configCheckSettings[this.heaterType].minValueToStartTest + '°C'
    }

    get maxTime() {
        /// check if its localhost:8080
        return this.configCheckSettings[this.heaterType].maxTimeAllowed
    }
    get tempTo() {
        if (window.location.hostname == 'localhost' && window.location.port == '8080') {
            if (this.heaterType == 'Panels') {
                //return 52
            }
            //return 60
        }
        return this.configCheckSettings[this.heaterType].tempTo
    }

    get targetHeaterFromTemperatureObjects() {
        let objectToReturn = null
        if (this.heaterType == 'Extruder') {
            objectToReturn = this.getTrilabTemperatureObject(
                this.heatersObjectNames.find((sensor: any) => sensor == 'extruder')
            )
        } else if (this.heaterType == 'Bed') {
            objectToReturn = this.getTrilabTemperatureObject(
                this.heatersObjectNames.find((sensor: any) => sensor == 'heater_bed')
            )
        } else if (this.heaterType == 'Panels') {
            objectToReturn = this.getTrilabTemperatureObject(
                this.heatersObjectNames.find((sensor: any) => sensor == 'heater_chamber')
            )
        }
        return objectToReturn
    }
    get targetHeaterBedFromTemperatureObjects() {
        return this.getTrilabTemperatureObject(this.heatersObjectNames.find((sensor: any) => sensor == 'heater_bed'))
    }

    public setTempPeriodicTimeout() {
        if (this.targetHeaterFromTemperatureObjects == null || this.isDialogVisible == false || this.startedHeatingFromWizard == false) {
            return
        }
        var thisref = this;
        (window as any).temp_periodic_timeout = setTimeout(() => {
            if (thisref.targetHeaterFromTemperatureObjects == null || thisref.isDialogVisible == false || thisref.startedHeatingFromWizard == false) {
                return
            }
            thisref.setTemps()
            thisref.setTempPeriodicTimeout()
        }, 10000)
    }

    public initialization() {
        /// remove any timeout that could be set
        clearTimeout((window as any).targetTempCheckTimeoutRef)
        clearTimeout((window as any).targetBedTempCheckTimeoutRef)
        clearTimeout((window as any).temp_periodic_timeout);
        console.log('initializing TEMP RISE CHECK DIALOG')
        console.log(this.targetHeaterFromTemperatureObjects)
        if (this.targetHeaterFromTemperatureObjects == null) {
            /// error toast and closeReset
            this.$toast.error('No temperature sensor found for ' + this.heaterType)
            this.closeReset()
        }

        var canStep = this.targetHeaterFromTemperatureObjects.temperature < this.configCheckSettings[this.heaterType].minValueToStartTest;
        if (this.heaterType == 'Panels') {
            canStep = canStep && this.targetHeaterBedFromTemperatureObjects.temperature < this.configCheckSettings.Bed.minValueToStartTest
        }

        if (canStep) {
            /// also check if it is panels then it must also be minValueToStartTest                
            this.step = 1 /// it is minimum so we will step into step 2 automatically
            console.log('AUTOSTEPPING 1')
            /// set timeout for settings temps. set temps every 10 seconds because of the idle timeout that happens after XX mins
            this.setTempPeriodicTimeout()
        } else {
            console.log('DID NOT STEP BECAUSE OF TEMPERATURE VALUE:')
            console.log(this.targetHeaterFromTemperatureObjects.temperature)
        }
    }

    get watchedTemperature() {
        return this.targetHeaterFromTemperatureObjects?.temperature ?? 0
    }

    get configObject() {
        return this.configCheckSettings[this.heaterType]
    }

    setTemps() {
        this.setTemp(this.targetHeaterFromTemperatureObjects, this.tempTo)
        if (this.heaterType == 'Panels') {
            this.setTemp(this.targetHeaterBedFromTemperatureObjects, this.configCheckSettings.Bed.tempTo)
        }
    }

    @Watch('watchedTemperature')
    onWatchedTemperatureChanged(newValue: number, oldValue: number) {
        if (this.isDialogVisible == false) {
            return
        }
        if (
            this.targetHeaterFromTemperatureObjects?.temperature < this.configObject.minValueToStartTest &&
            !this.startedHeatingFromWizard
        ) {

            /// check if it is chamber test and if so, check even bed temperature
            if (this.heaterType == 'Panels') {
                const bed = this.targetHeaterBedFromTemperatureObjects
                /// check bed temp
                if (bed.temperature > this.configCheckSettings.Bed.minValueToStartTest) {
                    return
                }
            }
            this.setTemps()
            this.startedHeatingFromWizard = true
            this.setTempPeriodicTimeout()
            this.heatingStartTime = new Date().getTime()
            this.step = 1
            clearTimeout((window as any).targetTempCheckTimeoutRef);
            clearTimeout((window as any).targetBedTempCheckTimeoutRef);
            (window as any).targetTempCheckTimeoutRef = setTimeout(() => {
                this.fail(false, true)
                this.$toast.error('Temperature not reached in time')
            }, this.maxTime)
            /// if this heater is panels also set timeout for bed
            if (this.heaterType == 'Panels') {
                (window as any).targetBedTempCheckTimeoutRef = setTimeout(() => {
                    if (this.bedOk == true) {
                        return false;
                    }
                    this.fail(true, false)
                    this.$toast.error('Bed temperature not reached in time 1')
                }, this.configCheckSettings["Bed"].maxTimeAllowed)
            }


        }
        if (!this.startedHeatingFromWizard) {
            return
        }
        if (newValue >= this.tempTo) {
            ///  if it is panels, check also bed temperature
            if (this.heaterType == 'Panels') {
                const bed = this.targetHeaterBedFromTemperatureObjects
                if (bed.temperature < (this.configCheckSettings["Bed"].tempTo - 5)) {
                    return
                }
            }
            console.log("Trilab Diagnostics Temperature rise check dialog: Temperature changed newValue:" + newValue + " tempTo:" + this.tempTo)
            this.success()
            this.$toast.success('Temperature (' + this.heaterType + ') reached in time')
        }
        var endTest = this.heatingStartTime + this.maxTime < new Date().getTime();
        /// also end test if it is panels and bed temp is not reached in time

        if (this.bedOk == false) {
            const bed = this.targetHeaterBedFromTemperatureObjects;
            if (bed.temperature >= this.configCheckSettings.Bed.tempTo) {
                this.bedOk = true
                this.$emit('catchResult', this.configCheckSettings['Bed'].returnKey, 1);
            }
        }
        if (this.heaterType == 'Panels' && this.bedOk == false) {
            const endTestFromBed = this.getBedRemainingTimeInSeconds() < 0
            if (endTestFromBed) {
                this.$toast.error('Bed temperature not reached in time 2')
                this.fail(true, false);
                return;
            }
        }

        if (endTest) {
            console.log('time is up why? Time now:')
            console.log(new Date().getTime())
            console.log('heating start time:')
            console.log(this.heatingStartTime)
            this.fail(false, true)
            this.$toast.error('Temperature not reached in time')
        }
    }

    get step(): number {
        return this.step_internal
    }
    set step(value: number) {
        /// if step is 2, we have to set timeout on window to wait for endstop to be pressed, each 50 ms
        this.step_internal = value
    }

    get percentage() {
        if (this.targetHeaterFromTemperatureObjects == null) return 0
        return (this.targetHeaterFromTemperatureObjects.temperature / this.tempTo) * 100
    }

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
    sendGcodeHidden(gcode: string) {
        console.log('sending request for endstops query')
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    fail(bed = false, panels = false) {
        this.closeReset()
        if (this.heaterType == 'Panels') { /// also fail the bed
            if (panels == true) {
                /// fail panels
                this.$emit('catchResult', this.configCheckSettings['Panels'].returnKey, 0)
            }
            if (bed == true) {
                /// fail bed
                this.$emit('catchResult', this.configCheckSettings['Bed'].returnKey, 0)
            }
            if (bed == false && panels == false) {
                this.$emit('catchResult', this.configCheckSettings[this.heaterType].returnKey, 0)
            }
        } else {
            this.$emit('catchResult', this.configCheckSettings[this.heaterType].returnKey, 0)
        }

    }
    success() {
        this.$emit('catchResult', this.configCheckSettings[this.heaterType].returnKey, 1)
        if (this.heaterType == 'Panels') { /// also success the bed
            this.$emit('catchResult', this.configCheckSettings['Bed'].returnKey, 1)
        }
        this.closeReset()
    }

    closeReset() {
        console.log('close resetting')
        if (this.startedHeatingFromWizard) {
            this.setTemp(this.targetHeaterFromTemperatureObjects, 0) ///auto cool down if heating  was started from this wizard
            console.log("CLOSERESETTING TRILABDIAGNOSTICSTEMPRISECHECKDIALOG. SETTING TEMP TO 0");
            if (this.heaterType == 'Panels') {
                this.setTemp(this.targetHeaterBedFromTemperatureObjects, 0) /// also cool off the bed
                console.log("CLOSERESETTING TRILABDIAGNOSTICSTEMPRISECHECKDIALOG. SETTING BED TEMP TO 0");
            }
        }
        this.startedHeatingFromWizard = false
        this.step = 0
        this.bedOk = false;
        this.isDialogVisible = false
        /// remove timeout for cooling
        clearTimeout((window as any).targetTempCheckTimeoutRef)
        clearTimeout((window as any).targetBedTempCheckTimeoutRef)
        clearTimeout((window as any).temp_periodic_timeout)

    }

    get isCloseBtnVisible() {
        return true

        //return this.closeBtnVisible || this.step == 0;
    }

    get isDialogVisible() {
        return this.showp
    }
    set isDialogVisible(value) {
        if (!value) {
            this.$emit('close', value)
        }
    }

    get heatersObjectNames() {
        const sensors = this.$store.getters['printer/getAvailableHeaters'] ?? []

        console.log('AVAILABLE HEATERS: ')
        console.log(sensors)
        return sensors
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
}
</script>

<style scoped>
/* Adjust the styles as per your design */
.v-dialog--active {
    transition: opacity 0.3s ease-in-out;
}
</style>
