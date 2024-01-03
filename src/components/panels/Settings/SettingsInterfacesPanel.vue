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
		<v-container v-if="activeView == 'interface_list'" class="">
			<h3>{{ $t('Panels.TrilabSettingsInterfaces.Interfaces') }}</h3>
			<v-list>
				<template v-for="(i, index) in interfaces">
					<v-subheader v-if="i.header" :key="'interfaceheader' + index" v-text="i.header"></v-subheader>
					<v-list-item :key="i.GENERAL.DEVICE" :index="index" :item="i">
						<v-list-item-avatar>
							<v-icon v-if="i.GENERAL.TYPE == 'wifi'" size="x-large"> {{ mdiWifi }}</v-icon>
							<v-icon v-else size="x-large"> {{ mdiEthernet }}</v-icon>
						</v-list-item-avatar>

						<v-list-item-content>
							<v-list-item-title v-html="i.GENERAL.DEVICE"></v-list-item-title>
							<v-list-item-subtitle>
								<small v-if="i.GENERAL.TYPE == 'wifi'">SSID: {{ i.GENERAL.CONNECTION }}<br></small>
								<div v-if="'IP4' in i">
									<small v-if="'ADDRESS' in i.IP4">{{ $t('Panels.TrilabSettingsInterfaces.IP4addresses')
									}}: {{
	i.IP4.ADDRESS.join(',') }}<br></small>
								</div>
								<div v-if="'IP6' in i">
									<small v-if="'ADDRESS' in i.IP6">{{ $t('Panels.TrilabSettingsInterfaces.IP6addresses')
									}}: {{
	i.IP6.ADDRESS.join(',') }}<br></small>
									<small>MAC: {{ i.GENERAL.HWADDR }}</small>
								</div>
							</v-list-item-subtitle>
						</v-list-item-content>

						<v-list-item-action>
							<v-btn icon @click="selectedInterface = interfaces[index]; activeView = 'connections_list';">
								<v-icon> {{ mdiCog }}</v-icon>
							</v-btn>
						</v-list-item-action>
					</v-list-item>
					<v-divider :key="'interfacedivider' + index"></v-divider>

				</template>




			</v-list>


		</v-container>

		<!---- CONNECTION (AVAILABLE CONNECTIONS TO EDIT) ----->
		<v-container v-if="activeView == 'connections_list'">
			<!--- back button --->
			<v-row class="d-flex mb-2">
				<v-col cols="12" sm="1">
					<v-btn icon @click="selectedInterface = null; activeView = 'interface_list'">
						<v-icon> {{ mdiArrowLeft }}</v-icon>
					</v-btn>
				</v-col>
				<v-col>
					<v-btn block @click="listWifi()" v-if="selectedInterface.GENERAL.TYPE == 'wifi'"> <v-icon class="mr-2">
							{{
								mdiWifiPlus }}</v-icon>
						{{ $t('Panels.TrilabSettingsInterfaces.connectWifi') }}
					</v-btn>
				</v-col>
				<v-col>
					<v-btn block @click="addProfile()" :loading="addProfileLoading"> <v-icon class="mr-1"> {{ mdiPlus
					}}</v-icon>
						{{ $t('Panels.TrilabSettingsInterfaces.AddProfile') }}
					</v-btn>
				</v-col>
			</v-row>

			<h3>{{ $t('Panels.TrilabSettingsInterfaces.ProfilesIn') }} {{ selectedInterface.GENERAL.DEVICE }}</h3>

			<v-list>
				<template v-for="(i, index) in selectedInterface.CONNECTIONS['AVAILABLE-CONNECTIONS']">
					<v-subheader v-if="i.header" :key="'connectionheader' + index" v-text="i.header"></v-subheader>
					<v-list-item :key="i.NAME" :index="index" :item="i">
						<!--- <v-list-item-avatar>
							<v-icon> {{ mdiCog }}</v-icon>
						</v-list-item-avatar> --->

						<v-list-item-content>
							<v-list-item-title v-html="i.NAME"></v-list-item-title>
							<v-list-item-subtitle>
								<small style="color:lime" v-if="i.ACTIVE == 'yes'">{{
									$t('Panels.TrilabSettingsInterfaces.ProfileActive')
								}}<br></small>
								<small v-if="i.ACTIVE == 'no'">{{ $t('Panels.TrilabSettingsInterfaces.ProfileInactive')
								}}<br></small>
							</v-list-item-subtitle>
						</v-list-item-content>

						<v-list-item-action>
							<v-row>
								<v-btn icon @click="selectConnection(i)">
									<v-icon> {{ mdiCog }}</v-icon>
								</v-btn>
								<v-btn icon @click="removeProfile(selectedInterface, i, i.UUID)">
									<v-icon> {{ mdiTrashCan }}</v-icon>
								</v-btn>
							</v-row>
						</v-list-item-action>
					</v-list-item>
					<v-divider :key="'connectionDivider' + index"></v-divider>

				</template>
			</v-list>

		</v-container>

		<v-container v-if="activeView == 'wifi_list'">
			<!--- back button --->
			<v-btn icon @click="activeView = 'connections_list'">
				<v-icon> {{ mdiArrowLeft }}</v-icon>
			</v-btn>
			<span>AVAILABLE WIRELESS NETWORKS</span>
			<v-list>

				<template v-for="(item, index) in wifiList">
					<!-- <v-subheader v-if="item.header" :key="item.header" v-text="item.header"></v-subheader> -->
					<v-list-item :key="item.BSSID" :index="index" :item="item">
						<v-list-item-avatar>
							<v-icon>{{ getWifiSignalIcon(item.BARS, item.SECURITY) }}</v-icon>
						</v-list-item-avatar>

						<v-list-item-content>
							<v-list-item-title v-html="item.SSID"></v-list-item-title>
							<v-list-item-subtitle>
								<small>SIGNAL: {{ item.SIGNAL }}</small><br>
								<small>BSSID: {{ item.BSSID }}</small>
								<v-container
									v-if="item.SECURITY != '--' && item.show_password_container == true && item.connecting == false">
									<v-text-field v-model="item.user_selected_password" label="Password"
										@input="$forceUpdate()"></v-text-field>
									<v-btn @click="connectWifi(item)" :disabled="item.user_selected_password == ''"
										color="success">Connect</v-btn>
								</v-container>
								<v-container v-if="item.connecting">
									<p>Connection in progress...</p>
									<v-progress-linear color="white" indeterminate></v-progress-linear>
								</v-container>

							</v-list-item-subtitle>
						</v-list-item-content>

						<v-list-item-action>
							<v-btn icon @click="SlideOrConnect(item)">
								<v-icon>{{ mdiChevronRight }}</v-icon>
							</v-btn>
						</v-list-item-action>
					</v-list-item>
				</template>

			</v-list>



		</v-container>



		<v-tabs v-if="activeView == 'connection_settings'" v-model="activeTab">
			<v-tab v-for="(tab, index) of visibleTabTitles" :key="index" :href="'#' + tab.name" style="width: 200px">
				<v-icon left></v-icon>
				<span class="text-truncate">{{ tab.title }}</span>
			</v-tab>
		</v-tabs>




		<v-container v-if="activeView == 'connection_settings'" style="position:relative">
			<!--- BACK BUTTON --->
			<h3>{{ selectedConnection.details.connection.id }} <small
					style="display:block; position:absolute; top:10px; right:10px;">interface: {{
						selectedInterface.GENERAL.DEVICE }}</small>
			</h3>

			<v-container v-if="activeTab == 'general'">
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
					<v-container v-for="(ip, index) in IPv4DNSList" :key="index" class="d-flex px-0 mx-0">
						<v-text-field v-model="IPv4DNSList[index]" label="DNS" :rules="[rules.IPv4]">
							<template v-if="index != 0" #append>
								<v-btn icon @click="() => { IPv4DNSList.splice(index, 1); }">
									<v-icon>{{ mdiTrashCan }}</v-icon>
								</v-btn>
							</template>
						</v-text-field>
					</v-container>
					<v-btn icon @click="IPv4DNSList.push('')">
						<v-icon> {{ mdiPlus }}</v-icon>
					</v-btn>

				</v-container>
			</v-container>

			<v-container v-if="activeTab == 'ipv6'">

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
					<v-container v-for="(ip, index) in IPv6DNSList" :key="index">
						<v-text-field v-model="IPv6DNSList[index]" label="DNS" :rules="[rules.IPv6]"></v-text-field>
						<!--- remove btn --->
						<v-btn icon @click="IPv6DNSList.splice(index, 1);">
							<v-icon> {{ mdiTrashCan }}</v-icon>
						</v-btn>

					</v-container>
					<v-btn icon @click="IPv6DNSList.push('')">
						<v-icon> {{ mdiPlus }}</v-icon>
					</v-btn>

				</v-container>
			</v-container>


			<v-container v-if="activeTab == 'wireless'">
				<h3>Nastavení profilu {{ selectedInterface.GENERAL.DEVICE }}</h3>
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
				<v-row>
					<v-col cols="12" md="6">
						<v-btn block color="red" @click="unselectConnection()">
							<v-icon> {{ mdiClose }}</v-icon>
							Discard changes
						</v-btn>
					</v-col>
					<v-col cols="12" md="6">
						<v-btn block @click="saveChangedData()" color="success">
							<v-icon class="mr-1">mdi-content-save</v-icon>
							{{ $t('General.Save') }}
						</v-btn>
					</v-col>
				</v-row>

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
import { mdiClose, mdiEthernet, mdiWifi, mdiCog, mdiTrashCan, mdiPlus, mdiWifiPlus, mdiArrowLeft, mdiWifiStrength1, mdiWifiStrength2, mdiWifiStrength3, mdiWifiStrength4, mdiWifiStrength1Lock, mdiWifiStrength2Lock, mdiWifiStrength3Lock, mdiWifiStrength4Lock, mdiChevronRight } from '@mdi/js';
@Component
export default class SettingsInterfacesPanel extends Mixins(BaseMixin, TrilabMixin) {

	mdiWifi = mdiWifi;
	mdiEthernet = mdiEthernet;
	mdiCog = mdiCog;
	mdiTrashCan = mdiTrashCan;
	mdiPlus = mdiPlus;
	mdiWifiPlus = mdiWifiPlus;
	mdiArrowLeft = mdiArrowLeft;
	mdiWifiStrength1 = mdiWifiStrength1;
	mdiWifiStrength2 = mdiWifiStrength2;
	mdiWifiStrength3 = mdiWifiStrength3;
	mdiWifiStrength4 = mdiWifiStrength4;
	mdiWifiStrength1Lock = mdiWifiStrength1Lock;
	mdiWifiStrength2Lock = mdiWifiStrength2Lock;
	mdiWifiStrength3Lock = mdiWifiStrength3Lock;
	mdiWifiStrength4Lock = mdiWifiStrength4Lock;
	mdiChevronRight = mdiChevronRight;
	mdiClose = mdiClose;


	public wifiListLoading: boolean = false;
	public wifiList: any = [];

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


	public activeView = 'interface_list';


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


	getWifiSignalIcon(bars: string, security: string) {

		if (security == '--') {
			if (bars == '****') {
				return this.mdiWifiStrength4;
			} else if (bars == "***") {
				return this.mdiWifiStrength3;
			} else if (bars == "**") {
				return this.mdiWifiStrength2;
			} else {
				return this.mdiWifiStrength1;
			}
		} else {
			if (bars == '****') {
				return this.mdiWifiStrength4Lock;
			} else if (bars == "***") {
				return this.mdiWifiStrength3Lock;
			} else if (bars == "**") {
				return this.mdiWifiStrength2Lock;
			} else {
				return this.mdiWifiStrength1Lock;
			}
		}

		/*
		img = self._gtk.Image("wifi-signal-4", self._gtk.content_width * .1, self._gtk.content_height * .1)
			elif sig_num > -65:
		img = self._gtk.Image("wifi-signal-3", self._gtk.content_width * .1, self._gtk.content_height * .1)
			elif sig_num > -80:
		img = self._gtk.Image("wifi-signal-2", self._gtk.content_width * .1, self._gtk.content_height * .1)
			else:
		img = self._gtk.Image("wifi-signal-1", self._gtk.content_width * .1, self._gtk.content_height * .1)
		*/
	}

	selectConnection(connection: any) {
		this.selectedConnection = connection;
		this.selectedConnectionCopy = JSON.parse(JSON.stringify(connection));
		/// add values to IPv4DNSList and IPv6DNSList
		this.IPv4DNSList = this.selectedConnectionCopy?.details.ipv4?.dns.split(',').map((value: string) => value.trim());
		this.IPv6DNSList = this.selectedConnectionCopy?.details.ipv6?.dns.split(',').map((value: string) => value.trim());
		console.log("SELECTED CONNECTION");
		console.log(this.selectedConnectionCopy);
		this.activeView = 'connection_settings';
	}
	unselectConnection() {
		this.IPv4DNSList = [];
		this.IPv6DNSList = [];
		this.activeView = 'connections_list';
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
	/// watch change of interfaces deep
	@Watch('$store.state.trilab.interfaces', { deep: true })
	onInterfacesChanged() {
		/// we have to watch for the value changes and then only send which were changed, so we need to do copy of the object
		/// reload the connections if the selected interface is not null
		if (this.selectedInterface != null) {
			this.selectedInterface = this.$store.state.trilab.interfaces.find((i: any) => i.GENERAL.DEVICE == this.selectedInterfaceCopy.GENERAL.DEVICE);
		}
	}


	listWifi() {
		this.activeView = 'wifi_list';
		this.reloadWifies();
	}

	SlideOrConnect(item: any) {
		/// show the container only if the wifi is with password
		console.log("slide or connect");
		if (item.SECURITY != '--') {
			/// use Vue.set
			/// https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
			/// set the show_password_container to true
			item.show_password_container = !item.show_password_container;
			this.$forceUpdate();  // Notice we have to use a $ here

			console.log("connect wifi with password")
			console.log(item);
		} else {
			this.connectWifi(item);
			console.log("connect wifi without password")
		}
	}

	async connectWifi(item: any) {
		item.connecting = true;
		this.$forceUpdate();
		let password = item.user_selected_password;
		let body: any = {
			ifname: this.selectedInterface.GENERAL.DEVICE,
			bssid: item.BSSID
		}
		if (item.SSID != "--") {
			body['ssid'] = item.SSID;
		}

		if (item.SECURITY != '--') {
			body['password'] = password;
		}


		let response = await fetch(this.$store.getters['trilab/trilabPrefix'] + '/network-manager/connect-wifi', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json'
			}
		});




		if (response.status == 200) {
			await this.$store.dispatch('trilab/getInterfaces');
			item.connecting = false;
			this.$forceUpdate();
			this.activeView = 'connections_list';
			/// toast success message
			this.$toast.success("Connected to: " + item.SSID);
		}
	}


	async reloadWifies() {
		this.wifiListLoading = true;
		/*rsp = self._screen.tpcclient.send_request("network/wifi/list")
		networks = rsp["networks"]
	
		def key_func(e):
		v = float(e['signal'].split(' ')[0])
		return v
	
		networks.sort(key = key_func, reverse = True)
	
		for child in self.network_box.get_children():
			self.network_box.remove(child)
	
		for network in networks:
			logging.info(f"Adding network {network}")
		network_box = Gtk.Box(orientation = Gtk.Orientation.HORIZONTAL, spacing = 5)
		network_box.get_style_context().add_class("frame-item")
		network_box.set_hexpand(True)
		network_box.set_vexpand(False)
	
		sig_num = float(network['signal'].split(' ')[0])
		logging.info(f"signal numeric: {sig_num}")
	
		if sig_num > -40:
			img = self._gtk.Image("wifi-signal-4", self._gtk.content_width * .1, self._gtk.content_height * .1)
			elif sig_num > -65:
		img = self._gtk.Image("wifi-signal-3", self._gtk.content_width * .1, self._gtk.content_height * .1)
			elif sig_num > -80:
		img = self._gtk.Image("wifi-signal-2", self._gtk.content_width * .1, self._gtk.content_height * .1)
			else:
		img = self._gtk.Image("wifi-signal-1", self._gtk.content_width * .1, self._gtk.content_height * .1)*/

		let responselist = await fetch(this.$store.getters['trilab/trilabPrefix'] + '/network-manager/list-networks', {
			method: 'GET',
		});
		if (responselist.status != 200) {
			this.$toast.error("Error while loading wifi networks");
			this.wifiListLoading = false;
			return;
		}

		try {
			var responseData = await responselist.json();
		} catch (e) {
			this.$toast.error("Error - bad response from printer");
			this.wifiListLoading = false;
			return;
		}
		/// if not connections in responseData then show toast error
		if (!responseData['connections']) {
			this.$toast.error("Error - bad response from printer - no connections");
			this.wifiListLoading = false;
			return;
		}

		this.wifiList = responseData['connections'];

		///foreach wifiList add 'show_password_container'
		for (let i = 0; i < this.wifiList.length; i++) {
			this.wifiList[i].show_password_container = false;
			this.wifiList[i].user_selected_password = '';
			this.wifiList[i].connecting = false;
		}


		console.log(this.wifiList);
		this.wifiListLoading = false;


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
		let urlname = 'ethernet';
		let conn_name = "New-Profile";
		if (isWifi) {
			urlname = 'wifi';
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
		this.addProfileLoading = true;
		fetch(this.$store.getters['trilab/trilabPrefix'] + '/network-manager/add-connection/' + urlname + '/' + encodeURIComponent(conn_name), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(new_conn)
		}).then(async function (response) {
			console.log("RESPONSE:");
			console.log(response);
			if (response.status == 200) {
				await thisRef.$store.dispatch('trilab/loadInterfaces');
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
			method: 'POST'
		}).then(async function (response) {
			if (response.status == 200) {
				await thisRef.$store.dispatch('trilab/loadInterfaces');
				thisRef.disabledProfilesBtns = false;
				thisRef.removeProfileBtnLoading = false;
			} else {
				console.log("ERROR");
				console.log(response);
				thisRef.$toast.error("Error while removing profile");
			}
		}).catch(function (error) {
			console.log(error);
			thisRef.disabledProfilesBtns = false;
			thisRef.removeProfileBtnLoading = false;
			thisRef.$toast.error("Error while removing profile");
		});
		this.selectedConnectionCopy = null;
		this.selectedConnection = null;
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
