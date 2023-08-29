import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class TrilabMixin extends Vue {
    get AdvancedFeatures(): boolean {
        if(this.$store.state.trilab.advancedView == true || this.$store.state.trilab.hiddenView == true){
            return true;
        } else {
            return false;
        }
    }
    set AdvancedFeatures(value: boolean) {
        this.$store.commit('trilab/setAdvancedFeatures')
        localStorage.setItem(
            'trilabAdvancedFeatures',
            this.$store.state.trilab?.advancedView.toString() ?? 'false'
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
        this.$store.commit('trilab/setServiceView')

    }

    get TrilabHiddenView(): boolean {
        return this.$store.state.trilab.hiddenView;
    }
    set TrilabHiddenView(value:boolean){
        this.$store.commit('trilab/setHiddenView')
    }
}
