<template>
    <v-dialog v-model="isDialogVisible" max-width="800px" persistent>
        <v-card>
            <v-card-title class="headline">Filament loading wizard</v-card-title>
            <v-card-text>
                <p>Step {{ step + 1 }}</p>
                <div v-if="step == 0">
                    <p>Select which filament you want to load</p>
                    <v-btn block @click="showSelectFilamentDialog = true" class="green darken-1">Open filament menu</v-btn>
                </div>
                <div v-if="step == 1">
                    <p>Please wait for the temperature to reach {{ selectedFilament.extruder }} °C</p>

                    <v-progress-linear :value="temperatureProgress" color="green darken-1" height="10"></v-progress-linear>
                    
                    <v-divider class="mt-4 mb-4"></v-divider>

                    <v-btn block @click="cancelHeating" class="green darken-1">Cancel heating</v-btn>
                </div>

                <div v-if="step == 2">
                    <p>Insert filament into the extruder and press continue</p>
                    <v-btn block @click="loadFilament" class="green darken-1">Continue</v-btn>
                </div>

                <div v-if="step == 3">
                    <p v-if="idleTimeout != 'Ready'">Filament is loading...</p>
                    <div v-if="idleTimeout == 'Ready'">
                        <p>Is color clean?</p>
                        <v-btn block @click="purgeMore" class="green darken-1">Purge More</v-btn>
                        <v-btn block @click="closeCooldown" class="green darken-1">Cooldown & Close</v-btn>
                        <v-btn block @click="close" class="green darken-1">Close</v-btn>
                    </div>
                </div>

                <div v-if="step == 4">

                </div>

                <div v-if="step == 0">
                    <v-divider class="mt-4 mb-4"></v-divider>
                    <v-btn @click="$emit('close')">Cancel wizard</v-btn>
                </div>
            </v-card-text>
        </v-card>



        <trilab-select-filament-dialog :showp="showSelectFilamentDialog" @selectFilament="selectFilamentAction"
            @close="showSelectFilamentDialog = false"></trilab-select-filament-dialog>


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
        return this.$store.state.printer.idle_timeout?.state ?? "unknown"
    }

    async loadFilament() {
        /* 
                self._screen._ws.klippy.gcode_script(f"SAVE_GCODE_STATE NAME=LOAD_FILAMENT")
        self._screen._ws.klippy.gcode_script(f"M83")
        self._screen._ws.klippy.gcode_script(f"G0 E35 F600")
        self._screen._ws.klippy.gcode_script(f"G0 E50 F300")
        self._screen._ws.klippy.gcode_script(f"G1 E-18.0 F1500")
        self._screen._ws.klippy.gcode_script(f"RESTORE_GCODE_STATE NAME=LOAD_FILAMENT")

        */
        await this.$store.dispatch('printer/sendGcode', `SAVE_GCODE_STATE NAME=LOAD_FILAMENT`);
        await this.$store.dispatch('printer/sendGcode', `M83`);
        await this.$store.dispatch('printer/sendGcode', `G0 E35 F600`);
        await this.$store.dispatch('printer/sendGcode', `G0 E50 F300`);
        await this.$store.dispatch('printer/sendGcode', `G1 E-18.0 F1500`);
        await this.$store.dispatch('printer/sendGcode', `RESTORE_GCODE_STATE NAME=LOAD_FILAMENT`);
        /// add events
        await this.$store.dispatch('server/addEvent', { message: `SAVE_GCODE_STATE NAME=LOAD_FILAMENT`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `M83`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G0 E35 F600`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G0 E50 F300`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G1 E-18.0 F1500`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `RESTORE_GCODE_STATE NAME=LOAD_FILAMENT`, type: 'command' })

        this.step = 3;
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
        await this.$store.dispatch('printer/sendGcode', `G0 E18 F1500`);
        await this.$store.dispatch('printer/sendGcode', `G0 E50 F300`);
        await this.$store.dispatch('printer/sendGcode', `G1 E-18.0 F1500`);
        await this.$store.dispatch('printer/sendGcode', `RESTORE_GCODE_STATE NAME=LOAD_FILAMENT`);

        /// add events
        await this.$store.dispatch('server/addEvent', { message: `SAVE_GCODE_STATE NAME=LOAD_FILAMENT`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `M83`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G0 E18 F1500`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G0 E50 F300`, type: 'command' })
        await this.$store.dispatch('server/addEvent', { message: `G1 E-18.0 F1500`, type: 'command' })
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
            return this.extruderObjects[0].value / this.selectedFilament.extruder * 100;
        }
        return 0;
    }
    localShowSelectFilamentDialog: boolean = false;
    created() {
        this.localShowSelectFilamentDialog = this.showp; // Initialize localShowp in the created hook
    }

    close() {
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
            const gcode = temperatureObject.command + ' ' + temperatureObject.attributeName + '=' + temperatureObject.name + ' TARGET=' + targetTemp
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
  