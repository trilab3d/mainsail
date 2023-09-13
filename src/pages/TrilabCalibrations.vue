<template>
    <v-container py-0 px-0>
        <v-tabs v-model="activeTab">
            <v-tab v-for="(tab, index) of tabTitles" :key="index" :href="'#' + tab.name" style="width: 200px">
                <v-icon left v-html="tab.icon"></v-icon>
                <span class="text-truncate">{{ tab.title }}</span>
            </v-tab>
        </v-tabs>

        <v-row>
            <v-col cols="12" md="12" sm="12" class="pa-3 mt-3">
                <trilab-delta-calibration-wizard v-if="activeTab === 'delta'"></trilab-delta-calibration-wizard>
            </v-col>
        </v-row>
    </v-container>
</template>
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiCog, mdiPackageVariantClosed, mdiDelta } from '@mdi/js'
@Component({
    components: {
    },
})
export default class PageTrilabCalibrations extends Mixins(BaseMixin) {
    public activeTab = "delta";
    public tabTitles =
        [
            {
                title: "Delta",
                name: "delta",
                icon: mdiDelta
            },
            {
                title: "Krychle",
                name: "box",
                icon: mdiPackageVariantClosed
            },
        ]


}
</script>
