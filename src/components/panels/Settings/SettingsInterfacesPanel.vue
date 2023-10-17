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
		<v-container v-if="selectedInterface != null && selectedConnectionCopy == null">
			<!--- back button --->
			<v-row class="d-flex">
				<v-col>
					<v-btn icon @click="selectedInterface = null">
						<v-icon> {{ mdiArrowLeft }}</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-btn v-if="selectedInterface.GENERAL.TYPE == 'wifi'"> <v-icon class="mr-2"> {{ mdiWifiPlus }}</v-icon>
						CONNECT WIFI
					</v-btn>
				</v-col>
				<v-col>
					<v-btn @click="addProfile()" :loading="addProfileLoading"> <v-icon class="mr-1"> {{ mdiPlus }}</v-icon>
						Add profile
					</v-btn>
				</v-col>
			</v-row>

			<h3>Profiles in {{ selectedInterface.GENERAL.DEVICE }}</h3>
			<v-row v-for="(i, index) in selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS']" :key="index"
				class="interface mb-2">
				<v-col>{{ selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index].NAME }} <span
						v-if="selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index].ACTIVE == 'yes'">AKTIVNÍ</span></v-col>
				<v-col>
					<v-btn icon @click="selectConnection(selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index])">
						<v-icon> {{ mdiCog }}</v-icon>
					</v-btn>
					<v-btn icon
						@click="removeProfile(selectedInterface, selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index], selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS'][index].UUID)">
						<v-icon> {{ mdiTrashCan }}</v-icon>
					</v-btn>

				</v-col>
			</v-row>


		</v-container>


		<v-tabs v-if="selectedConnectionCopy != null" v-model="activeTab">
			<v-tab v-for="(tab, index) of visibleTabTitles" :key="index" :href="'#' + tab.name" style="width: 200px">
				<v-icon left></v-icon>
				<span class="text-truncate">{{ tab.title }}</span>
			</v-tab>
		</v-tabs>




		<v-container v-if="selectedConnectionCopy != null">
			<!--- BACK BUTTON --->
			<v-btn @click="unselectConnection()">
				<v-icon> {{ mdiArrowLeft }}</v-icon>
				Discard
			</v-btn>
			<v-container v-if="activeTab == 'general'">
				<h3>Nastavení rozhraní {{ selectedInterface.GENERAL.DEVICE }}</h3>
				<v-text-field v-model="selectedConnectionCopy.details.connection.id" label="Profile name"></v-text-field>
				<!--- switch for connect automatically from selectedConnectionCopy.details.connection.autoconnect --->
				<v-switch v-model="autoconnectValue" label="Connect automatically"></v-switch>

				<v-text-field v-if="selectedInterface.GENERAL.TYPE == 'wifi'"
					v-model="selectedConnectionCopy.details.wireless['cloned-mac-address']"
					label="Cloned MAC address"></v-text-field>

				<v-text-field v-if="selectedInterface.GENERAL.TYPE != 'wifi'"
					v-model="selectedConnectionCopy.details.ethernet['cloned-mac-address']" label="Cloned MAC address"
					:rules="[rules.mac]"></v-text-field>
			</v-container>

			<v-container v-if="activeTab == 'ipv4'">
				<h3>Nastavení rozhraní {{ selectedInterface.GENERAL.DEVICE }}</h3>

				<v-select v-model="selectedConnectionCopy.details.ipv4.method" item-value="value" item-text="label"
					:items="ipv4Methods" label="IPv4 Method"></v-select>

				<v-text-field
					v-if="selectedConnectionCopy.details.ipv4.method == 'manual' || selectedConnectionCopy.details.ipv4.method == 'shared'"
					v-model="selectedConnectionCopy.details.ipv4.addresses" label="IP" :rules="[rules.IPv4]"></v-text-field>
				<v-text-field
					v-if="selectedConnectionCopy.details.ipv4.method == 'manual' || selectedConnectionCopy.details.ipv4.method == 'shared'"
					v-model="selectedConnectionCopy.details.ipv4.gateway" label="Gateway"
					:rules="[rules.IPv4]"></v-text-field>

				<v-container class="mx-0 px-0 px-0 py-0" v-if="selectedConnectionCopy.details.ipv4.method == 'manual' || selectedConnectionCopy.details.ipv4.method
					== 'shared' || selectedConnectionCopy.details.ipv4.method == 'auto'">
					<v-text-field v-for="(ip, index) in IPv4DNSList" v-model="IPv4DNSList[index]" label="DNS"
						:rules="[rules.IPv4]" :key="index"></v-text-field>
					<v-btn icon @click="IPv4DNSList.push('')">
						<v-icon> {{ mdiPlus }}</v-icon>
					</v-btn>

				</v-container>
			</v-container>

			<v-container v-if="activeTab == 'ipv6'">
				<h3>Nastavení rozhraní {{ selectedInterface.GENERAL.DEVICE }}</h3>

				<v-select v-model="selectedConnectionCopy.details.ipv6.method" item-value="value" item-text="label"
					:items="ipv4Methods" label="IPv6 Method"></v-select>

				<v-text-field
					v-if="selectedConnectionCopy.details.ipv6.method == 'manual' || selectedConnectionCopy.details.ipv6.method == 'shared'"
					v-model="selectedConnectionCopy.details.ipv6.addresses" label="IP" :rules="[rules.IPv6]"></v-text-field>

				<v-text-field
					v-if="selectedConnectionCopy.details.ipv6.method == 'manual' || selectedConnectionCopy.details.ipv6.method == 'shared'"
					v-model="selectedConnectionCopy.details.ipv6.gateway" label="Gateway"
					:rules="[rules.IPv6]"></v-text-field>

				<v-container class="mx-0 px-0 px-0 py-0"
					v-if="selectedConnectionCopy.details.ipv6.method == 'manual' || selectedConnectionCopy.details.ipv6.method == 'shared' || selectedConnectionCopy.details.ipv6.method == 'auto'">
					<v-text-field v-for="(ip, index) in IPv6DNSList" v-model="IPv6DNSList[index]" :key="index" label="DNS"
						:rules="[rules.IPv6]"></v-text-field>
					<!--- a button to add a value to the list --->
					<v-btn icon @click="IPv6DNSList.push('')">
						<v-icon> {{ mdiPlus }}</v-icon>
					</v-btn>
				</v-container>
			</v-container>


			<v-container v-if="activeTab == 'wireless'">
				<h3>Nastavení rozhraní {{ selectedInterface.GENERAL.DEVICE }}</h3>
				<!---             wireless_mode_label = Gtk.Label(label="IPv6 Method:")  --->

				<v-select v-model="selectedConnectionCopy.details['wireless'].mode" item-value="value" item-text="label"
					:items="wirelessModes" label="Wireless mode"></v-select>

				<v-text-field v-model="selectedConnectionCopy.details['wireless'].ssid" label="SSID"></v-text-field>

				<!--- security methods --->
				<v-select v-model="selectedConnectionCopy.details['wireless-security']['key-mgmt']" item-value="value"
					item-text="label" :items="securityModes" label="Security mode"></v-select>

				<!--- password --->
				<v-text-field v-if="selectedConnectionCopy.details['wireless-security']['key-mgmt'] == 'wpa-psk'"
					v-model="selectedConnectionCopy.details['wireless-security'].psk" label="Password"></v-text-field>
				<span v-if="selectedConnectionCopy.details['wireless-security']['key-mgmt'] != 'wpa-psk'">--- NOT YET
					IMPLEMENTED ---</span>




			</v-container>


			<v-container class="d-flex align-center justify-center">

				<v-btn @click="saveChangedData()" color="success">
					<v-icon class="mr-1">mdi-content-save</v-icon>
					{{ $t('General.Save') }}
				</v-btn>
			</v-container>


		</v-container>


	</v-card>
</template>

<script lang="ts">
'use strict'

import { Component, Mixins } from 'vue-property-decorator'
import { Watch } from 'vue-property-decorator'
import BaseMixin from '../../mixins/base'
import TrilabMixin from '../../mixins/trilab'
import { mdiEthernet, mdiWifi, mdiCog, mdiTrashCan, mdiPlus, mdiWifiPlus, mdiArrowLeft } from '@mdi/js';
@Component
export default class SettingsInterfacesPanel extends Mixins(BaseMixin, TrilabMixin) {

	mdiWifi = mdiWifi;
	mdiEthernet = mdiEthernet;
	mdiCog = mdiCog;
	mdiTrashCan = mdiTrashCan;
	mdiPlus = mdiPlus;
	mdiWifiPlus = mdiWifiPlus;
	mdiArrowLeft = mdiArrowLeft;

	get IPv4Dns() {
		/// trim all values 
		return this.selectedConnectionCopy?.details.ipv4?.dns.split(',').map((value: string) => value.trim());
	}
	get IPv6Dns() {
		/// trim all values
		return this.selectedConnectionCopy?.details.ipv6?.dns.split(',').map((value: string) => value.trim());
	}

	public IPv4DNSList: any = [];
	public IPv6DNSList: any = [];

	public selectedInterface: any = null;
	public selectedInterfaceCopy: any = null;

	public selectedConnection: any = null;
	public selectedConnectionCopy: any = null;


	public removeProfileBtnLoading = false;
	public disabledProfilesBtns = false;
	public addProfileLoading = false;

	public rules = {
		IPv4: (value: string) => {
			const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
			let isValid = ipv4Pattern.test(value);
			if (!isValid) {
				return 'Invalid. Enter in the format x.x.x.x';
			}
			return true;
		},
		IPv6: (value: string) => {
			const ipv6Pattern = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
			let isValid = ipv6Pattern.test(value);
			if (!isValid) {
				return 'Invalid IPv6 address format';
			}
			return true;
		},
		/// IPv4 validator with multiple addresses separated by comma
		IPv4Multiple: (value: string) => {
			const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}(,(\d{1,3}\.){3}\d{1,3})*$/;
			let isValid = ipv4Pattern.test(value);
			if (!isValid) {
				return 'Invalid. Enter in the format x.x.x.x, x.x.x.x';
			}
			return true;
		},
		IPv6Multiple: (value: string) => {
			const ipv6Pattern = /^[0-9a-fA-F:]+(,[0-9a-fA-F:]+)*$/;
			let isValid = ipv6Pattern.test(value);
			if (!isValid) {
				return 'Invalid IPv6 address format';
			}
			return true;
		},
		mac: (value: string) => {
			const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
			let isValid = macPattern.test(value);
			if (!isValid) {
				return 'Invalid MAC address format';
			}
			return true;
		}



	};



	selectConnection(connection: any) {
		this.selectedConnection = connection;
		this.selectedConnectionCopy = JSON.parse(JSON.stringify(connection));
		/// add values to IPv4DNSList and IPv6DNSList
		this.IPv4DNSList = this.selectedConnectionCopy?.details.ipv4?.dns.split(',').map((value: string) => value.trim());
		this.IPv6DNSList = this.selectedConnectionCopy?.details.ipv6?.dns.split(',').map((value: string) => value.trim());
		console.log("SELECTED CONNECTION");
		console.log(this.selectedConnectionCopy);
	}
	unselectConnection() {
		this.IPv4DNSList = [];
		this.IPv6DNSList = [];
		this.selectedConnection = null;
		this.selectedConnectionCopy = null;
	}

	get ipv4Methods() {
		return [{ label: "Auto (DHCP)", value: "auto" },
		{ label: "Manual", value: "manual" },
		{ label: "Link-local Only", value: "link-local" },
		{ label: "Shared", value: "shared" },
		{ label: "Disabled", value: "disabled" },
		]
	}

	get wirelessModes() {
		return [
			{ label: "Client", value: "infrastructure" },
			{ label: "Mesh", value: "mesh" },
			{ label: "Ad-hoc", value: "adhoc" },
			{ label: "AP", value: "ap" },
		]
	}
	get securityModes() {
		return [
			{ label: "None", value: "none" },
			{ label: "WEP", value: "ieee8021x" },
			{ label: "WPA-PSK", value: "wpa-psk" },
			{ label: "SAE", value: "sae" },
			{ label: "OWE", value: "owe" },
			{ label: "WPA-Enterprise", value: "wpa-eap" },
			{ label: "WPA3-Enterprise Suite B", value: "wpa-eap-suite-b-192" },
		]
	}

	get autoconnectValue() {
		return this.selectedConnectionCopy?.details.connection.autoconnect == 'yes' ? true : false;
	}
	set autoconnectValue(value: boolean) {
		this.selectedConnectionCopy.details.connection.autoconnect = value ? 'yes' : 'no';
	}

	get interfaces() {
		/// filter interfaces that have general.device == "lo"
		return this.$store.state.trilab.interfaces.filter((i: any) => i.GENERAL.DEVICE != "lo") ?? [];
	}


	saveChangedData() {
		/// set the copy model values but skip empty values and trimmed empty values
		this.selectedConnectionCopy.details.ipv4.dns = this.IPv4DNSList.filter((value: string) => value.trim() != '').join(',') ?? '';
		this.selectedConnectionCopy.details.ipv6.dns = this.IPv6DNSList.filter((value: string) => value.trim() != '').join(',') ?? '';


		const differences = this.findDataDifferences(this.selectedConnection.details, this.selectedConnectionCopy.details);

		///translate key table for trilab api
		const translateTable = {};

		console.log(differences);
		/*fetch(this.$store.getters['trilab/trilabPrefix'] + 'network-manager/modify-connection/' + this.selectedConnectionCopy.details.connection.id, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(differences)
		}).then((response) => {
			if (response.status == 200) {
				this.$store.dispatch('trilab/getInterfaces');
			}
		});*/
	}


	findDataDifferences(obj1: any, obj2: any, parentKey = "", diffObject = {}) {
		const differences: any = diffObject;

		for (const key in obj1) {
			const currentKey = parentKey ? `${parentKey}.${key}` : key;

			if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
				const nestedDifferences = this.findDataDifferences(obj1[key], obj2[key], currentKey, diffObject);
				//if (Object.keys(nestedDifferences).length > 0) {
				//	differences[key] = nestedDifferences;
				//}
			} else if (obj1[key] !== obj2[key]) {
				differences[currentKey] = obj2[key];
			}
		}

		return differences;
	}



	@Watch('selectedInterface')
	onSelectedInterfaceChanged() {
		/// we have to watch for the value changes and then only send which were changed, so we need to do copy of the object
		this.selectedInterfaceCopy = JSON.parse(JSON.stringify(this.selectedInterface));
		console.log("CHANGED INTERFACE");
		console.log(this.selectedInterface);
		console.log(this.selectedInterfaceCopy);
	}


	async addProfile() {
		const isWifi = this.isWirelessInterface;
		let new_conn = {};
		let conn_name = "New-Profile";
		if (isWifi) {
			new_conn = {
				"connection.interface-name": this.selectedInterface['GENERAL']['DEVICE'],
				"802-11-wireless.band": "bg",
				"802-11-wireless.channel": "3",
				"802-11-wireless-security.key-mgmt": "wpa-psk",
				"802-11-wireless-security.psk": "12345678",
				"ssid": "Printer",
				"ipv4.method": "manual",
				"ipv4.addresses": "10.0.0.5/8",
				"ipv6.addr-gen-mode": "0",
				"autoconnect": "yes",
				"connection.autoconnect-priority": "0"
			}
		} else {
			new_conn = {
				"connection.interface-name": this.selectedInterface['GENERAL']['DEVICE'],
				"autoconnect": "yes",
				"connection.autoconnect-priority": "0",
				"connection.autoconnect-retries": "3",
				"ipv4.method": "auto",
				"ipv4.dhcp-timeout": "10",
				"ipv4.may-fail": "false",
				"ipv6.addr-gen-mode": "0"
			}
		}
		var thisRef = this;
		this.addProfileLoading =  true;
		fetch(this.$store.getters['trilab/trilabPrefix'] + '/network-manager/add-connection/' + this.selectedInterface['GENERAL']['DEVICE'] + '/' + encodeURIComponent(conn_name), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(new_conn)
		}).then(async function (response) {
			if (response.status == 200) {
				await thisRef.$store.dispatch('trilab/getInterfaces');
				thisRef.addProfileLoading = false;
				thisRef.disabledProfilesBtns = false;
				thisRef.removeProfileBtnLoading = false;
			} else {
				console.log("ERROR");
				console.log(response);
			}
		}).catch(function (error) {
			console.log(error);
			thisRef.disabledProfilesBtns = false;
			thisRef.removeProfileBtnLoading = false;
			thisRef.addProfileLoading = false;
		});

	}

	async removeProfile(interfaceObj: any, index: any, uuid: string) {
		/// remove profile from interface
		// network-manager/delete-connection/{connection['id']
		var thisRef = this;
		fetch(this.$store.getters['trilab/trilabPrefix'] + '/network-manager/delete-connection/' + uuid, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
		}).then(async function (response) {
			if (response.status == 200) {
				await thisRef.$store.dispatch('trilab/getInterfaces');
				thisRef.disabledProfilesBtns = false;
				thisRef.removeProfileBtnLoading = false;
			} else {
				console.log("ERROR");
				console.log(response);
			}
		}).catch(function (error) {
			console.log(error);
			thisRef.disabledProfilesBtns = false;
			thisRef.removeProfileBtnLoading = false;
		});
		this.selectedConnectionCopy = null;
		this.selectedInterface = null;
	}

	get isWirelessInterface() {
		return this.selectedInterface?.GENERAL.TYPE == "wifi" ?? false;
	}

	get visibleTabTitles() {
		return this.tabTitles.filter((tab: any) => {
			if (tab.visible == undefined) {
				return true;
			}
			return tab.visible();
		});
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
		{
			title: "Wireless",
			name: "wireless",
			visible: () => this.selectedInterface?.GENERAL.TYPE == "wifi" ?? false,
		}
	];



}
</script>
