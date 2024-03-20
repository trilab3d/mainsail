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
                        <div class="pa-4">
                            <v-btn color="primary" class="mr-2" :loading="testAllInProgress"
                                :disabled="testAllInProgress" @click="testAll()">Run all tests</v-btn>

                            <v-btn color="primary" class="mr-2"
                                :disabled="testAllInProgress || (currentStep == null || currentStep == 'heatbreakfan')" @click="resumeTestAll()">Resume from last</v-btn>


                        </div>

                        <v-row v-if="heatbreakfanPresent" align="center">
                            <v-col class="justify-center" cols="6">Fan - speed control</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" :loading="fanTestLoading" :disabled="fanTestLoading"
                                    @click="testFan(1)">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon color="success" v-if="testResults.heatbreakfan == 1">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon v-if="testResults.heatbreakfan == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                        </v-row>
                        <v-row v-if="chamberIntakeFlapPresent" align="center">
                            <v-col cols="6">Chamber Intake flap - motion control</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2"
                                    @click="testChamberFlapIntake(1); chamberflapTestDialogOpen = true">Test</v-btn>
                            </v-col>
                            <v-col cols="3">
                                <v-icon color="success" v-if="testResults.chamberflap == 1">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon color="red" v-if="testResults.chamberflap == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                            <v-dialog v-model="chamberflapTestDialogOpen" max-width="290"
                                @close="chamberflapTestDialogOpen = false">
                                <v-card>
                                    <v-card-title class="text-h5">
                                        Did the chamber flap move?
                                    </v-card-title>
                                    <v-card-text>The flap is depicted in the image below. Its movement can also be
                                        recognized by sound.</v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text
                                            @click="chamberflapTestDialogOpen = false; testResults.chamberflap = 1">
                                            Yes
                                        </v-btn>
                                        <v-btn color="red darken-1" text
                                            @click="chamberflapTestDialogOpen = false; testResults.chamberflap = 0">
                                            No
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>

                        </v-row>
                        <v-row v-if="printFlapPresent" align="center">
                            <v-col cols="6">Print flap - motion control</v-col>
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
                                        Did the print flap move?
                                    </v-card-title>
                                    <v-card-text>The flap is depicted in the image below. Its movement can also be
                                        recognized by sound.</v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text
                                            @click="printflapTestDialogOpen = false; testResults.printflap = 1">
                                            Yes
                                        </v-btn>
                                        <v-btn color="red darken-1" text
                                            @click="printflapTestDialogOpen = false; testResults.printflap = 0">
                                            No
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>


                        </v-row>
                        <v-row align="center">
                            <v-col cols="6">USB port check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" @click="usbTestDialogOpen = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon color="success" v-if="testResults.usb == 1">{{ mdiCheckCircle }}</v-icon>
                                <v-icon color="red" v-if="testResults.usb == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                            <v-dialog v-model="usbTestDialogOpen" max-width="290" @close="usbTestDialogOpen = false">
                                <v-card>
                                    <v-card-title class="text-h5">
                                        Test of USB ports
                                    </v-card-title>
                                    <v-card-text>
                                        <p>Plug the USB in each available port and wait for the detected USB number to
                                            change. Was every USB port recognized?</p>
                                        <p style="text-align:center">Currently detected devices: {{ usbNumber }}</p>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text
                                            @click="usbTestDialogOpen = false; testResults.usb = 1">
                                            Yes
                                        </v-btn>
                                        <v-btn color="red darken-1" text
                                            @click="usbTestDialogOpen = false; testResults.usb = 0">
                                            No
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>


                        </v-row>


                        <v-row align="center">
                            <v-col cols="6">Filament sensor check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" @click="filamentDialogOpen = true;">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon color="success" v-if="testResults.filamentCheck == 1">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon color="red" v-if="testResults.filamentCheck == 0">{{ mdiCross }}</v-icon>
                            </v-col>

                            <trilab-diagnostics-filament-sensor-dialog :showp="filamentDialogOpen"
                                @close="filamentDialogOpen = false"
                                @catchResult="catchResult"></trilab-diagnostics-filament-sensor-dialog>


                        </v-row>





                        <!--- ENDSTOPS CHECK  ---->
                        <v-row align="center">
                            <v-col cols="6">Endstops Check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" @click="endstopACheckDialogOpen = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon v-if="testResults.endstopsOpenState == 1" color="success">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon v-if="testResults.endstopsOpenState == 0">{{ mdiCross }}</v-icon>
                            </v-col>

                            <trilab-diagnostics-endstops-test-dialog :showp="endstopACheckDialogOpen"
                                @close="endstopACheckDialogOpen = false"
                                @catchResult="catchResult"></trilab-diagnostics-endstops-test-dialog>
                        </v-row>
                        <!--- END ENSTOP A CHECK  ---->

                        <!--- ANALOG PROBE DEBUG  ---->
                        <v-row align="center">
                            <v-col cols="6">Bed probes check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" @click="BedProbesCheckingDialog = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon v-if="testResults.bedProbes == 1" color="success">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon v-if="testResults.bedProbes == 0">{{ mdiCross }}</v-icon>
                            </v-col>

                            <trilab-diagnostics-probes-dialog :showp="BedProbesCheckingDialog"
                                @close="BedProbesCheckingDialog = false"
                                @catchResult="catchResult"></trilab-diagnostics-probes-dialog>
                        </v-row>
                        <!--- END ANALOG PROBE DEBUG  ---->

                        <!--- EXTRUDER TEMPERATURE RISE CHECK  ---->
                        <v-row align="center">
                            <v-col cols="6">Extruder temp rise check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2"
                                    @click="temperatureRiseDialogExtruder = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon v-if="testResults.extruderCheck == 1" color="success">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon v-if="testResults.extruderCheck == 0">{{ mdiCross }}</v-icon>
                            </v-col>

                            <trilab-diagnostics-temperature-rise-check :showp="temperatureRiseDialogExtruder"
                                @close="temperatureRiseDialogExtruder = false" heaterType="Extruder"
                                @catchResult="catchResult"></trilab-diagnostics-temperature-rise-check>
                        </v-row>
                        <!--- END EXTRUDER TEMPERATURE RISE CHECK  ---->

                        <!--- BED TEMPERATURE RISE CHECK  ---->
                        <v-row align="center">
                            <v-col cols="6">Bed temp rise check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2"
                                    @click="temperatureRiseDialogBed = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon v-if="testResults.bedCheck == 1" color="success">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon v-if="testResults.bedCheck == 0">{{ mdiCross }}</v-icon>
                            </v-col>

                            <trilab-diagnostics-temperature-rise-check heaterType="Bed"
                                :showp="temperatureRiseDialogBed" @close="temperatureRiseDialogBed = false"
                                @catchResult="catchResult"></trilab-diagnostics-temperature-rise-check>
                        </v-row>
                        <!--- END BED TEMPERATURE RISE CHECK  ---->
                        <!--- EXTRUDER TEMPERATURE RISE CHECK  ---->
                        <v-row align="center">
                            <v-col cols="6">Chamber temp rise check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2"
                                    @click="temperatureRiseDialogChamber = true">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon v-if="testResults.panelCheck == 1" color="success">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon v-if="testResults.panelCheck == 0">{{ mdiCross }}</v-icon>
                            </v-col>

                            <trilab-diagnostics-temperature-rise-check :showp="temperatureRiseDialogChamber"
                                @close="temperatureRiseDialogChamber = false" heaterType="Panels"
                                @catchResult="catchResult"></trilab-diagnostics-temperature-rise-check>
                        </v-row>
                        <!--- END EXTRUDER TEMPERATURE RISE CHECK  ---->


                        <!--- EMERGENCY STOP RESET CHECK ---->





                        <!--- END EMERGENCY STOP RESET CHECK --->
                        <v-row align="center">
                            <v-col cols="6">Emergency stop reset check</v-col>
                            <v-col cols="1">
                                <v-btn color="primary" class="mr-2" @click="setEmergencyStopCheckStart()">Test</v-btn>
                            </v-col>
                            <v-col cols="5">
                                <v-icon color="success" v-if="testResults.emergencyStopCheck == 1">{{ mdiCheckCircle
                                    }}</v-icon>
                                <v-icon color="red" v-if="testResults.emergencyStopCheck == 0">{{ mdiCross }}</v-icon>
                            </v-col>
                        </v-row>




                        <!---<miscellaneous-panel></miscellaneous-panel>--->
                        <miscellaneous-panel v-if="false"></miscellaneous-panel>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator';
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TrilabDiagnosticsProbesDialog from '@/components/dialogs/TrilabDiagnosticsProbesDialog.vue';
import TrilabDiagnosticsEndstopsTestDialog from '@/components/dialogs/TrilabDiagnosticsEndstopsTestDialog.vue'
import TrilabDiagnosticsFilamentSensorDialog from '@/components/dialogs/TrilabDiagnosticsFilamentSensorDialog.vue'
import TrilabDiagnosticsTemperatureRiseCheckDialog from '@/components/dialogs/TrilabDiagnosticsTemperatureRiseCheck.vue';
import { mdiCog, mdiPackageVariantClosed, mdiAlphaBBox, mdiCheckCircle, mdiCloseOctagon } from '@mdi/js'
@Component({
    components: {
        TrilabDiagnosticsEndstopsTestDialog,
        TrilabDiagnosticsProbesDialog,
        TrilabDiagnosticsFilamentSensorDialog,
        TrilabDiagnosticsTemperatureRiseCheckDialog,


        //TrilabDeltaCalibrationWizard,

    },
})
export default class PageTrilabDiagnostics extends Mixins(BaseMixin) {




    mdiCheckCircle = mdiCheckCircle;
    mdiCross = mdiCloseOctagon;

    public printflapTestDialogOpen = false;
    public chamberflapTestDialogOpen = false;


    public endStopsData = "";
    public endstopACheckDialogOpen = false;
    public endstopBCheckDialogOpen = false;
    public endstopCCheckDialogOpen = false;


    public filamentDialogOpen = false;

    /// loadings
    public fanTestLoading = false;


    /// end loadings

    public BedProbesCheckingDialog = false;
    public usbTestDialogOpen = false;

    public temperatureRiseDialogExtruder = false;
    public temperatureRiseDialogBed = false;
    public temperatureRiseDialogChamber = false;

    public endstopsOpenCheckDialog = false;

    public testOrder = ["heatbreakfan", "chamberflap", "printflap", "usb", 'filamentCheck', "endstopsOpenState", "bedProbes", "extruderCheck", "bedCheck", "panelCheck", 'emergencyStopCheck']

    public testResults: any = {
        "heatbreakfan": -1,
        "chamberflap": -1,
        "printflap": -1,
        "usb": -1,
        'filamentCheck': -1,
        "bedProbes": -1,
        "endstopsOpenState": -1,
        "extruderCheck": -1,
        "bedCheck": -1,
        "panelCheck": -1,
        'emergencyStopCheck': -1,
    }

    /// okAllTest///

    @Watch('getTestResults', { deep: true, immediate: true })
    onTestResultsChange(newValue: any, oldValue: any) {
        console.log("testResults changed");
        console.log("new Value: ");
        console.log(newValue);
        console.log("old Value: ");
        console.log(oldValue);
        console.log(this.getTestResults);
        if (this.testAllInProgress) {
            console.log("testAllInProgress is true");
            /// if it is running, then check last step that has 1 and if 
            console.log("currentStep is " + this.currentStep + " and it is " + this.testResults[this.currentStep]);
            if (this.testResults[this.currentStep] == 1) {
                /// test was done sucessfully, set next step to DB and handle it here
                let nextStep = this.testOrder[this.testOrder.indexOf(this.currentStep) + 1];
                console.log("test was done sucessfully, setting next step to: " + nextStep);
                this.setCurrentStep(nextStep);

                var currentIndexInOrder = this.testOrder.indexOf(this.currentStep);
                if (currentIndexInOrder == this.testOrder.length - 1) {
                    /// we are at the end of the test
                    this.testAllInProgress = false;
                    this.testResults.allCheck = 1;
                    return;
                }
                this.resumeTestAll();






            } else {
                /// test was unsuccesfull, we have to stop the testing for now
                this.testAllInProgress = false;
            }
        }
    }

    public currentStep: any = null;
    public testAllInProgress = false;

    get getTestResults() {
        return Object.assign({}, this.testResults)
    }

    created() {
        this.init();
    }
    async init() {
        this.currentStep = await this.getCurrentStep();
        /// check if current step exists in the testOrder array, if not set it to first
        if (this.currentStep != null && this.testOrder.includes(this.currentStep)) {
            console.log("current step is " + this.currentStep);
        } else {
            this.currentStep = this.testOrder[0];
        }

        /// get testResults from db
        let testResults = await fetch(this.dbUrl("testResults"));
        if (testResults.status != 200) {
            console.log("testResults not found");
        } else {
            let testResultsJson = await testResults.json();
            this.testResults = JSON.parse(testResultsJson.result.value);
        }


        /// try to get emergency stop check start time
        let emergencyStopCheckStart = await fetch(this.dbUrl("emergencyStopCheckStart"));
        if (emergencyStopCheckStart.status != 200) {
            console.log("emergencyStopCheckStart not found");
        } else {
            let emergencyStopCheckStartJson = await emergencyStopCheckStart.json();
            let emergencyStopCheckStartValue = emergencyStopCheckStartJson.result.value;
            if (emergencyStopCheckStartValue != null) {
                let currentTime = new Date().getTime();
                let difference = currentTime - emergencyStopCheckStartValue;
                if (difference < 30000) { /// 30 sekund max
                    this.testResults.emergencyStopCheck = 1;
                    /// delete the value from db
                    fetch(this.dbUrl("emergencyStopCheckStart", ""), { method: 'DELETE' });
                } else {
                    this.testResults.emergencyStopCheck = 0;
                }
            }
        }

    }
    get runOrResumeText() {
        if (this.testAllInProgress || (this.currentStep != 'heatbreakfan' && this.currentStep != null)) {
            console.log(this.currentStep);
            return "Resume";
        } else {
            return "Run";
        }
    }

    testAll() {
        /// post to db, run from first
        /// change the value of all tests to -1
        for (const key in this.testResults) {
            this.testResults[key] = -1;
        }
        this.testAllInProgress = true;
        fetch(this.dbUrl("step", "heatbreakfan"), { method: 'POST' }); /// save it from the start now with the next step
        this.resumeTestAll();
    }

    resumeTestAll() {
        this.testAllInProgress = true;
        if (this.currentStep == null || this.currentStep == "") {
            this.currentStep = 'heatbreakfan';
        }
        if (this.currentStep == 'heatbreakfan') {
            this.testFan(1);
        } else
            if (this.currentStep == 'chamberflap') {
                this.chamberflapTestDialogOpen = true;
                this.testChamberFlapIntake(1);
            } else
                if (this.currentStep == 'printflap') {
                    this.printflapTestDialogOpen = true;
                    this.testPrintFlap(1);
                } else
                    if (this.currentStep == 'usb') {
                        this.usbTestDialogOpen = true;
                    } else
                        if (this.currentStep == 'bedProbes') {
                            this.BedProbesCheckingDialog = true;
                        } else
                            if (this.currentStep == 'endstopsOpenState') {
                                this.endstopACheckDialogOpen = true;
                            } else
                                if (this.currentStep == 'extruderCheck') {
                                    this.temperatureRiseDialogExtruder = true;
                                } else
                                    if (this.currentStep == 'bedCheck') {
                                        this.temperatureRiseDialogBed = true;
                                    } else
                                        if (this.currentStep == 'panelCheck') {
                                            this.temperatureRiseDialogChamber = true;
                                        } else if (this.currentStep == 'filamentCheck') {
                                            this.filamentDialogOpen = true;
                                        }



    }

    get allSucessfull() {
        /// all values except allCheck are 1
        for (const key in this.testResults) {
            if (this.testResults[key] != 1) {
                return false;
            }
        }
        return true;

    }


    ///!okAllTest///


    openEndStopsOpenDialog() {

    }

    dbUrl(key: string = "", value: string = "") {
        var toReturn = this.$store.getters['socket/getUrl'] + '/server/database/item?namespace=trilabdiagnostics';
        if (key != "") {
            toReturn = toReturn + "&key=" + key;
        }
        if (value != "") {
            toReturn = toReturn + "&value=" + value;
        }

        return toReturn;
    }

    public summaryTestLastStep = null;

    async getCurrentStep() {
        let step = await fetch(this.dbUrl("step"));
        if (step.status != 200) {
            return null;
        } else {
            let stepjson = await step.json();
            console.log("toto je step: ");
            console.log(step);
            return stepjson.result.value;
        }

    }

    async setEmergencyStopCheckStart() {
        /// we must add current time to the database
        await fetch(this.dbUrl("emergencyStopCheckStart", new Date().getTime().toString()), { method: 'POST' });
        /// after the time is set, we have to do the emergency stop
        this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' });
    }


    async setCurrentStep(step: string) {
        this.currentStep = step;
        //// save current testResults to db
        fetch(this.dbUrl("testResults", JSON.stringify(this.testResults)), { method: 'POST' });
        return await fetch(this.dbUrl("step", step), { method: 'POST' });
    }



    sendGcode(gcode: string) {
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
    sendGcodeHidden(gcode: string) {
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }

    catchResult(key: string, value: number) {
        if (value == 0) {
            this.testAllInProgress = false;
        }
        this.testResults[key] = value;
    }

    testChamberFlapIntake(status: number) {
        //console.log("testChamberFlapIntake");
        const power = this.chamberIntakeFlapPresent[0]?.power ?? 0;
        //console.log("testChamberFlapIntake");
        //console.log(this.chamberIntakeFlapPresent[0]);
        let speed = 1;
        if (power > 0.5) { speed = 0; }
        if (power <= 0.5) { speed = 1; }
        console.log("setting speed to " + speed);

        const gcode = `SET_FAN_SPEED FAN=intake_flap SPEED=${speed}`
        this.sendGcode(gcode)
    }
    testPrintFlap(status: number) {
        /// status depends on target power attribute
        const power = this.printFlapPresent[0]?.power ?? 0;
        //console.log("testPrintFlap");
        //console.log(this.printFlapPresent[0]);
        let speed = 1;

        /// set the speed to farthest value from the current power value. For example if current power is 20, set 1, if current power is 60, set 0
        if (power >= 0.5) { speed = 0; } else { speed = 1; }


        //console.log("setting speed to " + speed);
        if (status == 0) { speed = 0; }
        const gcode = `SET_FAN_SPEED FAN=print_flap SPEED=${speed}`
        this.sendGcode(gcode)
    }
    testFan(status: number) {
        /// here we have to heat the hotend to 50 degrees
        /// SET_HEATER_TEMPERATURE HEATER=extruder TARGET=
        /// status depends on target power attribute
        //console.log("testFan");
        let speed = 0.5;
        let temp = 30;
        if (status == 0) { speed = 0; temp = 0; }

        const gcodeheater = `SET_HEATER_TEMPERATURE HEATER=extruder TARGET=${temp}`
        this.sendGcode(gcodeheater)
        const gcode = `HEATER_FAN_SET_SPEED FAN=heatbreak_fan SPEED=${speed}`
        this.sendGcode(gcode)

        if (status == 1) {
            this.fanTestLoading = true;
        } else {
            this.fanTestLoading = false;
        }

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
        let duplicityCheck: Array<string> = [];




        let usbNumber = 0;
        for (let i = 0; i < filetree.length; i++) {

            const element = filetree[i];
            if (element.filename != "gcodes") {
                continue;
            }
            if (element.filename.startsWith("usb") && element.isDirectory && element.modified == 0) {
                //usbNumber++;
                console.log("USB FOUND UNDER FIRST ITERATION:")
                console.log(element);
            }
            if (element.childrens) {
                for (let j = 0; j < element.childrens.length; j++) {
                    const element2 = element.childrens[j];
                    if (element2.filename.startsWith("usb") && element2.isDirectory && element2.modified == 0) {
                        if (duplicityCheck.includes(element.filename + element2.filename)) {
                            continue;
                        }
                        usbNumber++;
                        duplicityCheck.push(element.filename + element2.filename);
                        console.log("USB FOUND UNDER SECOND ITERATION UNDER DIRECTORY: " + element.filename + " & object:")
                        console.log(element2);
                    }
                    /*if (element2.childrens) {
                        for (let k = 0; k < element2.childrens.length; k++) {
                            const element3 = element2.childrens[k];
                            if (element3.filename.startsWith("usb") && element3.isDirectory && element3.modified == 0) {
                                usbNumber++;
                                console.log("USB FOUND UNDER THIRD ITERATION:")
                                console.log(element3);
                            }
                        }
                    }*/
                }
            }
        }
        return usbNumber;
    }


}
</script>
