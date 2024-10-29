<style scoped lang="scss">
.noTopBorderRow {
    td {
        border-top: none !important;
    }
}

/* for 2nd column in the diagTable min-width: 20px; */
.diagTable {
    table-layout: auto;

    td {
        .v-btn {
            width: 100%;
        }
    }

    th:nth-child(2) {
        min-width: 150px;
        width: 150px;
    }


    .trCommon:hover+tr {
        background: #616161;
    }

    .trCommonUp:nth-child(-1):hover {
        background: #616161;
    }
}

.v-card__title {
    word-break: break-word;
}

.yaigif {
    max-height: 100vh;
    max-width: 100%;
    animation: rotationSizing 5s infinite linear;
    pointer-events: none;
    cursor: progress;
    user-select: none;
}

@keyframes rotationSizing {
    0% {
        transform: rotate(0deg) scale(1);
    }

    10% {
        transform: rotate(15deg) scale(0.75);
    }

    50% {
        transform: rotate(-180deg) scale(0.5);
    }

    100% {
        transform: rotate(-360deg) scale(1);
    }
}
</style>
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
                            <p v-if="canRunTests == false && !testAllInProgress" class="warning--text">Test or print is
                                in progress. Printer is not in idle state - can't run tests</p>
                            <v-btn color="primary" class="mr-2" :loading="testAllInProgress"
                                :disabled="canRunTests == false" @click="testAll()">
                                Run all tests
                            </v-btn>

                            <v-btn color="primary" class="mr-2"
                                :disabled="canRunTests == false || currentStep == null || currentStep == testOrder[0]"
                                @click="resumeTestAll()">
                                Resume from last
                            </v-btn>
                        </div>

                        <v-simple-table class="diagTable">
                            <thead>
                                <tr>
                                    <th>Test Name</th>
                                    <th class="width:20px;">Action</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Endstops Check -->
                                <tr>
                                    <td>Endstops Check</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="endstopACheckDialogOpen = true">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.endstopsOpenState == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.endstopsOpenState == 0" color="red">{{ mdiCross
                                            }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Heatbreak Fan Test -->
                                <tr v-if="heatbreakfanPresent">
                                    <td>Fan - speed control</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :loading="fanTestLoading"
                                            :disabled="fanTestLoading || canRunTests == false" @click="testFan(1)">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.heatbreakfan == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.heatbreakfan == 0" color="red">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Print Flap Test -->
                                <tr v-if="printFlapPresent">
                                    <td>Print flap - motion control</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="printflapTestDialogOpen = true">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.printflap == 1" color="success">{{ mdiCheckCircle
                                            }}</v-icon>
                                        <v-icon v-if="testResults.printflap == 0" color="red">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Chamber Intake Flap Test -->
                                <tr v-if="chamberIntakeFlapPresent">
                                    <td>Chamber Intake flap - motion control</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="chamberflapTestDialogOpen = true">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.chamberflap == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.chamberflap == 0" color="red">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Bed Probes Check -->
                                <tr>
                                    <td>Bed probes check</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="BedProbesCheckingDialog = true">Test</v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.bedProbes == 1" color="success">{{ mdiCheckCircle
                                            }}</v-icon>
                                        <v-icon color="red" v-if="testResults.bedProbes == 0">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Extruder Temperature Rise Check -->
                                <tr>
                                    <td>Extruder temp rise check</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2"
                                            @click="temperatureRiseDialogExtruder = true"
                                            :disabled="canRunTests == false">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.extruderCheck == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.extruderCheck == 0" color="red">{{ mdiCross
                                            }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Endstops Check -->
                                <tr>
                                    <td>Extruder motor test</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="extruderMotorTestDialogOpen = true">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.extruderMotorCheck == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.extruderMotorCheck == 0" color="red">{{ mdiCross
                                            }}</v-icon>
                                    </td>
                                </tr>





                                <!-- Bed Temperature Rise Check -->
                                <tr class="trCommon">
                                    <td>Bed temp rise check</td>
                                    <td rowspan="2">
                                        <v-btn color="primary" style="height:70% !important;"
                                            :disabled="canRunTests == false"
                                            @click="temperatureRiseDialogChamber = true">
                                            Test
                                        </v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.bedCheck == 1" color="success">{{ mdiCheckCircle
                                            }}</v-icon>
                                        <v-icon v-if="testResults.bedCheck == 0" color="red">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Chamber Temperature Rise Check -->
                                <tr>
                                    <td>Chamber temp rise check</td>
                                    <!-- <td>
                                        <v-btn color="primary" class="mr-2"
                                            @click="temperatureRiseDialogChamber = true">
                                            Test
                                        </v-btn>
                                    </td> -->
                                    <td>
                                        <v-icon v-if="testResults.panelCheck == 1" color="success">{{ mdiCheckCircle
                                            }}</v-icon>
                                        <v-icon v-if="testResults.panelCheck == 0" color="red">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Filament Sensor Check -->
                                <tr>
                                    <td>Filament sensor check</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="filamentDialogOpen = true">Test</v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.filamentCheck == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.filamentCheck == 0" color="red">{{ mdiCross
                                            }}</v-icon>
                                    </td>
                                </tr>

                                <!-- Emergency Stop Reset Check -->
                                <tr>
                                    <td>Emergency stop reset check</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="emergencyStopDialogOpen = true">Test</v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.emergencyStopCheck == 1" color="success">
                                            {{ mdiCheckCircle }}
                                        </v-icon>
                                        <v-icon v-if="testResults.emergencyStopCheck == 0" color="red">{{ mdiCross
                                            }}</v-icon>
                                    </td>
                                </tr>

                                <!-- USB Port Check -->
                                <tr>
                                    <td>USB port check</td>
                                    <td>
                                        <v-btn color="primary" class="mr-2" :disabled="canRunTests == false"
                                            @click="usbNumberChangeObserved = false; usbTestDialogOpen = true">Test</v-btn>
                                    </td>
                                    <td>
                                        <v-icon v-if="testResults.usb == 1" color="success">{{ mdiCheckCircle
                                            }}</v-icon>
                                        <v-icon v-if="testResults.usb == 0" color="red">{{ mdiCross }}</v-icon>
                                    </td>
                                </tr>
                                <tr v-if="allSucessfull">
                                    <td>Print Protocol</td>
                                    <td>
                                        <v-text-field v-model="responsibleTester" hide-details label="Fill name"
                                            outlined dense></v-text-field>
                                    </td>
                                    <td>
                                        <v-btn style="vertical-align: center" :disabled="responsibleTester.trim() == ''"
                                            color="success" class="mr-2" @click="printProtocol()">
                                            Download protocol for printing
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-simple-table>

                        <!-- <miscellaneous-panel></miscellaneous-panel> -->
                        <miscellaneous-panel v-if="false"></miscellaneous-panel>
                    </div>
                </v-col>
            </v-row>
        </v-container>
        <trilab-diagnostics-endstops-test-dialog :showp="endstopACheckDialogOpen"
            @close="endstopACheckDialogOpen = false"
            @catchResult="catchResult"></trilab-diagnostics-endstops-test-dialog>

        <!-- THIS IS JUST FOR EXTRUDER -->
        <trilab-diagnostics-temperature-rise-check :showp="temperatureRiseDialogExtruder" heater-type="Extruder"
            @close="temperatureRiseDialogExtruder = false"
            @catchResult="catchResult"></trilab-diagnostics-temperature-rise-check>
        <!-- END -->

        <!-- this is for panels and bed together -->
        <trilab-diagnostics-temperature-rise-check :showp="temperatureRiseDialogChamber" heater-type="Panels"
            @close="temperatureRiseDialogChamber = false"
            @catchResult="catchResult"></trilab-diagnostics-temperature-rise-check>
        <!-- END -->

        <v-dialog v-model="emergencyStopDialogOpen" max-width="500" @close="emergencyStopDialogOpen = false">
            <v-card>
                <v-card-title class="text-h5">Emergency stop reset check</v-card-title>
                <v-card-text>
                    <p>
                        Watch the instructions in the animation below, press the "Start the test" button, then press and
                        release the physical emergency stop button. Then after firmware restart button shows on the
                        printer display, press it and wait for web interface reinitialization. Do it all as quickly as
                        possible as you have only 30 seconds to complete the restart after pressing the "Start the test"
                        button. If it takes more than 30 seconds, the test will fail.
                    </p>
                    <img class="mb-3 mt-3" src="/img/diagnostics/emergencycheck.gif"
                        style="max-width:300px; display:block; margin: 0 auto">
                    <v-btn color="red" class="mb-3 mt-3" block @click="setEmergencyStopCheckStart()"
                        :disabled="emergencyStopStarted">Start the test</v-btn>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="cancelEmergencyCheck()
                        ">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-dialog v-model="chamberflapTestDialogOpen" max-width="290" @close="chamberflapTestDialogOpen = false">
            <v-card>
                <v-card-title class="text-h5">Did the chamber flap move?</v-card-title>
                <v-card-text>
                    The flap is depicted in the image below. Its movement can also be recognized by
                    sound. If you are unsure, you can move it again by pressing the button below.
                    <v-btn :disabled="!enabledChamberCommandDialogButton" color="primary" class="mb-3 mt-3"
                        @click="testChamberFlapIntake(1)">Move chamber flap</v-btn>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="!enabledChamberYesButton" color="green darken-1" text
                        @click="chamberFlapResult(1)">
                        Yes
                    </v-btn>
                    <v-btn color="red darken-1" text @click="chamberFlapResult(0)">
                        No
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="printflapTestDialogOpen" max-width="350" @close="printflapTestDialogOpen = false">
            <v-card>
                <v-card-title class="text-h5">Did the print flap move?</v-card-title>
                <v-card-text>
                    <p>The change is depicted in the animation below. If you didn't catch the movement, you can try
                        moving it again by by pressing button below</p>
                    <img src="/img/diagnostics/printflap.gif" class="mb-3 mt-3"
                        style="max-width:300px; display:block; margin: 0 auto">
                    <v-btn :disabled="!enabledPrintflapCommandDialogButton" block color="primary" class="mt-3 mb-3"
                        @click="testPrintFlap(1)">Move print flap</v-btn>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="!enabledPrintflapYesDialogButton" color="green darken-1" text
                        @click="printFlapTestResult(1)">
                        Yes
                    </v-btn>
                    <v-btn color="red darken-1" text @click="printFlapTestResult(0)">
                        No
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- BED PROBES DIALOG -->
        <trilab-diagnostics-probes-dialog :showp="BedProbesCheckingDialog" @close="BedProbesCheckingDialog = false"
            @catchResult="catchResult"></trilab-diagnostics-probes-dialog>
        <!-- END -->


        <!-- FILAMENT SENSOR DIALOG -->
        <trilab-diagnostics-filament-sensor-dialog :showp="filamentDialogOpen" @close="filamentDialogOpen = false"
            @catchResult="catchResult"></trilab-diagnostics-filament-sensor-dialog>
        <!-- END -->

        <!-- EXTRUDER MOTOR TEST DIALOG -->
        <trilab-diagnostics-motor-extruder-test-dialog :showp="extruderMotorTestDialogOpen"
            @close="extruderMotorTestDialogOpen = false"
            @catchResult="catchResult"></trilab-diagnostics-motor-extruder-test-dialog>

        <!-- USB TEST DIALOG -->
        <v-dialog v-model="usbTestDialogOpen" max-width="350">
            <v-card>
                <v-card-title class="text-h5">Test of USB ports</v-card-title>
                <v-card-text>
                    <p>
                        Plug the USB in each available port and wait for the detected USB number to
                        change. Was every USB port recognized?
                    </p>
                    <p style="text-align: center">Currently detected devices: {{ usbNumber }}</p>
                    <img src="/img/diagnostics/usbTest.png" class="mb-3 mt-3"
                        style="margin: 0 auto; max-width:300px; display:block;">
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="usbTestResult(1)">Yes</v-btn>
                    <v-btn color="red darken-1" text @click="usbTestResult(0)">No</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showYAI" max-width="100%" width="100%; height:100%" persistent>
            <img src="/img/diagnostics/yai.gif" style="max-width:100%; display:block; margin: 0 auto; max-height:100vh"
                class="yaigif">
        </v-dialog>


    </v-container>
</template>

<script lang="ts">
import { Watch } from 'vue-property-decorator'
import axios from 'axios'
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import TrilabDiagnosticsProbesDialog from '@/components/dialogs/TrilabDiagnosticsProbesDialog.vue'
import jsPDF from 'jspdf'

import TrilabDiagnosticsEndstopsTestDialog from '@/components/dialogs/TrilabDiagnosticsEndstopsTestDialog.vue'
import TrilabDiagnosticsFilamentSensorDialog from '@/components/dialogs/TrilabDiagnosticsFilamentSensorDialog.vue'
import TrilabDiagnosticsTemperatureRiseCheckDialog from '@/components/dialogs/TrilabDiagnosticsTemperatureRiseCheck.vue'
import TrilabDiagnosticsMotorExtruderTestDialog from '@/components/dialogs/TrilabDiagnosticsMotorExtruderTestDialog.vue'
import { mdiCog, mdiPackageVariantClosed, mdiAlphaBBox, mdiCheckCircle, mdiCloseOctagon } from '@mdi/js'
import TrilabMixin from '@/components/mixins/trilab'
@Component({
    components: {
        TrilabDiagnosticsEndstopsTestDialog,
        TrilabDiagnosticsProbesDialog,
        TrilabDiagnosticsFilamentSensorDialog,
        TrilabDiagnosticsTemperatureRiseCheckDialog,
        TrilabDiagnosticsMotorExtruderTestDialog,


        //TrilabDeltaCalibrationWizard,
    },
})
export default class PageTrilabDiagnostics extends Mixins(BaseMixin, TrilabMixin) {
    mdiCheckCircle = mdiCheckCircle
    mdiCross = mdiCloseOctagon

    public responsibleTester: string = ''

    public printflapTestDialogOpen = false
    public chamberflapTestDialogOpen = false
    public extruderMotorTestDialogOpen = false

    public endStopsData = ''
    public endstopACheckDialogOpen = false
    public endstopBCheckDialogOpen = false
    public endstopCCheckDialogOpen = false

    public filamentDialogOpen = false
    public emergencyStopDialogOpen = false
    /// loadings
    public fanTestLoading = false

    /// end loadings

    public BedProbesCheckingDialog = false
    public usbTestDialogOpen = false

    public temperatureRiseDialogExtruder = false
    public temperatureRiseDialogBed = false
    public temperatureRiseDialogChamber = false

    public endstopsOpenCheckDialog = false


    public trickChamberDialog = true; /// zaznam jestli je aktivni trik (tedy se command na pohnuti po kliku na tlacitko neprovedl)
    public enabledChamberYesButton = false;
    public enabledChamberCommandDialogButton = true;

    public trickPrintflapDialog = true;/// zaznam jestli je aktivni trik (tedy se command na pohnuti po kliku na tlacitko neprovedl)
    public enabledPrintflapYesDialogButton = false;
    public enabledPrintflapCommandDialogButton = true;

    public showYAI = false;


    public testOrder = [
        'endstopsOpenState',
        'heatbreakfan',
        'printflap',
        'chamberflap',
        'bedProbes',
        'extruderCheck',
        'extruderMotorCheck',
        //'bedCheck',
        'panelCheck',
        'filamentCheck',
        'emergencyStopCheck',
        'usb',
    ]

    public testResults: any = {
        heatbreakfan: -1,
        chamberflap: -1,
        printflap: -1,
        usb: -1,
        filamentCheck: -1,
        bedProbes: -1,
        endstopsOpenState: -1,
        extruderCheck: -1,
        extruderMotorCheck: -1,
        bedCheck: -1,
        panelCheck: -1,
        emergencyStopCheck: -1,
    }

    /// okAllTest///

    @Watch('getTestResults', { deep: true, immediate: true })
    async onTestResultsChange(newValue: any, oldValue: any) {
        console.log('testResults changed')
        console.log('new Value: ')
        console.log(newValue)
        console.log('old Value: ')
        console.log(oldValue)
        if (oldValue == undefined) {
            return false
        }
        var changedRecord = ''
        for (const key in newValue) {
            if (newValue[key] != oldValue[key]) {
                changedRecord = key
                break
            }
        }
        if (changedRecord == '') {
            return false
        }

        console.log('changedRecord: ' + changedRecord)

        console.log(this.getTestResults)
        if (this.testAllInProgress == true) {
            console.log('testAllInProgress is true')
            /// if it is running, then check last step that has 1 and if
            console.log('currentStep is ' + this.currentStep + ' and it is ' + this.testResults[changedRecord])

            if (this.testResults[changedRecord] == 1) {
                /// test was done sucessfully, set next step to DB and handle it here
                /// set db test start to current time and log also current name
                /// post to DB key currentStep and json array with startTime and endTime
                /// get current datetime and convert it to CET time string
                /// entry should exist in the db history because it had to be started before
                var stepHistory: any = false;
                if (changedRecord == 'bedCheck') {
                    stepHistory = await this.getHistory('panelCheck')
                } else {
                    stepHistory = await this.getHistory(changedRecord)
                }
                console.log('stepHistory: ')
                console.log(stepHistory)
                if (stepHistory == false) {
                    /// write history
                    this.writeHistory(changedRecord, this.getCurrTimeCETString(), this.getCurrTimeCETString(), 1)
                } else {
                    ///check if it is object
                    if (typeof stepHistory == 'object') {
                        this.writeHistory(changedRecord, stepHistory.startTime ?? "", this.getCurrTimeCETString(), 1)
                    }
                }

                let currentStepExistsInTestOrder = this.testOrder.indexOf(changedRecord)
                if (currentStepExistsInTestOrder == -1) {
                    console.log('current step does not exist in the testOrder array')
                    return
                }

                let nextStep = this.testOrder[this.testOrder.indexOf(changedRecord) + 1]
                console.log('test was done sucessfully, setting next step to: ' + nextStep)
                if (nextStep != null && nextStep != undefined) {
                    this.setCurrentStep(nextStep)
                }

                var currentIndexInOrder = this.testOrder.indexOf(this.currentStep)

                /// check if the current step is 0 or -1
                if (this.testResults[this.currentStep] == 0 || this.testResults[this.currentStep] == -1) {
                    this.resumeTestAll()
                    //console.log('RESUMING NEXT TEST')
                } else {
                    //console.log('not resuming the test. TESTRESULTS:')
                    //console.log(this.testResults)
                }

                if (currentIndexInOrder == this.testOrder.length - 1) {
                    /// we are at the end of the test
                    //console.log('setting testAllInProgress to false')
                    fetch(this.dbUrl('testAllEnd', this.getCurrTimeCETString()), {
                        method: 'POST',
                    }) /// successful end of the test
                    return
                }
            } else {
                /// test was unsuccesfull, we have to stop the testing for now
                this.testAllInProgress = false
                console.log('setting testAllInProgress to false because test was unsuccesfull')
            }
        } else {
            console.log('testAllInProgress is false')
        }
    }

    public currentStep: any = null
    public testAllInProgress = false

    showYAIgif() {
        clearTimeout((window as any).yaiTimeout)
        this.showYAI = true
        /// dont allow reload
        window.onbeforeunload = function () {
            return 'Are you sure you want to leave?';
        };
        /// set cookie yai to 1
        window.document.cookie = 'yai=1; expires=Sun, 18 Dec 2039 12:00:00 UTC; path=/';
        (window as any).yaiTimeout = window.setTimeout(() => {
            this.showYAI = false
            window.onbeforeunload = null
            window.document.cookie = 'yai=0; expires=Thu, 18 Dec 1980 12:00:00 UTC; path=/';
        }, 60000);
    }

    chamberFlapResult(result: number) {
        //// check if trick is active, and if yes and he clicked that it moved, then show YAI gif
        if (this.trickChamberDialog) {
            if (result == 1) {
                this.showYAIgif()
                //this.enabledChamberCommandDialogButton = true
                this.enabledChamberYesButton = false
                this.$toast.warning("You have been tricked! Nothing was sent to the printer so it couldn't move. Look at the test result and don't be LAZY you WORTHLESS PEASANT", { duration: 15000 })
            } else {
                /// umoznime udelat dalsi pokus, uzivatel neni I
                this.$toast.info("OK, you weren't fooled. You can try again.")
                //this.enabledChamberCommandDialogButton = true
                this.enabledChamberYesButton = false
                this.trickChamberDialog = Math.random() < 0.5
            }
        } else {
            this.chamberflapTestDialogOpen = false
            this.testResults.chamberflap = result
            //this.enabledChamberCommandDialogButton = true
        }
    }

    usbTestResult(result: number) {
        if (this.usbNumberChangeObserved == false && result == 1) {
            this.$toast.warning("You have been tricked! USB number NOT changed so it CAN'T  be marked as yes. Look at the test result and don't be LAZY you WORTHLESS PEASANT", { duration: 15000 })
            this.showYAIgif();
            return
        }
        this.usbTestDialogOpen = false
        this.testResults.usb = result
    }


    printFlapTestResult(result: number) {
        if (this.trickPrintflapDialog) {
            if (result == 1) {
                this.showYAIgif()
                this.enabledPrintflapYesDialogButton = false
                this.$toast.warning("You have been tricked! Nothing was sent to the printer so it couldn't move. Look at the test result and don't be LAZY you WORTHLESS PEASANT", { duration: 15000 })
            } else {
                /// umoznime udelat dalsi pokus, uzivatel neni I 
                this.$toast.info('OK, you can try again.')
                this.enabledPrintflapYesDialogButton = false
                this.trickPrintflapDialog = Math.random() < 0.5
            }
        } else {
            this.printflapTestDialogOpen = false
            this.testResults.printflap = result
        }
    }

    get canRunTests() {
        return !this.testAllInProgress && this.TrilabPrinterIdle

    }

    get getTestResults() {
        return Object.assign({}, this.testResults)
    }

    @Watch('testAllInProgress')
    onTestAllInProgressChange(newValue: any, oldValue: any) {
        console.log('testAllInProgress changed to: ' + newValue)
    }

    created() {
        this.init()
        /// check if yai cookie is set to 1 and if yes show the gif
        if (document.cookie.indexOf('yai=1') > -1) {
            this.showYAIgif()
        }
    }

    async init() {
        this.currentStep = await this.getCurrentStep()
        /// check if current step exists in the testOrder array, if not set it to first
        if (this.currentStep != null && this.testOrder.includes(this.currentStep)) {
            console.log('current step is ' + this.currentStep)
        } else {
            this.currentStep = this.testOrder[0]
        }

        var history: any = await this.getAllHistory()
        /// check passed statuses
        for (const key in this.testResults) {
            if (history[key] != null && history[key] != undefined) {
                if (history[key].passed == 1) {
                    this.testResults[key] = 1
                } else if (history[key].passed == 0) {
                    this.testResults[key] = 0
                }
            }
        }

        /// try to get emergency stop check start time
        let emergencyStopCheckStart = await fetch(this.dbUrl('emergencyStopCheckStart'))
        if (emergencyStopCheckStart.status != 200) {
            console.log('emergencyStopCheckStart not found')
        } else {
            /// delete the value from db
            fetch(this.dbUrl('emergencyStopCheckStart', ''), { method: 'DELETE' })

            let emergencyStopCheckStartJson = await emergencyStopCheckStart.json()
            let emergencyStopCheckStartValue = emergencyStopCheckStartJson.result.value
            if (emergencyStopCheckStartValue != null) {
                let currentTime = new Date().getTime()
                let difference = currentTime - emergencyStopCheckStartValue
                if (difference < 30000) {
                    /// 30 sekund max
                    console.log('na zacatku testResults:')
                    console.log(this.testResults)
                    var response = await this.getHistory('emergencyStopCheck')
                    if (response == false) {
                        this.writeHistory(
                            'emergencyStopCheck',
                            this.getCurrTimeCETString(),
                            this.getCurrTimeCETString(),
                            1
                        )
                    } else {
                        this.writeHistory('emergencyStopCheck', response.startTime, this.getCurrTimeCETString(), 1)
                    }
                    /// check if it was testAll
                    var resp = await fetch(this.dbUrl('resumeTestAll'))
                    this.$toast.success('Emergency stop check was successful and was restarted in time.')
                    if (resp.status == 200) {
                        /// existuje
                        await fetch(this.dbUrl('resumeTestAll'), { method: 'DELETE' }) /// delete the remembered state
                        var nextStep = this.testOrder[this.testOrder.indexOf(this.currentStep) + 1]
                        this.testAllInProgress = true
                        this.testResults.emergencyStopCheck = 1
                        console.log('changing testResults emergencyStop to 1')
                    } else {
                        console.log('changing testResults emergencyStop to 1, but resumeTestAll was false')
                        this.testResults.emergencyStopCheck = 1
                    }
                } else {
                    this.$toast.error('Emergency stop check took too long. Test was not successful. Try again.')
                    this.testResults.emergencyStopCheck = 0
                }
            }
        }
    }
    get runOrResumeText() {
        if (this.testAllInProgress || (this.currentStep != this.testOrder[0] && this.currentStep != null)) {
            console.log(this.currentStep)
            return 'Resume'
        } else {
            return 'Run'
        }
    }

    getCurrTimeCETString() {
        return new Date().toLocaleString('cs-CZ', { timeZone: 'CET' }) + ' CET'
    }

    async testAll() {
        /// post to db, run from first
        /// change the value of all tests to -1
        for (const key in this.testResults) {
            this.testResults[key] = -1
        }
        this.currentStep = this.testOrder[0]
        this.testAllInProgress = true
        await fetch(this.dbUrl('step', this.testOrder[0]), { method: 'POST' }) /// save it from the start now with the next step
        /// save to db testAllStart date
        const successfulRemove = await this.removeAllTestResultsFromDB()

        if (!successfulRemove) {
            this.$toast.error(
                'Error while removing previous test results from database. Settings testAllInProgress to false.'
            )
            this.testAllInProgress = false
            return false
        }
        await this.writeHistory(this.testOrder[0], this.getCurrTimeCETString(), false, -1)
        await fetch(this.dbUrl('testAllStart', this.getCurrTimeCETString()), {
            method: 'POST',
        })
        /// remove testAllEnd
        await fetch(this.dbUrl('testAllEnd'), { method: 'DELETE' })
        this.resumeTestAll()
    }

    @Watch('chamberflapTestDialogOpen')
    onChamberflapTestDialogOpenChanged(newValue: any, oldValue: any) {
        if (newValue == true) {
            this.trickChamberDialog = Math.random() < 0.5
            this.enabledChamberYesButton = false
            //this.enabledChamberCommandDialogButton = true
        }
    }
    @Watch('printflapTestDialogOpen')
    onPrintflapTestDialogOpenChanged(newValue: any, oldValue: any) {
        if (newValue == true) {
            this.trickPrintflapDialog = Math.random() < 0.5
            console.log('trickPrintflapDialog is ' + this.trickPrintflapDialog)
            this.enabledPrintflapYesDialogButton = false
            this.enabledPrintflapCommandDialogButton = true
        }
    }


    async resumeTestAll() {
        this.testAllInProgress = true
        console.log('ResumeTestAll, testAllInProgress is true')
        if (this.currentStep == null || this.currentStep == '') {
            this.currentStep = this.testOrder[0]
        }

        /// write history about test start
        this.writeHistory(this.currentStep, this.getCurrTimeCETString(), false, -1)

        if (this.currentStep == 'heatbreakfan') {
            this.testFan(1)
        } else if (this.currentStep == 'chamberflap') {
            this.chamberflapTestDialogOpen = true
            this.testChamberFlapIntake(1)
        } else if (this.currentStep == 'printflap') {
            this.printflapTestDialogOpen = true
            this.testPrintFlap(1)
        } else if (this.currentStep == 'usb') {
            this.usbTestDialogOpen = true
        } else if (this.currentStep == 'bedProbes') {
            this.BedProbesCheckingDialog = true
        } else if (this.currentStep == 'endstopsOpenState') {
            this.endstopACheckDialogOpen = true
        } else if (this.currentStep == 'extruderCheck') {
            this.temperatureRiseDialogExtruder = true
        } /*else if (this.currentStep == 'bedCheck') {
            this.temperatureRiseDialogBed = true
        } */
        else if (this.currentStep == 'extruderMotorCheck') {
            this.extruderMotorTestDialogOpen = true
        }
        else if (this.currentStep == 'panelCheck') {
            this.temperatureRiseDialogChamber = true
        } else if (this.currentStep == 'filamentCheck') {
            this.filamentDialogOpen = true
        } else if (this.currentStep == 'emergencyStopCheck') {
            await fetch(this.dbUrl('resumeTestAll', '1'), { method: 'POST' })
            this.emergencyStopDialogOpen = true
        }
    }

    get allSucessfull() {
        for (const key in this.testResults) {
            if (this.testResults[key] != 1) {
                return false
            }
        }
        return true
    }

    async removeAllTestResultsFromDB() {
        /// first list the namespace "trilab_diagnostics_history"
        var successFull = false
        await fetch(this.dbUrl('', '', 'trilab_diagnostics_history'), { method: 'GET' }).then((response) => {
            console.log(response.status)
            if (response.status == 404) {
                successFull = true
            } else if (response.status == 200) {
                response.json().then((json) => {
                    let trilab_diagnostics_history = json.result.value
                    for (const key in trilab_diagnostics_history) {
                        fetch(this.dbUrl(key, '', 'trilab_diagnostics_history'), {
                            method: 'DELETE',
                        })
                    }
                })
                successFull = true
            }
        })
        return successFull
    }

    async getAllHistory(): Promise<object> {
        /// get all testResults from db
        let testResults = await fetch(this.dbUrl('', '', 'trilab_diagnostics_history'))
        if (testResults.status != 200) {
            return {}
        } else {
            let testResultsJson = await testResults.json()
            console.log('HISTORY RESULTS')
            console.log(testResultsJson)
            return testResultsJson.result.value
        }
    }

    async getHistory(step: string): Promise<boolean | object> {
        let testResults = await fetch(this.dbUrl(step, '', 'trilab_diagnostics_history'))
        console.log('testResultsStatus:')
        console.log(testResults.status)
        console.log('testResults:')
        console.log(testResults)
        if (testResults.status != 200) {
            return false
        }
        let testResultsJson = await testResults.json()
        console.log('testResultsJson:')
        console.log(testResultsJson)
        return testResultsJson.result.value ?? false /// key : value
    }

    writeHistory(step: string, startTime: any = false, endTime: any = false, passed = -1) {
        /// write current testResults to history
        /// if startTime is false, get current time string in CET
        if (startTime == false) {
            startTime = new Date().toLocaleString('cs-CZ', { timeZone: 'CET' }) + ' CET'
        }
        if (endTime == false) {
            endTime = ''
        }

        axios
            .post(this.dbUrlRaw(), {
                namespace: 'trilab_diagnostics_history',
                key: step,
                value: {
                    startTime: startTime,
                    endTime: endTime,
                    passed: passed,
                },
            })
            .then((response: any) => {
                console.log('history written')
                console.log(response)
            })
            .catch((error: any) => {
                console.log(error)
                console.log('error writing history')
            })
    }

    dbUrlRaw() {
        return this.$store.getters['socket/getUrl'] + '/server/database/item'
    }
    ///!okAllTest///
    dbUrl(key: string = '', value: string = '', namespace: string = 'trilabdiagnostics') {
        var toReturn = this.$store.getters['socket/getUrl'] + '/server/database/item?namespace=' + namespace
        if (key != '') {
            toReturn = toReturn + '&key=' + key
        }
        if (value != '') {
            toReturn = toReturn + '&value=' + value
        }
        return toReturn
    }

    public summaryTestLastStep = null
    public emergencyStopStarted = false
    async getCurrentStep() {
        let step = await fetch(this.dbUrl('step'))
        if (step.status != 200) {
            return null
        } else {
            let stepjson = await step.json()
            console.log('toto je step: ')
            console.log(step)
            return stepjson.result.value
        }
    }

    async setEmergencyStopCheckStart() {
        /// we must add current time to the database
        await fetch(this.dbUrl('emergencyStopCheckStart', new Date().getTime().toString()), {
            method: 'POST',
        })
        /// resumetestall to 1 if alltest is running now
        if (this.testAllInProgress) {
            await fetch(this.dbUrl('resumeTestAll', '1'), { method: 'POST' })
        }
        this.emergencyStopStarted = true
        /// after the time is set, we have to do the emergency stop
        /*this.$socket.emit('printer.emergency_stop', {}, { loading: 'topbarEmergencyStop' }) */
    }
    cancelEmergencyCheck() {
        this.emergencyStopDialogOpen = false
        this.testAllInProgress = false
        fetch(this.dbUrl('emergencyStopCheckStart', ''), { method: 'DELETE' })
        fetch(this.dbUrl('resumeTestAll', ''), { method: 'DELETE' })
        this.emergencyStopStarted = false
    }

    async setCurrentStep(step: string) {
        this.currentStep = step
        //// save current testResults to db
        fetch(this.dbUrl('testResults', JSON.stringify(this.testResults)), {
            method: 'POST',
        })
        return await fetch(this.dbUrl('step', step), { method: 'POST' })
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
            this.testAllInProgress = false
            console.log('catched value is 0, setting testAllInProgress to false')
        }
        this.testResults[key] = value
    }


    testChamberFlapIntake(status: number) {
        //console.log("testChamberFlapIntake");
        this.enabledChamberYesButton = true
        //this.enabledChamberCommandDialogButton = false
        if (this.trickChamberDialog) {
            return false; /// dale nepokracujeme pokud je trik
        }



        const power = this.chamberIntakeFlapPresent[0]?.power ?? 0
        //console.log("testChamberFlapIntake");
        //console.log(this.chamberIntakeFlapPresent[0]);
        let speed = 1
        if (power > 0.5) {
            speed = 0
        }
        if (power <= 0.5) {
            speed = 1
        }
        console.log('setting speed to ' + speed)

        const gcode = `SET_FAN_SPEED FAN=intake_flap SPEED=${speed}`
        this.sendGcode(gcode)
    }
    testPrintFlap(status: number) {
        this.enabledPrintflapYesDialogButton = true
        //this.enabledPrintflapCommandDialogButton = false
        if (this.trickPrintflapDialog) {
            return false; /// dale nepokracujeme pokud je trik
        }
        /// status depends on target power attribute
        const power = this.printFlapPresent[0]?.power ?? 0
        //console.log("testPrintFlap");
        //console.log(this.printFlapPresent[0]);
        let speed = 1

        /// set the speed to farthest value from the current power value. For example if current power is 20, set 1, if current power is 60, set 0
        if (power >= 0.5) {
            speed = 0
        } else {
            speed = 1
        }

        //console.log("setting speed to " + speed);
        if (status == 0) {
            speed = 0
        }
        const gcode = `SET_FAN_SPEED FAN=print_flap SPEED=${speed}`
        this.sendGcode(gcode)
    }
    testFan(status: number) {
        /// here we have to heat the hotend to 50 degrees
        /// SET_HEATER_TEMPERATURE HEATER=extruder TARGET=
        /// status depends on target power attribute
        //console.log("testFan");
        let speed = 0.5
        let temp = 30
        if (status == 0) {
            speed = 0
            temp = 0
        }

        const gcodeheater = `SET_HEATER_TEMPERATURE HEATER=extruder TARGET=${temp}`
        this.sendGcode(gcodeheater)
        const gcode = `HEATER_FAN_SET_SPEED FAN=heatbreak_fan SPEED=${speed}`
        this.sendGcode(gcode)

        if (status == 1) {
            this.fanTestLoading = true
        } else {
            this.fanTestLoading = false
        }

        if (status == 1) {
            setTimeout(() => {
                /// check rpm if it is between 7500 and 8000, then it is ok, otherwise 0
                const rpm = this.heatbreakfanPresent[0]?.rpm ?? 0
                if (rpm > 15000 && rpm < 17000) {
                    this.testResults.heatbreakfan = 1
                } else {
                    this.testResults.heatbreakfan = 0
                    this.testAllInProgress = false;
                    console.log('FAILED BECAUSE RPM WAS ' + rpm)
                }
                this.testFan(0)
            }, 5000)
        }
    }

    public activeTab = 'delta'
    public tabTitles = [
        {
            title: 'Basic',
            name: 'basic',
            icon: mdiAlphaBBox,
        },
    ]

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
    public usbNumberChangeObserved = false
    @Watch('usbNumber')
    onUsbNumberChanged(newValue: any, oldValue: any) {
        this.usbNumberChangeObserved = true
    }


    get usbNumber() {
        /// filter this store files filetree - that is list with objects. It has childrens[], disk_usage, filename,isDirectory (bool), modified, permissions
        /// therefore count every filetree and their childrens and their childrens if the filename starts with usb and isDirectory == true
        const filetree = this.$store.state.files.filetree ?? []
        let duplicityCheck: Array<string> = []

        let usbNumber = 0
        for (let i = 0; i < filetree.length; i++) {
            const element = filetree[i]
            if (element.filename != 'gcodes') {
                continue
            }
            if (element.filename.startsWith('usb') && element.isDirectory && element.modified == 0) {
                //usbNumber++;
                console.log('USB FOUND UNDER FIRST ITERATION:')
                console.log(element)
            }
            if (element.childrens) {
                for (let j = 0; j < element.childrens.length; j++) {
                    const element2 = element.childrens[j]
                    if (element2.filename.startsWith('usb') && element2.isDirectory && element2.modified == 0) {
                        if (duplicityCheck.includes(element.filename + element2.filename)) {
                            continue
                        }
                        usbNumber++
                        duplicityCheck.push(element.filename + element2.filename)
                        console.log(
                            'USB FOUND UNDER SECOND ITERATION UNDER DIRECTORY: ' + element.filename + ' & object:'
                        )
                        console.log(element2)
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

        return usbNumber
    }

    async printProtocol() {
        console.log('print protocol')
        const doc = new jsPDF()

        /// prusa img in b64
        const TimageB64 =
            'data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACgCAYAAAC2eFFiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsEAAA7BAbiRa+0AAABjaVRYdFNuaXBNZXRhZGF0YQAAAAAAeyJjbGlwUG9pbnRzIjpbeyJ4IjowLCJ5IjowfSx7IngiOjE0MzgsInkiOjB9LHsieCI6MTQzOCwieSI6NzY3fSx7IngiOjAsInkiOjc2N31dff1sGsEAADLLSURBVHhe7Z0HuNTE9sBjQ7GiqCgoYkFFUBAr/JUnigURFTsW0GehiGJFUEFFrBQRuxS7Yhd7V7AXBEVAREVAEBWfz97w5T+/uRNuMjtJZvfuvXezzO/7znc3ySSbm01Ozpw5c85yvsBzOByODLC8+utwOBwlj1NYDocjMziF5XA4MoNTWA6HIzM4heVwODKDU1gOhyMzOIXlcDgyg1NYDocjMziF5XA4MoNTWA6HIzM4heVwODKDU1gOhyMzuMnPjmWO+fPne5999pk3Z84c75tvvvF+/vlnb8mSJd7KK6/srbnmml6DBg28TTbZRErjxo295Zd37/VSoaQV1n333ectXLjQW2655dSaqsO/W6dOHa9+/freeuut52222Wbe5ptvrrYWzueff+499thjRT1XneDcV199da9JkyZe06ZNvY022khtLZyPPvrIe+GFFxLPne9ed911ve7du6s1Veeuu+7yvv3229Tvbd++vde6dWu1Jn84xksvveQ9+eST3sSJE71Zs2Z5v//+u9oaDwqM67zzzjt7++67rxSuQU1zxx13eIsXL069TijaY489Vq0pU8Q/WrJsvfXWKNNqFaEA/ObNm/u9evXyX331VfXN+fPAAw8Yj1+dstpqq/n/+te//Jtuusn/8ccf1Znkz8iRI43H16Vhw4b+//73P7VX1RHKwPg9ulxxxRVqj/z4+++//TFjxvhC2RmPm6+IF5zfp08ff/r06eobqp+ZM2cazyVOhOWo9ixPSlph7bLLLsYfpTqlXbt2vngTqzOwR1hXxuPVlIjui3/99ders8mPm2++2XhMXbbZZpuiKqxWrVoZv0eXa665Ru1hz9tvv+3vsMMOxuNVVXjJ9evXzxdWmvq26uP88883nkOcDBkyRO1ZnrjOucakSZO8Aw44wDv66KO9//znP2pt6TN37lxPvP29/fbbz1u0aJFau2wiLE5v99139yZPnqzWFJe//vrLu/rqqz3xcvNmz56t1hYfYSF648ePV0t23HvvvZ54qail8sMprBjwn+22225SEWSJ5557zttjjz28r776Sq1Ztrj00ku93r17y4e9unnvvfc80SX3RBdRrSkur7zyivfFF1+oJTtmzJjhvfnmm2qp/HAKK4GZM2dKiyVLlhbgVD744IO9P/74Q61ZNhBdW2/QoEFqqWb4+uuvvU6dOnnfffedWlM8br/9dvUpP3DSlytOYaXwySefFHVkrKagOzRgwAC1VP58+OGHsktcG2CFn3jiiWqpOKAAGdUsBEarf/rpJ7VUXjiFZQE3zp133qmWssOoUaOK2l2pzpCNJNK+1/d9r1evXt4///yj1qSz6aabekcddZS0yIYPH+6NGDHCO//886XvcpdddpEhDfnwxBNPeA899JBaqjoPP/ywjA8rBEIgClV2pU5Jx2Htuuuu3jvvvKOW4iFOh7Zx8C/iKOWHJGAQR2m+Jjw3OF3EuBt5woQJshuWxmqrreb16NEjrweCtyXnPWXKFBm3lA98F12lJG655RavZ8+eaime5s2be9OmTSua4tp+++29qVOnqqV4Ro4c6fXt21ct5UIM2T777KOWkll//fW9K6+8UiqrunXrqrW5cL3pkuFct/WHbbvttvL/KUagadu2bb233npLLeUPMWPPPvusWiojUFilim1YQ77D+T/88IP/1FNP+R07djQeL07Gjx+vjpCLbVgDsUyF8v3338sh/rXWWst4bJM0aNDA/+WXX9QRzNiGNRCvVhthDcSJJSGsIuN+umy22Wa+eFmpvex4/fXX/fr16xuPZxLCKaqK6N764qVgPL6trLTSSv6cOXPUEcuHsugS/vrrr+qTHfXq1fP2339/7+mnn/aEAlBr07n//vvVp8JhyLlQ/8I666zjnXHGGTJqm//BBqae2FgxWeXPP//0hFJRS/Fg9YwbN87bYost1Bo7/u///k+OGNtalcWwau6++27ZK6gKhYREZIFl3oeFAjj11FPVUjLi7en99ttvaqn22GGHHbyLL75YLaVTXcPupQDzAhcsWKCW4mnRooUMQSiEvffe2+vSpYtaSoZue1VAARfjxQjFUHylhnO6Cy666CI56TUNhrCZM1gK4BxmTqENzMcsBrV18yd9Lz49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'
        doc.addImage(TimageB64, 'png', 0, 10, 80, 50, undefined, 'FAST')
        doc.text('Printer SN:' + this.$store.state.trilab.settings.serial_number + ' diagnostics report', 10, 70)
        doc.text('Date: ' + this.getCurrTimeCETString(), 10, 80)
        doc.text('Responsible tester: ' + this.responsibleTester, 10, 90)
        doc.text('Tester signature (fill): ', 10, 100)
        doc.text('---------------------------------------', 10, 110)
        let ypos = 120

        await this.getAllHistory().then((history: any) => {
            const keyConverterToHumanUnderstandable: any = {
                endstopsOpenState: 'Endstops',
                heatbreakfan: 'Blower fan',
                printflap: 'Print flap',
                chamberflap: 'Chamber flap',
                extruderCheck: 'Hotend heater',
                extruderMotorCheck: 'Extruder motor',
                bedCheck: 'Bed heater',
                panelCheck: 'Chamber heater',
                bedProbes: 'Probe',
                filamentCheck: 'Filament sensor',
                emergencyStopCheck: 'Stop button',
                usb: 'USB ports',
            }

            for (const key in keyConverterToHumanUnderstandable) {
                if (history[key] != undefined) {
                    const element = history[key]
                    let humanTextToUse = keyConverterToHumanUnderstandable[key]
                    if (humanTextToUse == undefined) {
                        continue
                    }
                    let passedText = 'PASS'
                    if (element.passed == 0) {
                        passedText = 'FAIL'
                    }
                    if (element.passed == -1) {
                        passedText = 'NC'
                    }
                    doc.text(
                        humanTextToUse +
                        ': ' +
                        element.endTime +
                        //' - ' +
                        //element.endTime +
                        ' - ' +
                        passedText,
                        10,
                        ypos
                    )
                    ypos += 15
                }
            }
        })
        doc.save('Printer_report.pdf')
    }
}
</script>
