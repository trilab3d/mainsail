<template>
    <panel v-if="klipperReadyForGui && macros.length > 0" :icon="mdiCodeTags" :title="$t('Panels.MacrosPanel.Headline')"
        :collapsible="true" card-class="macros-panel">
        <v-card-text class="py-4">
            <v-row v-for="(macro, index) in macros" :key="'macro_' + index">
                <v-col cols="12" class="py-2">
                    <macro-button @clickLoadFilament="showLoadFilamentWizard = true"
                        @clickUnloadFilament="showUnloadFilamentWizard = true" :macro="macro" color="primary" class=""
                        style="" />
                </v-col>
            </v-row>
        </v-card-text>
        <trilab-filament-load-wizard :showp="showLoadFilamentWizard"
            @close="showLoadFilamentWizard = false"></trilab-filament-load-wizard>
        <trilab-filament-un-load-wizard :showp="showUnloadFilamentWizard"
            @close="showUnloadFilamentWizard = false"></trilab-filament-un-load-wizard>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '../mixins/base'
import Panel from '@/components/ui/Panel.vue'
import MacroButton from '@/components/inputs/MacroButton.vue'
import TrilabFilamentLoadWizard from '@/components/dialogs/TrilabFilamentLoadWizard.vue'
import { mdiCodeTags } from '@mdi/js'
import { PrinterStateMacro } from '@/store/printer/types'
@Component({
    components: { MacroButton, Panel, TrilabFilamentLoadWizard },
})
export default class MacrosPanel extends Mixins(BaseMixin) {
    mdiCodeTags = mdiCodeTags


    public showLoadFilamentWizard: boolean = false;
    public showUnloadFilamentWizard: boolean = false;

    get hiddenMacros() {
        return (this.$store.state.gui?.macros?.hiddenMacros ?? []).map((name: string) => name.toLowerCase())
    }

    get macros() {
        const macros = this.$store.getters['printer/getMacros']

        return macros.filter((macro: PrinterStateMacro) => !this.hiddenMacros.includes(macro.name.toLowerCase()))
    }

}
</script>
