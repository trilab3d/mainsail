
<template>
	<v-card outlined :disabled="this.uiFrozen">
		<v-card-title class="pb-0">
			<span v-html="$t('panel.settingsRemote.caption')"></span> 
			<v-spacer></v-spacer>
			<a v-show="!uiFrozen" href="javascript:void(0)" @click="showResetConfirmation = true" v-if="false">
				<v-icon small class="mr-1">mdi-restore</v-icon> {{ $t('panel.settingsGeneral.factoryReset') }}
			</a>
		</v-card-title>

		<v-card-text>
			<v-switch :label="$t('panel.settingsRemote.enable')" hide-details
				v-model="enabledstate"></v-switch>

				<v-switch :label="$t('panel.settingsRemote.auto_off')" v-if="isEnabled"
				v-model="autooff"></v-switch>

		</v-card-text>
</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapMutations } from 'vuex'


export default {
	computed: {
		...mapState('trilab', ['settings']),
		...mapGetters(['uiFrozen']),
		...mapGetters('trilab', ['trilabPrefix']),

		isEnabled(){
			if(this.enabledstate == true){
				return true;
			}
			else{
				return false;
			}
		},
		autooff:{
			get() {
				return this.settings.remote_access.auto_off;
			},
			set(value) {
				this.assignSetting({ "remote_access" : { "auto_off": value }});
			}
		},
		enabledstate:{
			get() {
				return this.settings.remote_access;
			},
			set(value) {
				this.assignSetting({ "remote_access" : value});
			}
		},
	
	},
	data() {
		return {
		
		}
	},
	methods: {
		...mapMutations('trilab', ['assignRoot', 'assignSetting']),
	}
}
</script>
