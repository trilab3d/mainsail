<style scoped>
.interfaceWrapper> :nth-child(odd) {
	background-color: #303030;
}

.interfaceWrapper> :nth-child(even) {
	background-color: #383838;
}
</style>
<template>
	<v-card class="mx-0 px-0" flat>


		<!---- INTERFACES (LIST OF ALL INTERFACES) ----->
		<v-container v-if="selectedInterface == null" class="interfaceWrapper px-8">
			<v-row v-for="(i, index) in interfaces" :key="index" class="interface mb-2">
				<v-col cols="1">
					<v-icon v-if="i.GENERAL.TYPE == 'WIFI'" size="x-large"> {{ mdiWifi }}</v-icon>
					<v-icon v-else size="x-large"> {{ mdiEthernet }}</v-icon>
				</v-col>
				<v-col cols="6">
					<v-row>
						<v-col cols="12">
							<h3>{{ i.GENERAL.TYPE }}</h3>
						</v-col>
					</v-row>
					<v-row class="my-0">
						<v-col cols="6">
							Interface
						</v-col>
						<v-col cols="6">
							{{ i.GENERAL.DEVICE }}
						</v-col>
					</v-row>
					<v-row class="my-0" v-if="i.GENERAL.TYPE == 'wifi'">
						<v-col cols="6">
							SSID
						</v-col>
						<v-col cols="6">
							{{ i.GENERAL.CONNECTION }}
						</v-col>
					</v-row>
					<v-row class="my-0" v-if="'ADDRESS' in i.IP4">
						<v-col cols="6">
							IP
						</v-col>
						<v-col cols="6">
							<p v-for="(addr, index) in i.IP4.ADDRESS" :key="index">{{ addr }}</p>
						</v-col>
					</v-row>
					<v-row class="my-0" v-if="'ADDRESS' in i.IP6">
						<v-col cols="6">
							IPv6
						</v-col>
						<v-col cols="6">
							<p v-for="(addr, index) in i.IP6.ADDRESS" :key="index">{{ addr }}</p>
						</v-col>
					</v-row>
					<v-row class="my-0">
						<v-col cols="6">
							MAC
						</v-col>
						<v-col cols="6">
							{{ i.GENERAL.HWADDR }}
						</v-col>
					</v-row>
				</v-col>
				<v-col>
					<v-btn icon @click="selectedInterface = i">
						<v-icon> {{ mdiCog }}</v-icon>
					</v-btn>
				</v-col>
			</v-row>
		</v-container>


		<!---- CONNECTION (AVAILABLE CONNECTIONS TO EDIT) ----->
		<v-container v-if="selectedInterface != null && selectedConnection == null">
			<v-btn></v-btn>
			<h3>Profiles in {{ selectedInterface.GENERAL.DEVICE }}</h3>
			<v-row v-for="(i, index) in selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS']" :key="index"
				class="interface mb-2">
				<v-col>{{ selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index].NAME }} <span
						v-if="selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index].ACTIVE == 'yes'">AKTIVNI</span></v-col>
				<v-col>
					<v-btn icon
						@click="removeProfile(selectedInterface, selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index], selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index].UUID)">
						<v-icon> {{ mdiTrashCan }}</v-icon>
					</v-btn>
					<v-btn icon @click="selectedConnection = selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index]">
						<v-icon> {{ mdiCog }}</v-icon>
					</v-btn>
				</v-col>
			</v-row>


		</v-container>


		<v-tabs v-if="selectedConnection != null" v-model="activeTab">
			<v-tab v-for="(tab, index) of tabTitles" :key="index" :href="'#' + tab.name" style="width: 200px">
				<v-icon left></v-icon>
				<span class="text-truncate">{{ tab.title }}</span>
			</v-tab>
		</v-tabs>



		<v-container v-if="selectedConnection != null && activeTab == 'general'">
			<h3>Nastavení rozhraní {{ selectedInterface.GENERAL.DEVICE }}</h3>
			<v-text-field v-model="selectedConnection.NAME" label="Název profilu"></v-text-field>
			<v-text-field v-model="selectedInterface.IP4.ADDRESS[0]"></v-text-field>
		</v-container>

		<v-container v-if="selectedConnection != null && activeTab == 'ipv4'">
			<h3>Nastavení rozhraní {{ selectedInterface.GENERAL.DEVICE }}</h3>
			<v-text-field v-model="selectedConnection.NAME" label="Název profilu"></v-text-field>
			<v-text-field v-model="selectedInterface.IP4.ADDRESS[0]"></v-text-field>
		</v-container>

	</v-card>
</template>

<script lang="ts">
'use strict'

import { Component, Mixins } from 'vue-property-decorator'
import { Watch } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import TrilabMixin from '../../mixins/trilab'
import { mdiEthernet, mdiWifi, mdiCog, mdiTrashCan, mdiPlus, mdiWifiPlus } from '@mdi/js';
@Component
export default class SettingsInterfacesPanel extends Mixins(BaseMixin, TrilabMixin) {

	mdiWifi = mdiWifi;
	mdiEthernet = mdiEthernet;
	mdiCog = mdiCog;
	mdiTrashCan = mdiTrashCan;


	public selectedInterface: any = null;
	public selectedInterfaceCopy: any = null;

	public selectedConnection: any = null;
	get interfaces() {
		/// filter interfaces that have general.device == "lo"
		return this.$store.state.trilab.interfaces.filter((i: any) => i.GENERAL.DEVICE != "lo") ?? [];
	}

	@Watch('selectedInterface')
	onSelectedInterfaceChanged() {
		/// we have to watch for the value changes and then only send which were changed, so we need to do copy of the object
		this.selectedInterfaceCopy = JSON.parse(JSON.stringify(this.selectedInterface));
	}


	async removeProfile(interfaceObj: any, index: any, uuid: string) {
		/// remove profile from interface
		// network-manager/delete-connection/{connection['id']
		fetch(this.$store.getters['trilab/trilabPrefix'] + '/api/network-manager/delete-connection/' + uuid, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
		}).then((response) => {
			if (response.status == 200) {
				this.$store.dispatch('trilab/getInterfaces');
			}
		});
		this.selectedConnection = null;
		this.selectedInterface = null;
	}

	public activeTab = "general";
	public tabTitles = [
		{
			title: "General",
			name: "general",
		},
		{
			title: "IPv4",
			name: "ipv4",
			//icon: mdiDelta
		},
		{
			title: "IPv6",
			name: "ipv6",
			//icon: mdiPackageVariantClosed
		},
	];



}
</script>
