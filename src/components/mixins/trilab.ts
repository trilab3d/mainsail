import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class TrilabMixin extends Vue {
    get AdvancedFeatures(): boolean {
        return this.$store.state.trilab.settings.advanced_features
    }
    set AdvancedFeatures(value: boolean) {
        this.$store.commit('trilab/setAdvancedFeatures')
        localStorage.setItem(
            'trilabAdvancedFeatures',
            this.$store.state.trilab?.settings.advanced_features.toString() ?? 'false'
        )
    }
}
