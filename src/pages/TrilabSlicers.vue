<template>
    <v-container fluid py-0 px-0>
                <v-row class="pa-3">
                    <v-col cols="12" md="4" sm="12">
                        <slicer-panel :target="'prusa'" slicer="prusaslicer_230"></slicer-panel>
                    </v-col>
                </v-row>
    </v-container>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'

@Component({
    components: {
    },
})
export default class PageTrilabSlicers extends Mixins(BaseMixin) {

}
</script>
