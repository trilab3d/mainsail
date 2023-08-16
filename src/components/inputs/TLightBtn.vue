<template>
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


    get getLightIcon():string {
        if (this.$store.state.trilab?.light_state == true) {
            return mdiLightbulbOn;
        }
        return mdiLightbulbOff;
    }


    lightSwitch() {
        this.$store.dispatch('trilab/toggleLight');
    }

}

</script>