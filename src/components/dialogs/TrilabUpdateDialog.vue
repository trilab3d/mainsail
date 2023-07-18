<template>
    <v-dialog v-model="dialogVisible" persistent width="720">
        <v-card>
            <v-card-title>
                <span class="headline">
                    {{ $t('dialog.trilab.update.title') }}
                </span>
            </v-card-title>

            <v-card-text>
                <p>{{ customStatus }}</p>
                <div v-if="uploadProgress < 100">
                    <v-progress-linear v-if="uploadError === null" :indeterminate="uploadProgress === null"
                        :value="uploadProgress" :color="uploadFileProgressbarColor" :height="10" striped
                        absolute></v-progress-linear>
                </div>

                <div v-if="uploadProgress >= 100">
                    <p>STATUS: <span>{{ customStatus }}</span></p>
                    <v-progress-linear :indeterminate="updateProgressStatus === 'IDLE'"
                        :color="updateProgressStatus === 'IDLE' ? 'primary' : 'success'" :value="updateProgressValue"
                        :buffer-value="updateProgressValue" :height="5" striped absolute></v-progress-linear>
                    <v-list>
                        <v-btn color="danger" v-if="showRestartBtn"></v-btn>
                        <v-list-item v-for="log in logs" :key="log.id">
                            <span v-if="log.level">DANGER</span>
                            <p>
                                {{ log.text }}
                            </p>
                        </v-list-item>
                    </v-list>
                </div>


            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" v-if="dismissVisible" text>{{ $t('generic.ok') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import axios from 'axios'

import store from '@/store'



import BaseMixin from '../mixins/base'
import { Mixins } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { PropSync, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class TrilabUpdateDialog extends Mixins(BaseMixin) {

    @Prop({ default: null, type: [File, null] as unknown as () => File | null }) readonly file!: File | null;

    uploadFileProgressbarColor: string = "primary";
    dismissVisible: boolean = false;
    customStatus: string = "IDLE";
    dialogVisible: boolean = false;
    selectedFile: File | null = null;
    uploadProgress: number = 0;
    updateProgress: number | null = null;
    socket: WebSocket | null = null;
    logs: Array<{ id: number, text: string, level: string }> = [];
    updateProgressName: string | null = null;
    updateProgressValue: number | null = null;
    updateProgressStatus: string | null = null;
    showRestartBtn: boolean = false;
    uploadError: string | null = null;
    updateDone: boolean = false;

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
            this.updateProgressValue = null
            this.updateProgressStatus = null
            this.showRestartBtn = false
            this.uploadError = null
            this.updateDone = false
        }
    }

    @Watch('file')
    onFileChanged(newFile: File | null) {
        if (newFile !== null) {
            this.selectedFile = newFile
            this.dialogVisible = true

            /// upload the file as a form data content
            let formData = new FormData()
            formData.append('file', newFile)

            axios.post('/api/trilab/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                }
            }).then((response) => {
                this.customStatus = response.data.status
                this.uploadProgress = 100
                this.dismissVisible = true
                this.uploadFileProgressbarColor = "success"
                this.updateProgress = 0
                this.updateProgressName = response.data.name
                this.updateProgressValue = 0
                this.updateProgressStatus = "IDLE"
                this.showRestartBtn = false
                this.uploadError = null
                this.updateDone = false

                this.socket = new WebSocket('ws://' + window.location.host + '/api/trilab/update/socket')
                this.socket.onmessage = (event) => {
                    let data = JSON.parse(event.data)
                    if (data.type === 'log') {
                        this.logs.push(data)
                    } else if (data.type === 'progress') {
                        this.updateProgress = data.progress
                        this.updateProgressValue = data.progress
                        this.updateProgressStatus = data.status
                        this.showRestartBtn = data.status === 'DONE'
                        this.updateDone = data.status === 'DONE'
                    } else if (data.type === 'error') {
                        this.uploadError = data.error
                    }
                }
            }).catch((error) => {
                this.uploadError = error
            })
        }
    }

    closeIt() {
        this.$emit('close')
    }

    createSocket() {
        var refe = this;
        let s = "https:" === window.location.protocol ? "wss:" : "ws:";
        ///uncomment below for production
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
                        refe.logs.push(e); /// push whole message
                        break;
                    case "status":

                        //refe.updateStatus(e.status), refe.updateProgressBarStatus(e.status);
                        break;
                    case "source":
                        break;
                    case "step":
                        var r = Math.round((100 * (Number(e.step) - 1) + Number(e.percent)) / Number(e.number)),
                            t = r + "% (" + e.step + " of " + e.number + ")";
                        //refe.updateProgressBar(r, e.name, t);
                        refe.dismissVisible = false;
                        refe.dialogVisible = true;
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
