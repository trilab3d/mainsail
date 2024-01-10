<template>
    <v-container py-0 px-0>
        <v-tabs v-model="activeTab">
            <v-tab v-for="(tab, index) of tabTitles" :key="index" :href="'#' + tab.name" style="width: 200px">
                <v-icon left v-html="tab.icon"></v-icon>
                <span class="text-truncate">{{ tab.title }}</span>
            </v-tab>
        </v-tabs>

        <v-row>
            <v-col cols="12" md="12" sm="12" class="pa-3 mt-3">

                <div v-if="activeTab == 'basic'">
                    <v-row v-if="heatbreakfanPresent" align="center">
                        <v-col class="justify-center" cols="6">Větrák - kontrola otáček</v-col>
                        <v-col cols="1">
                            <v-btn color="primary" @click="testFan">Test</v-btn>
                        </v-col>
                        <v-col cols="5">
                            <span>{{ heatbreakfanPresent[0]?.rpm ?? 0 }} RPM</span>
                        </v-col>
                    </v-row>
                    <v-row v-if="chamberIntakeFlapPresent" align="center">
                        <v-col cols="6">Chamber Intake klapka - kontrola pohybu</v-col>
                        <v-col cols="6">
                            <v-btn color="primary" @click="testChamberFlapIntake">Test</v-btn>
                        </v-col>
                    </v-row>
                    <v-row v-if="printFlapPresent" align="center">
                        <v-col cols="6">Print klapka - kontrola pohybu</v-col>
                        <v-col cols="6">
                            <v-btn color="primary" @click="testPrintFlap">Test</v-btn>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCog, mdiPackageVariantClosed, mdiAlphaBBox } from '@mdi/js'
@Component({
    components: {
        //TrilabDeltaCalibrationWizard,
    },
})
export default class PageTrilabDiagnostics extends Mixins(BaseMixin) {

    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    testChamberFlapIntake() {
        console.log("testChamberFlapIntake");

        const gcode = `SET_FAN_SPEED FAN=intake_flap SPEED=0.5`
        this.sendGcode(gcode)
    }
    testPrintFlap() {
        console.log("testPrintFlap");
        const gcode = `SET_FAN_SPEED FAN=print_flap SPEED=1`
        this.sendGcode(gcode)
    }
    testFan() {
        console.log("testFan");
        const gcode = `M106 S0.5`
    }
    testHeatbreakFan() {
        console.log("testHeatbreakFan");
        const fan = this.heatbreakfanPresent;
        if (fan.length == 0) {
            console.log("heatbreak fan not present");
            return;
        }
        const setspeed = 0.5 * fan[0].scale;
        const gcode = `SET_FAN_SPEED FAN=heatbreak_fan SPEED=0.5`
        this.sendGcode(gcode)
    }



    public activeTab = "delta";
    public tabTitles = [
        {
            title: "Basic",
            name: "basic",
            icon: mdiAlphaBBox
        },
    ];

    get heatbreakfanPresent() {
        return this.$store.getters['printer/getMiscellaneous'].filter((item: any) => item.name == 'heatbreak_fan') ?? []
    }

    get chamberIntakeFlapPresent() {
        return this.$store.getters['printer/getMiscellaneous'].filter((item: any) => item.name == 'intake_flap') ?? []
    }

    get printFlapPresent() {
        return this.$store.getters['printer/getMiscellaneous'].filter((item: any) => item.name == 'print_flap') ?? []
    }

    get miscellaneous() {
        return this.$store.getters['printer/getMiscellaneous'] ?? []
    }


}
</script>
