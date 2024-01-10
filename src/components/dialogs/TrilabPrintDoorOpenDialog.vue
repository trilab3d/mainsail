<template>
    <v-dialog v-model="isDialogVisible" @close="close" width="720">
        <v-card>
            <v-card-title>
                <span class="headline">
                    Doors are open
                </span>
            </v-card-title>

            <v-card-text>
                <p>Doors are open and the print is paused. Either disable the sensor or close the door and continue the
                    print</p>
                <v-btn block color="green" :disabled="!allDoorsClosed" @click="continuePrint()">
                    <v-icon left>{{ mdiReload }}</v-icon>Continue</v-btn>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import axios from 'axios'

import store from '@/store'

import { mdiReload } from '@mdi/js';


import BaseMixin from '../mixins/base'
import TrilabMixin from '../mixins/trilab'
import { Mixins } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { PropSync, Prop, Vue, Watch } from 'vue-property-decorator'
import { trilab } from '@/store/trilab'

@Component({})
export default class TrilabPrintDoorOpenDialog extends Mixins(BaseMixin, TrilabMixin) {
    public dismissVisible: boolean = true;
    public localVisible: boolean = true;
    public mdiReload = mdiReload;



    continuePrint() {
        this.$socket.emit('printer.print.resume', {}, { loading: 'statusPrintResume' })
    }

    close() {
        this.localVisible = false;
    }

    retryPrint() {
        /// check if the lastemitcommand is not null
        if (this.$store.state.trilab.lastEmitCommand == null) {
            console.log("Last emit command is null");
            return;
        }
        this.$socket.emit(this.$store.state.trilab.lastEmitCommand.method, this.$store.state.trilab.lastEmitCommand.params, this.$store.state.trilab.lastEmitCommand.options);
    }

    get uploadFileProgressbarColor() {
        if (this.liveUpdateStatus == "ERROR") {
            return "danger";
        }
        return "primary";
    }
    get isDialogVisible() {
        return this.$store.state.printer?.print_stats?.state === "paused" && !this.allDoorsClosed && this.localVisible;
    }
    get doorSensors() {
        return this.$store?.getters['printer/getDoorSensors'] ?? []
    }
    get allDoorsClosed(): boolean {
        /// enabled is when all doors are closed    
        for (let i = 0; i < this.doorSensors.length; i++) {
            if (!this.doorSensors[i].door_closed && this.doorSensors[i].enabled) {
                return false;
            }
        }
        return true;
    }


    get printerBusy() {
        const idle_timeout_state = this.$store.state.printer.idle_timeout?.state
        return this.printerIsPrinting || idle_timeout_state === "Printing";
    }
    get get_state() {
        return this.$store.state.printer.idle_timeout?.state
    }

    @Watch('printerBusy')
    onPrinterBusyChanged() {
        if (this.printerBusy) {
            this.localVisible = true;
        }
    }

}

</script>


<style scoped>
.ulog p {
    margin-left: 16px;
    margin-bottom: 0px;
}
</style>
