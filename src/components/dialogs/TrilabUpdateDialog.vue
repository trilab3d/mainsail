<template>
    <v-dialog v-model="dialogVisible" :persistent="!dismissVisible" width="720">
        <v-card>
            <v-card-title>
                <span class="headline">
                    {{ $t('TrilabUpdateDialog.title') }}
                </span>
            </v-card-title>

            <v-card-text>
                <div v-if="uploadError != null">
                    <h3 style="color:#ff5252">ERROR</h3>
                    <hr color="#ff5252" class="mb-2 mt-2">
                    <p>There was an error while uploading the update file. Please try again</p>
                    <v-btn v-if="!AdvancedFeatures || !showTechnicalDetails" class="mt-2 mb-2 block" color="red" @click="showErrorDetails()">{{
                        $t("Trilab.TrilabUpdateDialog.ShowErrorTechinicalDetails") }}</v-btn>
                </div>
                <div v-if="uploadError == null">
                    <div v-if="alreadyUpdating == false">
                        <p v-if="fileUploading">{{ uploadStatus }}</p>
                        <v-btn v-if="uploadError != null" class="mt-2 mb-2 block" color="red" @click="showErrorDetails()">{{
                            $t("Trilab.TrilabUpdateDialog.ShowErrorTechinicalDetails") }}</v-btn>
                        <div v-if="uploadProgress < 100">
                            <v-progress-linear :indeterminate="uploadProgress === null" :value="uploadProgress"
                                :color="uploadFileProgressbarColor" :height="20" striped>
                                <template v-slot:default="{ value }">
                                    <div class="progress-label">{{ value ? `${Math.round(value)}%` : '' }}</div>
                                </template>
                            </v-progress-linear>
                        </div>
                    </div>

                    <div v-if="alreadyUpdating == true">
                        <p>{{ $t("Trilab.TrilabUpdateDialog.STATUS") }} <span>{{ customStatus }}</span></p>
                        <v-progress-linear :indeterminate="updateProgressStatus === 'IDLE'" :value="updateProgressValue"
                            color="primary" :height="15" striped>
                            <template v-slot:default="{ value }">
                                <div class="progress-label">{{ value ? `${Math.round(value)}%` : '' }}</div>
                            </template>
                        </v-progress-linear>
                        <p style="color:#f44336; text-align:center;" class="mt-4">The printer is currently updating. Please
                            do not turn off the device. The printer will automatically restart after the update is
                            completed.</p>
                        <v-btn color="danger" v-if="showRestartBtn">{{ $t('TrilabUpdateDialog.RestartPrinter') }}</v-btn>
                    </div>
                </div>
                <v-list v-if="AdvancedFeatures || showTechnicalDetails">
                    <v-list-item v-for="log in logs" :key="log.id" class="ulog">
                        <span v-if="log.text.indexOf('ERROR') != -1" style="color:#f44336">{{
                            $t("Trilab.TrilabUpdateDialog.DANGER") }}</span>
                        <span v-else-if="log.text.indexOf('WARNING') != -1" style="color:#ff9800">{{ $t("Trilab.TrilabUpdateDialog.WARNING") }}</span>
                        <span v-else style="color:#2196f3">{{ $t("Trilab.TrilabUpdateDialog.INFO") }}</span>
                        <p>
                           {{ log.date }} {{ log.text }}
                        </p>
                    </v-list-item>
                </v-list>



            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn v-if="dismissVisible" color="blue darken-1" text @click="closeIt()">{{ $t('Generic.Ok') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import axios from 'axios'

import store from '@/store'

import BaseMixin from '../mixins/base'
import TrilabMixin from '../mixins/trilab'
import { Mixins } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { PropSync, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class TrilabUpdateDialog extends Mixins(BaseMixin, TrilabMixin) {

    @Prop({ default: null, type: [File, null] as unknown as () => File | null }) readonly file!: File | null;

    alreadyUpdating: boolean = false;
    uploadFileProgressbarColor: string = "primary";
    dismissVisible: boolean = false;
    customStatus: string = "IDLE";
    dialogVisible: boolean = false;
    selectedFile: File | null = null;
    uploadProgress: number = 0;
    updateProgress: number | null = null;
    socket: WebSocket | null = null;
    logs: Array<{ id: number, text: string, level: string, date: string }> = [];
    updateProgressName: string | null = null;
    updateProgressValue: number | null = null;
    updateProgressStatus: string | null = null;
    showRestartBtn: boolean = false;
    fileUploading: boolean = false;
    uploadError: string | null = null;
    uploadStatus: string = "";
    updateDone: boolean = false;
    showTechnicalDetails: boolean = false;

    showErrorDetails() {
        this.showTechnicalDetails = true;
        //alert(this.uploadError);
    }


    resetInternalData() {
        this.uploadFileProgressbarColor = "primary"
        this.dismissVisible = false
        this.customStatus = "IDLE"
        this.selectedFile = null
        this.uploadProgress = 0
        this.updateProgress = null
        this.logs = []
        this.updateProgressName = null
        this.uploadStatus = "";
        this.updateProgressValue = null
        this.updateProgressStatus = null
        this.showRestartBtn = false
        this.uploadError = null
        this.updateDone = false
        /// set store trilab/updateFile to null

    }



    getStatus() {
        //let status = this.$t.generic.updateStatuses[this.customStatus]
        let status = this.customStatus;
        if (status === undefined) {
            return this.customStatus
        }
        return status;
    }

    @Watch('isVisible')
    onIsVisibleChanged(newVal: boolean, oldVal: boolean) {
        if (newVal && oldVal == false) {
            this.uploadFileProgressbarColor = "primary"
            this.dismissVisible = false
            this.customStatus = "IDLE"
            this.dialogVisible = false
            this.selectedFile = null
            this.uploadProgress = 0
            this.updateProgress = null
            this.logs = []
            this.updateProgressName = null
            this.uploadStatus = "";
            this.updateProgressValue = null
            this.updateProgressStatus = null
            this.showRestartBtn = false
            this.uploadError = null
            this.updateDone = false
        }
    }

    @Watch('file')
    onFileChanged(newFile: File | null) {
        if (newFile !== null && this.alreadyUpdating == false) {
            this.selectedFile = newFile
            this.dialogVisible = true

            /// upload the file as a form data content
            let formData = new FormData()
            formData.append('file', newFile)

            //axios.post('/api/trilab/update', formData, {
            //console.log(this.$store.state.trilab.connectedHostname + ':8080/upload');
            this.fileUploading = true;
            //this.uploadStatus = this.$t('').toString();
            this.uploadStatus = 'File uploading...';
            axios.post("http://" + this.$store.state.trilab.connectedHostname + '/swupdate/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                }
            }).then((response) => {
                this.customStatus = response.data.status
                this.uploadProgress = 100
                this.uploadFileProgressbarColor = "success"
                this.updateProgress = 0
                this.updateProgressName = response.data.name
                this.updateProgressValue = 0
                this.updateProgressStatus = "IDLE"
                this.showRestartBtn = false
                this.uploadStatus = "";
                this.uploadError = null
                this.updateDone = false
                this.fileUploading = false;

            }).catch((error) => {
                this.uploadError = error
                this.dismissVisible = true
                this.uploadStatus = "ERROR | Something happened while uploading";
                this.uploadError = error.toString();
                this.uploadFileProgressbarColor = "red";
            })
        }
    }

    closeIt() {
        this.$emit('close')
        this.dialogVisible = false
        this.resetInternalData();
    }

    createSocket() {
        var refe = this;
        let s = "https:" === window.location.protocol ? "wss:" : "ws:";
        ///uncomment below for production
        if (this.socket != null) {
            /// if socket is open
            if (this.socket.readyState == 1) {
                /// dont create a new one
                return;
            }

        }
        this.socket = new WebSocket(s + "//" + this.$store.state.trilab.connectedHostname + "/swupdate/" + window.location.pathname.replace(/\/[^/]*$/, "") + "ws");

        //this.socket = new WebSocket(s + "//" + "10.1.20.237/swupdate/" + window.location.pathname.replace(/\/[^/]*$/, "") + "/ws");
        (this.socket.onopen = function () {
            //refe.updateStatus("IDLE");
        }),
            (this.socket.onclose = function () {
                console.log("SWU SOCKET CLOSED");
                if (refe.updateDone) {
                    refe.showRestartBtn = true;
                } else {
                    setTimeout(function () {
                        refe.createSocket();
                    }, 2000)
                }
            }),
            (this.socket.onerror = function (e) {
                console.log("SWU SOCKET ERROR: ");
                console.log(e);
                /// try to create the socket again
                setTimeout(function () {
                    refe.createSocket();
                }, 2000)
            }),
            (this.socket.onmessage = function (data) {
                var e = JSON.parse(data.data);
                switch (e.type) {
                    case "message":
                        e.date = new Date().toLocaleString();
                        refe.logs.unshift(e); /// push whole message
                        if (refe.logs.length > 2000) {
                            refe.logs.shift(); /// if there is more than 2000 logs, remove the last one
                        }
                        break;
                    case "status":

                        refe.updateStatus(e.status), refe.updateProgressBarStatus(e.status)
                        break;
                    case "source":
                        break;
                    case "step":
                        var r = Math.round((100 * (Number(e.step) - 1) + Number(e.percent)) / Number(e.number)),
                            t = r + "% (" + e.step + " of " + e.number + ")";
                        refe.updateProgressBar(r, e.name, t);
                        refe.alreadyUpdating = true;
                        refe.dismissVisible = false;
                        refe.dialogVisible = true;
                        break;
                    case 'log':
                        /// push message to the logs on the first position
                        refe.logs.unshift(data.data);
                        /// if there is more than 2000 logs, remove the last one
                        if (refe.logs.length > 2000) {
                            refe.logs.shift();
                        }
                        break;
                    case 'progress':
                        refe.updateProgress = e.progress
                        refe.updateProgressValue = e.progress * 2
                        refe.updateProgressStatus = e.status
                        refe.showRestartBtn = e.status === 'DONE'
                        refe.updateDone = e.status === 'DONE'
                        /// set this dialog to visible
                        refe.alreadyUpdating = true;
                        refe.dialogVisible = true;
                        break;
                    case 'error':
                        refe.uploadError = data.data.error
                        refe.dismissVisible = true
                        break;


                }
            });
        this.socket.onerror = function (e) {
            console.log("SWU SOCKET ERROR: ");
            console.log(e);
            /// try to create the socket again
        };

    }

    updateStatus(e: any) {
        this.customStatus = e;
    }
    updateProgressBarStatus(e: any) {
        switch (e) {
            case "IDLE":
                this.uploadFileProgressbarColor = "primary";
                break;
            case "DOWNLOADING":
                this.uploadFileProgressbarColor = "primary";
                break;
            case "INSTALLING":
                this.uploadFileProgressbarColor = "primary";
                break;
            case "DONE":
                this.uploadFileProgressbarColor = "success";
                break;
            case "ERROR":
                this.uploadFileProgressbarColor = "danger";
                this.dismissVisible = true;
                break;
        }
    }
    updateProgressBar(e: any, r: any, t: any) {
        (this.updateProgress = e),
            (this.updateProgressName = r),
            (this.updateProgressValue = e),
            (this.updateProgressStatus = t);
    }

    mounted() {
        this.createSocket();
    }


}


</script>


<style scoped>
.ulog p {
    margin-left: 16px;
    margin-bottom: 0px;
}
</style>
