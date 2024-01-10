<style scoped>
._filamentRunout-subheader {
    height: auto;
}
</style>

<template>
    <v-container class="px-0 py-2">
        <v-row>
            <v-col class="pb-3">
                <v-subheader class="_filamentRunout-subheader">
                    <v-icon small class="mr-2">{{ mdiDoor }}</v-icon>
                    <span>{{ convertName(name) }}</span>
                    <v-spacer></v-spacer>
                    <small :class="'mr-3 ' + statusColor + '--text'">{{ statusText }}</small>
                    <v-icon @click="changeSensor">
                        {{ enabled ? mdiToggleSwitch : mdiToggleSwitchOffOutline }}
                    </v-icon>
                </v-subheader>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { convertName } from '@/plugins/helpers'
import { Component, Mixins, Prop } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiDoorOpen, mdiDoorClosed, mdiDoor, mdiToggleSwitch, mdiToggleSwitchOffOutline } from '@mdi/js'

@Component
export default class DoorSensor extends Mixins(BaseMixin) {
    /**
     * Icons
     */

    mdiToggleSwitch = mdiToggleSwitch
    mdiToggleSwitchOffOutline = mdiToggleSwitchOffOutline
    mdiDoorOpen = mdiDoorOpen
    mdiDoorClosed = mdiDoorClosed
    mdiDoor = mdiDoor

    
    convertName = convertName

    @Prop({ type: String, required: true }) declare readonly name: string
    @Prop({ type: Boolean, required: true }) declare readonly enabled: boolean
    @Prop({ type: [Number, Boolean], required: true }) declare readonly door_closed: number | boolean

    get statusColor() {
        if (!this.enabled) return 'gray'
        else if (this.door_closed) return 'success'
        else return 'red'
    }

    get statusText() {
        if (!this.enabled) return this.$t('Panels.MiscellaneousPanel.RunoutSensor.Disabled')
        else if (this.door_closed) return this.$t('Panels.MiscellaneousPanel.DoorSensor.Closed')
        else return this.$t('Panels.MiscellaneousPanel.DoorSensor.Open')
    }

    changeSensor() {
        const gcode = 'SET_DOOR_SENSOR_DISABLED DISABLED=' + (this.enabled ? 1 : 0)
        this.$store.dispatch('server/addEvent', { message: gcode, type: 'command' })
        this.$socket.emit('printer.gcode.script', { script: gcode })
    }
}
</script>
