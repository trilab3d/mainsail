<template>
	<v-card elevation="25">
		<v-card-title class="pb-0">
			{{ $t('Panels.settingsTrilabLight.caption') }}
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card-text>
			<div class="text-caption">{{ $t('Panels.settingsTrilabLight.timeout') }}</div>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="6">
					<v-switch v-model="timeoutEnabled" :label="$t('Panels.settingsTrilabLight.enable')"
						hide-details></v-switch>
				</v-col>
				<v-col cols="12" sm="6">
					<v-text-field v-model="timeoutValue" type="number" step="any" min="1"
						:label="$t('Panels.settingsTrilabLight.timeoutTextFieldHint')" hide-details></v-text-field>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12">
					<div class="text-caption">{{ $t('Panels.settingsTrilabLight.brightness') }} %</div>
					<v-slider
					 v-model="brightness" prepend-icon="mdi-lightbulb"
						@change="setBrightnessImmediate()"></v-slider>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import { Mixins } from 'vue-property-decorator';
import TrilabMixin from '@/components/mixins/trilab';
import axios from 'axios';

export default class SettingsLightPanel extends Mixins(TrilabMixin) {


	//get connected() { return this.$store.state.trilab.connected; }
	get brightness() { return this.$store.state.trilab.settings.light_data.brightness; }
	set brightness(value) { this.$store.commit('trilab/setData', { settings: { light_data: { "brightness": value } } }) }

	get timeoutEnabled() { return this.$store.state.trilab.settings.light_data.timeout_enable; }
	set timeoutEnabled(value) { this.$store.commit('trilab/setData', { settings: { light_data: { "timeout_enable": value } } }); }

	get timeoutValue() { return this.$store.state.trilab.settings.light_data.timeout; }
	set timeoutValue(value) { if (!isNaN(value)) { this.$store.commit('trilab/setData', { settings: { light_data: { "timeout": parseInt(value) } } }) } }


	setBrightnessImmediate() {
		axios.post(this.$store.getters['trilab/trilabPrefix'] + "/light/brightness", { "brightness": parseInt(this.brightness) });
	}

}
</script>
