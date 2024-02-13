import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class TrilabMixin extends Vue {
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

    get TrilabPrinterIdle() {
        /// if printer does nothing and is ready for any command
        /// i observed some states of the idle_timeout state. I saw 'Idle' and 'Ready' and 'Printing'
        const idle_timeout_state = this.$store.state.printer.idle_timeout?.state
        const printer_state =
            this.$store.state.printer.print_stats?.state ?? this.$store.state.printer.idle_timeout?.state ?? ''
        console.log("printer_state: " + printer_state + " idle_timeout_state: " + idle_timeout_state);
        if ((idle_timeout_state == 'Idle' || idle_timeout_state == 'Ready') && (printer_state == "standby" || printer_state == "ready" || printer_state == 'cancelled' || printer_state == 'complete')) {
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
