<template v-if="getLight() != false">
    <v-btn tile :icon="$vuetify.breakpoint.smAndDown" :text="$vuetify.breakpoint.mdAndUp" color="primary"
        class="button-min-width-auto px-3 d-none d-sm-flex home-button upload-and-start-button" @click="lightSwitch()">
        <v-icon class="mr-md-2">{{ getLightIcon }}</v-icon>
        <span class="d-none d-md-inline">{{ $t('App.TopBar.LightBtn') }}</span>
    </v-btn>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Prop, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiLightbulbOff, mdiLightbulbOn } from '@mdi/js'


export default class TLightBtn extends Mixins(BaseMixin) {

    mdiLightbulbOff = mdiLightbulbOff
    mdiLightbulbOn = mdiLightbulbOn


    get getLightIcon(): string {
        if (this.getLight.singleChannelTarget > 0) {
            return mdiLightbulbOn;
        }
        return mdiLightbulbOff;
    }
    get getLightStatus(): boolean {
        if (this.getLight.singleChannelTarget > 0) {
            return true;
        }
        return false;
    }

    get getLight() {
        return this.$store.getters['printer/getLights'][0] ?? false
    }

    get ledChannelName() {
        if (this.getLight.colorOrder === 'R') return 'RED'
        if (this.getLight.colorOrder === 'G') return 'GREEN'
        if (this.getLight.colorOrder === 'B') return 'BLUE'

        return 'WHITE'
    }


    lightSwitch() {
        let gcode = '';
        if (this.getLightStatus == true) {
            gcode = `SET_LED LED=${this.getLight.name} ${this.ledChannelName}=${parseInt("0").toFixed(2)} SYNC=0 TRANSMIT=1`
        } else {
            gcode = `SET_LED LED=${this.getLight.name} ${this.ledChannelName}=${parseInt("8000").toFixed(2)} SYNC=0 TRANSMIT=1`
        }
        if (gcode !== '') {
            this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
            this.$socket.emit('printer.gcode.script', { script: gcode })
        }


    }

}

</script>