<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('panel.settingsPrinter.caption') }}
			<v-spacer></v-spacer>
			<a v-show="!uiFrozen" href="javascript:void(0)" @click="showResetConfirmation = true" v-if="false">
				<v-icon small class="mr-1">mdi-restore</v-icon> {{ $t('panel.settingsGeneral.factoryReset') }}
			</a>
		</v-card-title>

		<v-card-text>
			<v-row>
				<v-col cols="12" sm="12">
					<v-text-field v-model="printerName" type="text" step="any" min="0"
						:label="$t('panel.settingsPrinter.printerName', ['ms'])" hide-details>
					</v-text-field>
				</v-col>
			</v-row>
			
			<v-switch v-model="enableAdvancedFeatures" :label="$t('panel.settingsPrinter.enableAdvancedFeatures')"
				hide-details></v-switch>

		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import { mapState, mapGetters } from 'vuex'
import store from '@/store'

export default {
	data() {
		return {
			showResetConfirmation: false
		}
	},

	computed: {

		uiFrozen() {
			//return this.$store.state.uiFrozen;
			return false;
		},
		printerName: {
			get() { return this.$store.state.trilab.settings.network_data.hostname; },
			set(value: any) { this.$store.commit('trilab/setData', { network_data: { hostname: value } }); }
		},
		enableAdvancedFeatures: {
			get() { return this.$store.state.trilab.advanced_features; },
			set(value: boolean) { this.$store.commit('trilab/setData', { advanced_features: value }) }
		}

	},
}
</script>
