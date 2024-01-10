<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">{{ $t('Trilab.TrilabFilamentLoadWizard.FilamentLoadWizard') }}</v-card-title>
            <v-card-text>
                <div v-if="step == 0">
                    <p>{{ $t("Trilab.TrilabFilamentLoadWizard.SelectWhichFilamentYouWantToLoad") }}</p>
                    <trilab-select-filament-dialog :showp="showSelectFilamentDialog"
                        @selectFilament="selectFilamentAction"></trilab-select-filament-dialog>


                </div>
                <div v-if="step == 1">
                    <div v-if="temperatureProgress < 99.8">
                        <p>{{ $t("Trilab.TrilabFilamentLoadWizard.PleaseWaitForTheTemperatureToReach") }} {{
                            selectedFilament.extruder }} °C</p>

                        <v-progress-linear :value="temperatureProgress" color="orange darken-1"
                            height="10"></v-progress-linear>

                        <v-divider class="mt-4 mb-4"></v-divider>

                        <v-btn block @click="cancelHeating" class="red darken-1">{{
                            $t("Trilab.TrilabFilamentLoadWizard.CancelHeating") }} </v-btn>
                    </div>
                    <div v-if="temperatureProgress >= 99.8">
                        <p>{{ $t("Trilab.TrilabFilamentLoadWizard.InsertFilamentIntoExtruder") }}</p>
                        <v-btn block @click="loadFilament" class="orange darken-1">{{
                            $t("Trilab.TrilabFilamentLoadWizard.Continue") }}</v-btn>
                    </div>
                </div>

                <div v-if="step == 2">
                    <div v-if="idleTimeout != 'Ready'">
                        <p>{{ $t('Trilab.TrilabFilamentLoadWizard.FilamentIsLoading') }}</p>
                        <v-progress-linear :value="currentProgressPercentage" color="orange darken-1"
                            height="10"></v-progress-linear>
                        <v-divider class="mt-4 mb-4"></v-divider>
                        <v-btn block @click="cancelLoading()" class="red darken-1">{{
                            $t("Trilab.TrilabFilamentLoadWizard.CancelLoading") }} </v-btn>
                    </div>
                    <div v-if="idleTimeout == 'Ready'">
                        <p>{{ $t("Trilab.TrilabFilamentLoadWizard.IsColorClean") }} </p>
                        <v-btn block @click="purgeMore" class="orange darken-1 mt-2">{{
                            $t("Trilab.TrilabFilamentLoadWizard.PurgeMore") }}</v-btn>
                        <v-btn block @click="closeCooldown" class="orange darken-1 mt-2">{{
                            $t("Trilab.TrilabFilamentLoadWizard.CooldownAndClose") }}</v-btn>
                        <v-btn block @click="close" class="orange darken-1 mt-2">{{
                            $t("Trilab.TrilabFilamentLoadWizard.Close")
                        }}</v-btn>
                    </div>
                </div>

                <div v-if="step == 0">
                    <v-divider class="mt-4 mb-4"></v-divider>
                    <v-btn block color="red darken-1" @click="$emit('close')">{{
                        $t("Trilab.TrilabFilamentLoadWizard.CancelWizard") }}</v-btn>
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
export default class TrilabFilamentLoadWizard extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean


    public showSelectFilamentDialog: boolean = false;

    public selectedFilament: any = {};

    public step = 0;

    public idleTimeoutOverride = '';

    public loadingSequenceStart = new Date();

    public commandStart = new Date();

    public loadingStarted = 0;

    public loadingFinished = 0;

    public currentCommandIndex = 0;

    public loadingTimeout: any = null;

    public currentProgressPercentage = 0;

    public updateProgressInterval: any = null;

    public actionTimeout: any = null;

    //// SEQUENCES
    public commandSequence = [
        {
            command: "SAVE_GCODE_STATE NAME=LOAD_FILAMENT", duration: 0, repeat: 1, originalRepeat: 1
        },
        {
            command: "M83", duration: 0, repeat: 1, originalRepeat: 1
        },
        {
            command: "G0 E5 F600", duration: 1000, originalRepeat: 6, repeat: 6
        },
        {
            command: "G0 E5 F300", duration: 1000, originalRepeat: 10, repeat: 10
        },
        {
            command: "_FILAMENT_RETRACT", duration: 1000, originalRepeat: 1, repeat: 1
        },
        {
            command: "RESTORE_GCODE_STATE NAME=LOAD_FILAMENT", duration: 0, repeat: 1, originalRepeat: 1
        },

    ]


    get totalDuration() {
        /// will return the total duration in ms
        let total = 0;
        for (let i = 0; i < this.commandSequence.length; i++) {
            const element = this.commandSequence[i];
            total += element.duration * (element.originalRepeat ?? 1);
        }
        return total;
    }

    remainingDuration() {
        /// will return the remaining duration in ms
        let total = 0;
        for (let i = this.currentCommandIndex; i < this.commandSequence.length; i++) {
            const element = this.commandSequence[i];
            total += element.duration * (element.repeat ?? 1);
        }
        return total;
    }
    nextRemainingDuration() {
        /// will return the remaining duration in ms
        let total = 0;
        if (this.currentCommandIndex + 1 >= this.commandSequence.length) {
            return 0;
        }
        var originalI = this.currentCommandIndex;
        for (let i = this.currentCommandIndex; i < this.commandSequence.length; i++) {
            const element = this.commandSequence[i];
            let elemRepeat = element.repeat ?? 1;
            if (i == originalI) {
                elemRepeat -= 1;
            }
            total += element.duration * (elemRepeat);
        }
        return total;
    }
    resetSequences() {
        try {
            clearInterval(this.updateProgressInterval);
        } catch (e) {
            //console.log(e);
        }
        /// set the repeat to original
        for (let i = 0; i < this.commandSequence.length; i++) {
            const element = this.commandSequence[i];
            if ('repeat' in element) {
                element.repeat = element.originalRepeat;
            }
        }
        this.currentCommandIndex = 0;
    }
    get totalCommands() {
        let total = 0;
        for (let i = 0; i < this.commandSequence.length; i++) {
            total += this.commandSequence[i].repeat ?? 1;
        }
        return total;
    }
    get remainingCommands() {
        let total = 0;
        for (let i = 0; i < this.commandSequence.length; i++) {
            if (this.currentCommandIndex >= i) {
                total += this.commandSequence[i].repeat ?? 1;
            }
        }
        return total;
    }
    nextKrok() {
        this.commandSequence[this.currentCommandIndex].repeat -= 1;
        if (this.commandSequence[this.currentCommandIndex].repeat > 0) {
            this.commandStart = new Date();
            return true;
        }
        this.commandStart = new Date();
        this.currentCommandIndex += 1;
        if (this.currentCommandIndex >= this.commandSequence.length) {
            this.currentCommandIndex = this.commandSequence.length - 1;
            return false;
        }
        return true;
    }
    updateCurrentPercentage() {
        const currentTime: any = new Date();
        let elapsedCommandTime = currentTime.getTime() - this.commandStart.getTime();
        if (elapsedCommandTime > this.commandSequence[this.currentCommandIndex].duration) {
            elapsedCommandTime = this.commandSequence[this.currentCommandIndex].duration;
        }
        console.log('elapsed: ' + elapsedCommandTime);
        /// make let startpercentage based on totalDuration and remainingDuration
        const startPercentage = 100 - (this.remainingDuration() / this.totalDuration * 100);
        const nextStartPercentage = 100 - (this.nextRemainingDuration() / this.totalDuration * 100);
        /// nowe we have where it started, we need to add the percentage of the current command based on currentTime and command duration and commandStart
        const currentCommand = this.commandSequence[this.currentCommandIndex];
        const ccduration = currentCommand.duration;
        let currentCommandPercentage = 100;
        if (ccduration > 0) {
            currentCommandPercentage = elapsedCommandTime / ccduration * 100;
        }
        if (currentCommandPercentage > 100) {
            currentCommandPercentage = 100;
        }

        /// calculate the percentage based on currentCommandPercentage between startPercentage and nextStartPercentage
        let calculated = (nextStartPercentage - startPercentage) * (currentCommandPercentage / 100);
        if (calculated > 100) {
            calculated = 100;
        }
        if (calculated < 0) {
            calculated = 0;
        }

        console.log("calculated: " + calculated);
        console.log("startPercentage: " + startPercentage);
        console.log("nextStartPercentage" + nextStartPercentage);
        console.log("currentCommandPercentage" + currentCommandPercentage);

        let percentage = startPercentage + calculated;


        console.log("current percentage");
        console.log(percentage);

        percentage = Math.max(0, Math.min(percentage, 100));

        this.currentProgressPercentage = percentage;
    }



    //// END SEQUENCES ///


    get isDialogVisible() {
        return this.showp;
    }
    set isDialogVisible(value) {
        if (!value) {
            this.$emit('close', value);
            this.showp = false;
        }
    }


    get idleTimeout() {
        if (this.idleTimeoutOverride != '') {
            return this.idleTimeoutOverride;
        }
        return this.$store.state.printer.idle_timeout?.state ?? "unknown"
    }

    cancelLoading() {
        try {
            clearInterval(this.updateProgressInterval);
        } catch (e) {
            console.log(e);
        }
        try {
            clearTimeout(this.actionTimeout);
        } catch (e) {
            console.log(e);
        }
        this.resetSequences();
        this.cancelHeating();
        this.step = 0;
        this.currentProgressPercentage = 0;

        /// send restore gcode state
        this.$store.dispatch('printer/sendGcode', `RESTORE_GCODE_STATE NAME=LOAD_FILAMENT`);
    }

    async loadFilament() {
        this.loadingSequenceStart = new Date();
        /// immediately call the first command
        this.loadFilamentPart();
        this.updateProgressInterval = setInterval(() => {
            this.updateCurrentPercentage();
        }, 100);

        /// set the idleTimeout to 'Loading' temporarily
        this.idleTimeoutOverride = 'Loading';
        /// after 2 seconds set it to ''
        setTimeout(() => {
            this.idleTimeoutOverride = '';
        }, 2000);
        this.step = 2;
    }


    async loadFilamentPart() {
        let commandToUse = this.commandSequence[this.currentCommandIndex];
        console.log("sending command");
        console.log(commandToUse.command);
        //console.log(this.commandStart);
        //console.log(this.currentCommandIndex);
        /// send the command
        console.log("awaitResult under: ");
        console.log(await this.$store.dispatch('printer/sendGcode', commandToUse.command));
        /// sent, next add events
        await this.$store.dispatch('server/addEvent', { message: commandToUse.command, type: 'command' })

        /// nextKrok
        let canNext = this.nextKrok();
        //console.log("CANNEXT: ");
        //console.log(canNext);
        var currentDuration = commandToUse.duration;
        if (canNext == true) {
            this.actionTimeout = setTimeout(() => {
                this.loadFilamentPart();
            }, currentDuration);
        } else {
            this.step = 2;
            this.resetSequences();
        }
    }



    async purgeMore() {
        /*        self._screen._ws.klippy.gcode_script(f"SAVE_GCODE_STATE NAME=LOAD_FILAMENT")
        self._screen._ws.klippy.gcode_script(f"M83")
        self._screen._ws.klippy.gcode_script(f"G0 E18 F1500")
        self._screen._ws.klippy.gcode_script(f"G0 E50 F300")
        self._screen._ws.klippy.gcode_script(f"G1 E-18.0 F1500")
        self._screen._ws.klippy.gcode_script(f"RESTORE_GCODE_STATE NAME=LOAD_FILAMENT")
        */
        await this.$store.dispatch('printer/sendGcode', `SAVE_GCODE_STATE NAME=LOAD_FILAMENT`);
        await this.$store.dispatch('printer/sendGcode', `M83`);
        await this.$store.dispatch('printer/sendGcode', `_FILAMENT_UNRETRACT`);
        await this.$store.dispatch('printer/sendGcode', `G0 E50 F300`);
        await this.$store.dispatch('printer/sendGcode', `_FILAMENT_RETRACT`);
        await this.$store.dispatch('printer/sendGcode', `RESTORE_GCODE_STATE NAME=LOAD_FILAMENT`);

        /// add events
        await this.$store.dispatch('server/addEvent', { message: `SAVE_GCODE_STATE NAME=LOAD_FILAMENT`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `M83`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `_FILAMENT_UNRETRACT`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G0 E50 F300`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `_FILAMENT_RETRACT`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `RESTORE_GCODE_STATE NAME=LOAD_FILAMENT`, type: 'command' })

    }

    async closeCooldown() {
        /*
                for heater in self.heaters:
            logging.info(f"Cooling Down heater {heater}")
            name = heater.split()[1] if len(heater.split()) > 1 else heater
            target = 0
            if heater.startswith('extruder'):
                self._screen._ws.klippy.set_tool_temp(self._printer.get_tool_number(heater), target)
            elif heater.startswith('heater_bed'):
                self._screen._ws.klippy.set_bed_temp(target)
            elif heater.startswith('heater_chamber'):
                self._screen._ws.klippy.set_chamber_temp(target)
            elif heater.startswith('heater_generic '):
                self._screen._ws.klippy.set_heater_temp(name, target)
            elif heater.startswith('temperature_fan '):
                self._screen._ws.klippy.set_temp_fan_temp(name, target)
            */

        for (let i = 0; i < this.temperatureObjects.length; i++) {
            const sensor = this.temperatureObjects[i];
            if (sensor.type.startsWith('extruder') || sensor.type.startsWith('heater_bed') || sensor.type.startsWith('heater_chamber') || sensor.type.startsWith('heater_generic') || sensor.type.startsWith('temperature_fan')) {
                this.setTemp(sensor, 0);
            }

        }
        this.close();


    }

    async cancelHeating() {
        this.step = 0;
        await this.$store.dispatch('printer/sendGcode', `M104 S0`);
        await this.$store.dispatch('printer/sendGcode', `M140 S0`);
        await this.$store.dispatch('printer/sendGcode', `M141 S0`);
        await this.$store.dispatch('printer/sendGcode', `M106 S0`);

        /// add events
        await this.$store.dispatch('server/addEvent', { message: `M104 S0`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `M140 S0`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `M141 S0`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `M106 S0`, type: 'command' })
    }

    get temperatureProgress() {
        if (typeof this.extruderObjects[0] == 'object') {
            //console.log(this.extruderObjects[0].temperature);
            //console.log(this.selectedFilament.extruder);
            //console.log(this.extruderObjects[0].temperature / this.selectedFilament.extruder * 100);
            return this.extruderObjects[0].temperature / this.selectedFilament.extruder * 100;
        }
        //console.log("Neznamy progress");
        return 0;
    }
    localShowSelectFilamentDialog: boolean = false;
    created() {
        this.localShowSelectFilamentDialog = this.showp; // Initialize localShowp in the created hook
    }

    close() {
        this.step = 0;
        this.$emit('close');
    }
    selectFilament(filamentObj: any) {
        this.$emit('selectFilament', filamentObj);
    }
    get temperatureObjects() {
        const sensors = this.$store.getters['printer/getTemperatureObjects'] ?? []

        return sensors.filter((sensor: PrinterStateTemperatureObject) => !sensor.name.startsWith('_'))
    }

    get extruderObjects() {
        return this.temperatureObjects.filter((sensor: PrinterStateTemperatureObject) => sensor.type == 'extruder')
    }
    get bedObjects() {
        return this.temperatureObjects.filter((sensor: PrinterStateTemperatureObject) => sensor.type == 'heater_bed')
    }
    get chamberObjects() {
        return this.temperatureObjects.filter((sensor: PrinterStateTemperatureObject) => sensor.type == 'heater_chamber')
    }


    get flapObject() {
        /// getters in printer store, getmiscellaneous that is servo_flap or stepper_flap
        return this.$store.getters['printer/getMiscellaneous'].filter((sensor: any) => sensor.type == 'servo_flap' || sensor.type == 'stepper_flap')
    }

    selectFilamentAction(filamentObj: any) {
        console.log(filamentObj);
        this.showSelectFilamentDialog = false;
        this.selectedFilament = filamentObj;
        /// start heating


        /// najdeme chamber, extruder, bed a flap

        console.log(this.temperatureObjects);

        this.$store.dispatch('printer/sendGcode', `M104 S${filamentObj.extruder}`);
        this.$store.dispatch('printer/sendGcode', `M140 S${filamentObj.bed}`);
        this.$store.dispatch('printer/sendGcode', `M141 S${filamentObj.chamber}`);

        this.step = 1;

        //this.$store.dispatch('printer/sendGcode', `M106 S${filamentObj.flap}`);


        ///const extruderObject = this.temperatureObjects.find((sensor: PrinterStateTemperatureObject) => sensor.type == 'extruder')
        //const bedObject = this.temperatureObjects.find((sensor: PrinterStateTemperatureObject) => sensor.type == 'heater_bed')
        //const chamberObject = this.temperatureObjects.find((sensor: PrinterStateTemperatureObject) => sensor.type == 'heater_chamber')
        /// waiting for backend klipper implementation const flapObject = this.flapObject;






        /*if (typeof extruderObject == 'object') {
                this.setTemp(extruderObject, filamentObj.extruder);
        }
        if (typeof bedObject == 'object') {
              this.setTemp(bedObject, filamentObj.bed);
        }
        if (typeof chamberObject == 'object') {
                this.setTemp(chamberObject, filamentObj.chamber);
        }*/

        /// we will set all the things and we have to send the gcode



        /* <temperature-input
         v -if= "object.command !== null"
                                             : name = "object.name"
                                             : target = "object.target"
                                             : presets = "object.presets"
                                             : min_temp = "object.min_temp"
                                             : max_temp = "object.max_temp"
                                             : command = "object.command"
                                             : attribute - name="object.commandAttributeName" > </temperature-input>
 
 
 
         const gcode = this.command + ' ' + this.attributeName + '=' + this.name + ' TARGET=' + this.value
         this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
         this.$socket.emit('printer.gcode.script', { script: gcode })*/



        /*this.$store.dispatch('printer/sendGcode', `M104 S${filamentObj.extruder}`);
        this.$store.dispatch('printer/sendGcode', `M140 S${filamentObj.bed}`);
        this.$store.dispatch('printer/sendGcode', `M141 S${filamentObj.chamber}`);
        this.$store.dispatch('printer/sendGcode', `M106 S${filamentObj.flap}`);*/
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


    closeFilamentSelect() {
        this.showSelectFilamentDialog = false;
    }



}
</script>
    
<style scoped>
/* Adjust the styles as per your design */
.v-dialog--active {
    transition: opacity 0.3s ease-in-out;
}
</style>
  