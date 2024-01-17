<template>
    <v-container py-0 px-0>
        <v-tabs v-model="activeTab">
            <v-tab v-for="(tab, index) of tabTitles" :key="index" :href="'#' + tab.name" style="width: 200px">
                <v-icon left v-html="tab.icon"></v-icon>
                <span class="text-truncate">{{ tab.title }}</span>
            </v-tab>
        </v-tabs>

        <v-container>
            <v-row>
                <v-col cols="12" md="12" sm="12" class="pa-3 mt-3">

                    <div v-if="activeTab == 'basic'">
                        <v-row v-if="heatbreakfanPresent" align="center">
                            <v-col class="justify-center" cols="6">Větrák - kontrola otáček</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" @click="testFan(1)">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon color="success" v-if="testResults.heatbreakfan == 1">{{ mdiCheckCircle }}</v-icon>
                                <v-icon v-if="testResults.heatbreakfan == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                        </v-row>
                        <v-row v-if="chamberIntakeFlapPresent" align="center">
                            <v-col cols="6">Chamber Intake klapka - kontrola pohybu</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2"
                                    @click="testChamberFlapIntake(1); chamberflapTestDialogOpen = true">Test</v-btn>
                            </v-col>
                            <v-col cols="3">
                                <v-icon color="success" v-if="testResults.chamberflap == 1">{{ mdiCheckCircle }}</v-icon>
                                <v-icon color="red" v-if="testResults.chamberflap == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                            <v-dialog v-model="chamberflapTestDialogOpen" max-width="290"
                                @close="chamberflapTestDialogOpen = false">
                                <v-card>
                                    <v-card-title class="text-h5">
                                        Pohnula se chamber klapka?
                                    </v-card-title>
                                    <v-card-text>Klapka je vyobrazena na obrázku níže. Její pohnutí můžete poznat i pomocí
                                        zvuku</v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text
                                            @click="chamberflapTestDialogOpen = false; testResults.chamberflap = 1">
                                            Ano
                                        </v-btn>
                                        <v-btn color="red darken-1" text
                                            @click="chamberflapTestDialogOpen = false; testResults.chamberflap = 0">
                                            Ne
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                        </v-row>
                        <v-row v-if="printFlapPresent" align="center">
                            <v-col cols="6">Print klapka - kontrola pohybu</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2"
                                    @click="testPrintFlap(1); printflapTestDialogOpen = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon color="success" v-if="testResults.printflap == 1">{{ mdiCheckCircle }}</v-icon>
                                <v-icon color="red" v-if="testResults.printflap == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                            <v-dialog v-model="printflapTestDialogOpen" max-width="290"
                                @close="printflapTestDialogOpen = false">
                                <v-card>
                                    <v-card-title class="text-h5">
                                        Pohnula se klapka?
                                    </v-card-title>
                                    <v-card-text>Klapka je vyobrazena na obrázku níže</v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text
                                            @click="printflapTestDialogOpen = false; testResults.printflap = 1">
                                            Ano
                                        </v-btn>
                                        <v-btn color="red darken-1" text
                                            @click="printflapTestDialogOpen = false; testResults.printflap = 0">
                                            Ne
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                        </v-row>
                        <v-row align="center">
                            <v-col cols="6">Kontrola USB portů</v-col>
                            <v-col cols="6">
                                {{ usbNumber }} detekovaných zapojení USB
                            </v-col>
                        </v-row>

                        <!---<miscellaneous-panel></miscellaneous-panel>--->
                        <miscellaneous-panel></miscellaneous-panel>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCog, mdiPackageVariantClosed, mdiAlphaBBox, mdiCheckCircle, mdiCross } from '@mdi/js'
@Component({
    components: {
        //TrilabDeltaCalibrationWizard,

    },
})
export default class PageTrilabDiagnostics extends Mixins(BaseMixin) {


    mdiCheckCircle = mdiCheckCircle;
    mdiCross = mdiCross;

    public printflapTestDialogOpen = false;
    public chamberflapTestDialogOpen = false;

    public testResults = {
        "fan": -1,
        "heatbreakfan": -1,
        "chamberflap": -1,
        "printflap": -1,
        "usb": -1,
    }


    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    testChamberFlapIntake(status: number) {
        console.log("testChamberFlapIntake");
        let speed = 1;
        if (status == 0) { speed = 0; }
        const gcode = `SET_FAN_SPEED FAN=intake_flap SPEED=${speed}`
        this.sendGcode(gcode)
    }
    testPrintFlap(status: number) {
        /// status depends on target power attribute
        const power = this.printFlapPresent[0]?.power ?? 0;
        console.log("testPrintFlap");
        let speed = 1;

        /// set the speed to farthest value from the current power value. For example if current power is 20, set 1, if current power is 60, set 0
        if (power > 50) { speed = 0; } else { speed = 1; }


        if (status == 0) { speed = 0; }
        const gcode = `SET_FAN_SPEED FAN=print_flap SPEED=${speed}`
        this.sendGcode(gcode)
    }
    testFan(status: number) {
        /// here we have to heat the hotend to 50 degrees
        /// SET_HEATER_TEMPERATURE HEATER=extruder TARGET=
        /// status depends on target power attribute
        console.log("testFan");
        let speed = 0.5;
        let temp = 30;
        if (status == 0) { speed = 0; temp = 0; }

        const gcodeheater = `SET_HEATER_TEMPERATURE HEATER=extruder TARGET=${temp}`
        this.sendGcode(gcodeheater)
        const gcode = `HEATER_FAN_SET_SPEED FAN=heatbreak_fan SPEED=${speed}`
        this.sendGcode(gcode)

        if (status == 1) {
            setTimeout(() => {
                /// check rpm if it is between 7500 and 8000, then it is ok, otherwise 0
                const rpm = this.heatbreakfanPresent[0]?.rpm ?? 0;
                if (rpm > 7500 && rpm < 8000) {
                    this.testResults.heatbreakfan = 1;
                } else {
                    this.testResults.heatbreakfan = 0;
                }
                this.testFan(0);
            }, 5000);
        }
    }
    testHeatbreakFan(status: number) {
        /// we have to heat the hotend to 50 degrees
        let speed = 0.5;
        if (status == 0) { speed = 0; }
        console.log("testHeatbreakFan");
        const fan = this.heatbreakfanPresent;
        if (fan.length == 0) {
            console.log("heatbreak fan not present");
            return;
        }
        const setspeed = speed * fan[0].scale;
        const gcode = `HEATER_FAN_SET_SPEED FAN=heatbreak_fan SPEED=0.5`
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

    get usbNumber() {
        /// filter this store files filetree - that is list with objects. It has childrens[], disk_usage, filename,isDirectory (bool), modified, permissions
        /// therefore count every filetree and their childrens and their childrens if the filename starts with usb and isDirectory == true
        const filetree = this.$store.state.files.filetree ?? [];
        let usbNumber = 0;
        for (let i = 0; i < filetree.length; i++) {
            const element = filetree[i];
            if (element.filename.startsWith("usb") && element.isDirectory && element.modified == 0) {
                usbNumber++;
            }
            if (element.childrens) {
                for (let j = 0; j < element.childrens.length; j++) {
                    const element2 = element.childrens[j];
                    if (element2.filename.startsWith("usb") && element2.isDirectory && element2.modified == 0) {
                        usbNumber++;
                    }
                    if (element2.childrens) {
                        for (let k = 0; k < element2.childrens.length; k++) {
                            const element3 = element2.childrens[k];
                            if (element3.filename.startsWith("usb") && element3.isDirectory && element3.modified == 0) {
                                usbNumber++;
                            }
                        }
                    }
                }
            }
        }
        return usbNumber;
    }


}
</script>
