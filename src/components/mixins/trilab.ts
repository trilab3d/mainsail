import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class TrilabMixin extends Vue {
    get AdvancedFeatures(): boolean {
        if(this.$store.state.trilab.advancedView == true || this.$store.state.trilab.hiddenView == true || this.$store.state.trilab.serviceView == true){
            return true;
        } else {
            return false;
        }
    }
    set AdvancedFeatures(value: boolean) {
        this.$store.commit('trilab/setAdvancedFeatures', value)
        localStorage.setItem(
            'trilabAdvancedFeatures',
            value.toString()
        )
    }

    get TrilabServiceView(): boolean {
        if(this.$store.state.trilab.serviceView == true || this.$store.state.trilab.hiddenView == true){
            return true;
        } else {
            return false;
        }
    }

    set TrilabServiceView(value:boolean){
        this.$store.commit('trilab/setServiceView', value)

    }

    get TrilabHiddenView(): boolean {
        return this.$store.state.trilab.hiddenView;
    }
    set TrilabHiddenView(value:boolean){
        this.$store.commit('trilab/setHiddenView', value)
    }


    get liveUpdateStatus() {
        return this.$store.state.trilab?.updateStateStatus.update_status;
    }

    get LiveUpdateStatusObject(){
        return this.$store.state.trilab?.updateStateStatus;
    }


}
