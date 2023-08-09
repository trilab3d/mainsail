<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('panel.settingsLight.caption') }}
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card-text>
			<div class="text-caption">{{ $t('panel.settingsLight.timeout') }}</div>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="6">
					<v-switch v-model="timeoutEnabled" :label="$t('panel.settingsLight.enable')" hide-details ></v-switch>
				</v-col>
				<v-col cols="12" sm="6">
					<v-text-field
					 v-model="timeoutValue" type="number" step="any" min="1"
						:label="$t('panel.settingsLight.timeoutTextFieldHint', ['s'])" hide-details></v-text-field>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12">
					<div class="text-caption">{{ $t('panel.settingsLight.brightness') }} %</div>
					<v-slider v-model="brightness" prepend-icon="mdi-lightbulb" @change="changeBrightness()"></v-slider>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import { mapState, mapGetters } from 'vuex'
import store from '@/store'
import { Mixins } from 'vue-property-decorator';
import TrilabMixin from '@/components/mixins/trilab';

export default class SettingsLightPanel extends Mixins(TrilabMixin) {


	//get connected() { return this.$store.state.trilab.connected; }
	get brightness() { return this.$store.state.trilab.settings.light_data.brightness; }
	set brightness(value) { this.$store.commit('trilab/assignSetting', { light_data: { "brightness": value } }) }

	get timeoutEnabled() { return this.$store.state.trilab.settings.light_data.timeout_enable; }
	set timeoutEnabled(value) { this.$store.commit('trilab/assignSetting', { light_data: { "timeout_enable": value } }); }

	get timeoutValue() { return this.$store.state.trilab.settings.light_data.timeout; }
	set timeoutValue(value) { if (!isNaN(value)) { this.$store.commit('trilab/assignSetting', { light_data: { "timeout": parseInt(value) } }) } }
}
</script>
