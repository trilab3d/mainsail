import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class TrilabMixin extends Vue {
    // trilab feature, variables like filament retracted, door sensor , last filament, loaded filament, last_printhead etc...
    get savedVariables(): any | null {
        return this.$store.state.printer?.save_variables?.variables ?? null
    }
    getSavedVariable(variableName: string): any | null {
        /// check if the variable exists in it and return it else return false
        const variables = this.savedVariables
        if (variables == null) return false
        const isInside = variableName in variables
        if (isInside) return variables[variableName]
    }
    ////
    get AdvancedFeatures(): boolean {
        if (
            this.$store.state.trilab.advancedView == true ||
            this.$store.state.trilab.hiddenView == true ||
            this.$store.state.trilab.serviceView == true
        ) {
            return true
        } else {
            return false
        }
    }
    set AdvancedFeatures(value: boolean) {
        this.$store.commit('trilab/setAdvancedFeatures', value)
        localStorage.setItem('trilabAdvancedFeatures', value.toString())
    }
    formatRemainingTime(minutes: number) {
        const days = Math.floor(minutes / 1440)
        const hours = Math.floor((minutes % 1440) / 60)
        const remainingMinutes = minutes % 60
        if (days > 0) {
            return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${remainingMinutes}m`
        } else {
            return `${hours > 0 ? `${hours}h ` : ''}${remainingMinutes}m`
        }
    }

    formatETAnew(minutes: number) {
        if (minutes <= 0) {
            return "--";
        }
        const days = Math.floor(minutes / 1440)
        const hours = Math.floor((minutes % 1440) / 60)
        const remainingMinutes = minutes % 60

        const eta = new Date()
        eta.setSeconds(minutes * 60)

        return `${eta.getHours().toString().padStart(2, '0')}:${eta.getMinutes().toString().padStart(2, '0')} ${days > 0 ? ` +${days}d` : ''}`
    }

    get TrilabServiceView(): boolean {
        if (this.$store.state.trilab.serviceView == true || this.$store.state.trilab.hiddenView == true) {
            return true
        } else {
            return false
        }
    }

    set TrilabServiceView(value: boolean) {
        this.$store.commit('trilab/setServiceView', value)
    }

    get TrilabHiddenView(): boolean {
        return this.$store.state.trilab.hiddenView
    }
    set TrilabHiddenView(value: boolean) {
        this.$store.commit('trilab/setHiddenView', value)
    }

    get liveUpdateStatus() {
        return this.$store.state.trilab?.updateStateStatus.update_status
    }

    get LiveUpdateStatusObject() {
        return this.$store.state.trilab?.updateStateStatus
    }

    getTrilabTemperatureObject(objectName: string): any {
        /// returns readable object for some sensor or something else, with all possible values. It was gone from mainsail, needed for some trilab features throughout the system
        if (!(objectName in this.$store.state.printer)) return {}

        const object = this.$store.state.printer[objectName]
        object.settings = this.$store.state.printer?.configfile?.settings[objectName.toLowerCase()] ?? {}
        object.name = objectName
        object.type = 'heater'
        if (objectName.startsWith('temperature_fan')) {
            object.command = 'SET_TEMPERATURE_FAN_TARGET'
            object.commandAttributeName = 'TEMPERATURE_FAN'
            object.type = 'fan'
        } else if (objectName.startsWith('extruder') || objectName.startsWith('heater_')) {
            object.command = 'SET_HEATER_TEMPERATURE'
            object.commandAttributeName = 'HEATER'
        }

        return object
    }

    get TrilabPrinterIdle() {
        /// if printer does nothing and is ready for any command
        /// i observed some states of the idle_timeout state. I saw 'Idle' and 'Ready' and 'Printing'
        const idle_timeout_state = this.$store.state.printer.idle_timeout?.state
        const printer_state =
            this.$store.state.printer.print_stats?.state ?? this.$store.state.printer.idle_timeout?.state ?? ''
        console.log('printer_state: ' + printer_state + ' idle_timeout_state: ' + idle_timeout_state)
        if (
            (idle_timeout_state == 'Idle' || idle_timeout_state == 'Ready') &&
            (printer_state == 'standby' ||
                printer_state == 'ready' ||
                printer_state == 'cancelled' ||
                printer_state == 'complete')
        ) {
            return true
        }
        return false
    }
    get TrilabPrinterPaused() {
        /// really only if something is printing and it was paused
        const printer_state = this.$store.state.printer.print_stats?.state
        if (printer_state == 'paused') {
            return true
        }
        return false
    }
}
