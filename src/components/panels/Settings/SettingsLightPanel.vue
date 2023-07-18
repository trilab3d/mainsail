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
					<v-switch :label="$t('panel.settingsLight.enable')" hide-details
						v-model="timeoutEnabled"></v-switch>
				</v-col>
				<v-col cols="12" sm="6">
					<v-text-field v-model="timeoutValue" type="number" step="any" min="1"
						:label="$t('panel.settingsLight.timeoutTextFieldHint', ['s'])" hide-details></v-text-field>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
			<v-col cols="12">
				<div class="text-caption">{{ $t('panel.settingsLight.brightness') }} %</div>
				<v-slider @change="this.changeBrightness" v-model="brightness" prepend-icon="mdi-lightbulb"></v-slider>
			</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import store from '@/store'

export default {
	computed: {
		...mapState('trilab', ['settings', "isConnected"]),
		...mapGetters(['uiFrozen']),
		connected:{
			get() { return this.isConnected; },
		},
		brightness: {
			get() { return store.state.trilab.settings.light_data.brightness; },
			set(value) { store.commit("trilab/assignSetting", {light_data: {"brightness" : value}}) }

		},
		timeoutEnabled: {
			get() { return this.settings.light_data.timeout_enable; },
			set(value) { store.commit('trilab/assignSetting', { light_data: { "timeout_enable": value }}); }
		},
		timeoutValue: {
			get() { return this.settings.light_data.timeout; },
			set(value) {  if(!isNaN(value)) { store.commit('trilab/assignSetting', { light_data: { "timeout": parseInt(value) }}) } }
		}

	},
	data() {
		return {
			showResetConfirmation: false
		}
	},
	methods: {
		...mapMutations('trilab', ['assignSetting']),
		...mapActions('trilab', ['lightChangeBrightness']),
		changeBrightness(){
			if(this.connected){
				this.lightChangeBrightness();
			}
		}
	}
}
</script>
