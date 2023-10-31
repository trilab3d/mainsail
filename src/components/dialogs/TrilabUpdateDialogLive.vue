<template>
    <v-dialog v-model="isDialogVisible" width="720">
        <v-card>
            <v-card-title>
                <span class="headline">
                    {{ $t('TrilabUpdateDialog.title') }}
                </span>
            </v-card-title>

            <v-card-text>
                <h3 class="mb-3">{{ $t('TrilabLiveUpdate.statuses.' + liveUpdateStatus) }}</h3>
                <div v-if="liveUpdateStatus == 'UPDATE_AVAILABLE' || liveUpdateStatus == 'USB_UPDATE_AVAILABLE'"
                    class="justify-center">
                    <v-btn color="primary" block :disabled="downloadUpdateDisabled" @click="downloadUpdate()" v-if="liveUpdateStatus == 'UPDATE_AVAILABLE'">{{
                        $t('TrilabLiveUpdate.Buttons.DownloadUpdate') }}</v-btn>
                    <v-btn color="primary" block :disabled="installUpdateDisabled" @click="installUpdate()" v-if="liveUpdateStatus == 'USB_UPDATE_AVAILABLE'">{{
                        $t('TrilabLiveUpdate.Buttons.InstallFromUsb') }}</v-btn>
                </div>

                <div v-if="'progress' in LiveUpdateStatusObject && LiveUpdateStatusObject.progress != -1">
                    <v-progress-linear :value="LiveUpdateStatusObject.progress * 100" :color="uploadFileProgressbarColor"
                        :height="10" striped></v-progress-linear>
                </div>
                <v-container v-if="liveUpdateStatus == 'INSTALLED' || liveUpdateStatus == 'USB_INSTALLED'">
                    <p>{{ $t('TrilabLiveUpdate.restartWarning') }}</p>
                    <p v-if="printerIsPrinting">{{ $t('TrilabLiveUpdate.printerIsPrinting') }}</p>
                    <v-btn block color="red" :disabled="printerIsPrinting" @click="performUpdate()">{{ $t('TrilabLiveUpdate.installAndRebootBtn') }}</v-btn>

                </v-container>
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



import BaseMixin from '../mixins/base'
import TrilabMixin from '../mixins/trilab'
import { Mixins } from 'vue-property-decorator'
import Component from 'vue-class-component'
import { PropSync, Prop, Vue, Watch } from 'vue-property-decorator'
import { trilab } from '@/store/trilab'

@Component({})
export default class TrilabUpdateDialog extends Mixins(BaseMixin, TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean
    public dismissVisible: boolean = true;



    public downloadUpdateDisabled = false;
    public installUpdateDisabled = false;

    public performUpdateDisabled = false;

    get uploadFileProgressbarColor() {
        if (this.liveUpdateStatus == "ERROR") {
            return "danger";
        }
        return "primary";
    }
    get isDialogVisible(){
        return this.showp;
    }
    set isDialogVisible(value){
        if(!value){
        this.$emit('closeLiveUpdateDialog', value);
        }
    }
    closeIt() {
        this.$emit('closeLiveUpdateDialog', false)
    }
    async downloadUpdate(){
        this.downloadUpdateDisabled = true;
        const respo = await axios.post(store.getters['trilab/trilabPrefix'] + "/download_update");
        await this.$store.dispatch('trilab/getLiveUpdateStatus');
        this.downloadUpdateDisabled = false;
        return true;
    }
    async installUpdate(){
        this.installUpdateDisabled = true;
        const respo = await axios.post(store.getters['trilab/trilabPrefix'] + "/install_usb_update");
        await this.$store.dispatch('trilab/getLiveUpdateStatus');
        this.installUpdateDisabled = false;
        return respo;
    }
    async performUpdate(){
        this.performUpdateDisabled = true;
        const respo = await axios.post(store.getters['trilab/trilabPrefix'] + "/perform_update");
        await this.$store.dispatch('trilab/getLiveUpdateStatus');
        this.performUpdateDisabled = false;
        return respo;
    }


}

</script>


<style scoped>
.ulog p {
    margin-left: 16px;
    margin-bottom: 0px;
}
</style>
