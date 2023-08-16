
<template>
	<v-card outlined :disabled="this.uiFrozen">
		<v-card-title class="pb-0">
			<span v-html="$t('Panels.TrilabRemote.caption')"></span> 
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card-text>
			<v-switch :label="$t('Panels.TrilabRemote.enable')" hide-details
				v-model="enabledstate"></v-switch>

				<v-switch v-if="isEnabled" v-model="autooff" :label="$t('Panels.TrilabRemote.auto_off')"
				></v-switch>

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
