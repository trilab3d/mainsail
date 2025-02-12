
<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('Panels.settingsTrilabWifi.caption') }}
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card-text>
			<v-autocomplete v-model="wifiCountry" :items="items" item-title="text" item-value="value"
				:label="$t('Panels.settingsTrilabWifi.country')" persistent-hint single-line></v-autocomplete>

			<v-select v-model="wifiMode" :items="wifi_mode_items" item-title="text" item-value="value"
				:label="$t('Panels.settingsTrilabWifi.mode')" persistent-hint single-line></v-select>

			<fieldset class="pr-3 pl-3 pb-3">
				<legend>Client</legend>
				<!---<select-text-input v-model="clientSSID" :items="clientSSIDList" item-title="text" item-value="value"
														label="Select" persistent-hint single-line @dropdown-rolled-down="onDropdownClicked()"></select-text-input>-->
				<v-combobox 
				v-model="clientSSID" :items="clientSSIDArray" :placeholder="$t('Panels.settingsTrilabWifi.ssid')"
					:menu-props="{
						value: autoselectMenu, closeOnClick: false,
						closeOnContentClick: false,
						disableKeys: true,
						openOnClick: false,
						maxHeight: 304
					}" @click:append="toggle" @change="autoselectMenu = false" @focusout="autoselectMenu = false">
				</v-combobox>
				<v-text-field 
				v-model="client_pw" :rules="passwordRules" type="password"
					:label="$t('Panels.settingsTrilabWifi.password')" hide-details></v-text-field>
			</fieldset>
			<fieldset class="pr-3 pl-3 pb-3 mt-3">
				<legend>{{ $t('Panels.settingsTrilabWifi.accessPoint') }}</legend>
				<v-text-field 
				v-model="wifi_ap_ssid" item-title="text" item-value="value"
					:label="$t('Panels.settingsTrilabWifi.ssid')"></v-text-field>
				<v-text-field 
				v-model="pw" :rules="passwordRules" type="password"
					:label="$t('Panels.settingsTrilabWifi.password')" hide-details></v-text-field>
				<v-text-field 
				v-model="confirmPassword" :rules="confirmPasswordRules" type="password"
					:label="$t('Panels.settingsTrilabWifi.confirmPassword')" hide-details></v-text-field>
			</fieldset>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'
import axios from 'axios';


export default {
	data() {
		return {
			autoselectMenu: false,
			pass: "",
			confPass: "",
			clientSSIDArray: ['Loading...'],
			items: [
				{ "text": "Afghanistan", "value": "af" }, { "text": "Åland Islands", "value": "ax" }, { "text": "Albania", "value": "al" }, { "text": "Algeria", "value": "dz" }, { "text": "American Samoa", "value": "as" }, { "text": "Andorra", "value": "ad" }, { "text": "Angola", "value": "ao" }, { "text": "Anguilla", "value": "ai" }, { "text": "Antarctica", "value": "aq" }, { "text": "Antigua and Barbuda", "value": "ag" }, { "text": "Argentina", "value": "ar" }, { "text": "Armenia", "value": "am" }, { "text": "Aruba", "value": "aw" }, { "text": "Australia", "value": "au" }, { "text": "Austria", "value": "at" }, { "text": "Azerbaijan", "value": "az" }, { "text": "Bahamas", "value": "bs" }, { "text": "Bahrain", "value": "bh" }, { "text": "Bangladesh", "value": "bd" }, { "text": "Barbados", "value": "bb" }, { "text": "Belarus", "value": "by" }, { "text": "Belgium", "value": "be" }, { "text": "Belize", "value": "bz" }, { "text": "Benin", "value": "bj" }, { "text": "Bermuda", "value": "bm" }, { "text": "Bhutan", "value": "bt" }, { "text": "Bolivia, Plurinational State of", "value": "bo" }, { "text": "Bonaire, Sint Eustatius and Saba", "value": "bq" }, { "text": "Bosnia and Herzegovina", "value": "ba" }, { "text": "Botswana", "value": "bw" }, { "text": "Bouvet Island", "value": "bv" }, { "text": "Brazil", "value": "br" }, { "text": "British Indian Ocean Territory", "value": "io" }, { "text": "Brunei Darussalam", "value": "bn" }, { "text": "Bulgaria", "value": "bg" }, { "text": "Burkina Faso", "value": "bf" }, { "text": "Burundi", "value": "bi" }, { "text": "Cambodia", "value": "kh" }, { "text": "Cameroon", "value": "cm" }, { "text": "Canada", "value": "ca" }, { "text": "Cape Verde", "value": "cv" }, { "text": "Cayman Islands", "value": "ky" }, { "text": "Central African Republic", "value": "cf" }, { "text": "Chad", "value": "td" }, { "text": "Chile", "value": "cl" }, { "text": "China", "value": "cn" }, { "text": "Christmas Island", "value": "cx" }, { "text": "Cocos (Keeling) Islands", "value": "cc" }, { "text": "Colombia", "value": "co" }, { "text": "Comoros", "value": "km" }, { "text": "Congo", "value": "cg" }, { "text": "Congo, the Democratic Republic of the", "value": "cd" }, { "text": "Cook Islands", "value": "ck" }, { "text": "Costa Rica", "value": "cr" }, { "text": "Côte d'Ivoire", "value": "ci" }, { "text": "Croatia", "value": "hr" }, { "text": "Cuba", "value": "cu" }, { "text": "Curaçao", "value": "cw" }, { "text": "Cyprus", "value": "cy" }, { "text": "Czech Republic", "value": "cz" }, { "text": "Denmark", "value": "dk" }, { "text": "Djibouti", "value": "dj" }, { "text": "Dominica", "value": "dm" }, { "text": "Dominican Republic", "value": "do" }, { "text": "Ecuador", "value": "ec" }, { "text": "Egypt", "value": "eg" }, { "text": "El Salvador", "value": "sv" }, { "text": "Equatorial Guinea", "value": "gq" }, { "text": "Eritrea", "value": "er" }, { "text": "Estonia", "value": "ee" }, { "text": "Ethiopia", "value": "et" }, { "text": "Falkland Islands (Malvinas)", "value": "fk" }, { "text": "Faroe Islands", "value": "fo" }, { "text": "Fiji", "value": "fj" }, { "text": "Finland", "value": "fi" }, { "text": "France", "value": "fr" }, { "text": "French Guiana", "value": "gf" }, { "text": "French Polynesia", "value": "pf" }, { "text": "French Southern Territories", "value": "tf" }, { "text": "Gabon", "value": "ga" }, { "text": "Gambia", "value": "gm" }, { "text": "Georgia", "value": "ge" }, { "text": "Germany", "value": "de" }, { "text": "Ghana", "value": "gh" }, { "text": "Gibraltar", "value": "gi" }, { "text": "Greece", "value": "gr" }, { "text": "Greenland", "value": "gl" }, { "text": "Grenada", "value": "gd" }, { "text": "Guadeloupe", "value": "gp" }, { "text": "Guam", "value": "gu" }, { "text": "Guatemala", "value": "gt" }, { "text": "Guernsey", "value": "gg" }, { "text": "Guinea", "value": "gn" }, { "text": "Guinea-Bissau", "value": "gw" }, { "text": "Guyana", "value": "gy" }, { "text": "Haiti", "value": "ht" }, { "text": "Heard Island and McDonald Islands", "value": "hm" }, { "text": "Holy See (Vatican City State)", "value": "va" }, { "text": "Honduras", "value": "hn" }, { "text": "Hong Kong", "value": "hk" }, { "text": "Hungary", "value": "hu" }, { "text": "Iceland", "value": "is" }, { "text": "India", "value": "in" }, { "text": "Indonesia", "value": "id" }, { "text": "Iran, Islamic Republic of", "value": "ir" }, { "text": "Iraq", "value": "iq" }, { "text": "Ireland", "value": "ie" }, { "text": "Isle of Man", "value": "im" }, { "text": "Israel", "value": "il" }, { "text": "Italy", "value": "it" }, { "text": "Jamaica", "value": "jm" }, { "text": "Japan", "value": "jp" }, { "text": "Jersey", "value": "je" }, { "text": "Jordan", "value": "jo" }, { "text": "Kazakhstan", "value": "kz" }, { "text": "Kenya", "value": "ke" }, { "text": "Kiribati", "value": "ki" }, { "text": "Korea, Democratic People's Republic of", "value": "kp" }, { "text": "Korea, Republic of", "value": "kr" }, { "text": "Kuwait", "value": "kw" }, { "text": "Kyrgyzstan", "value": "kg" }, { "text": "Lao People's Democratic Republic", "value": "la" }, { "text": "Latvia", "value": "lv" }, { "text": "Lebanon", "value": "lb" }, { "text": "Lesotho", "value": "ls" }, { "text": "Liberia", "value": "lr" }, { "text": "Libya", "value": "ly" }, { "text": "Liechtenstein", "value": "li" }, { "text": "Lithuania", "value": "lt" }, { "text": "Luxembourg", "value": "lu" }, { "text": "Macao", "value": "mo" }, { "text": "Macedonia, the former Yugoslav Republic of", "value": "mk" }, { "text": "Madagascar", "value": "mg" }, { "text": "Malawi", "value": "mw" }, { "text": "Malaysia", "value": "my" }, { "text": "Maldives", "value": "mv" }, { "text": "Mali", "value": "ml" }, { "text": "Malta", "value": "mt" }, { "text": "Marshall Islands", "value": "mh" }, { "text": "Martinique", "value": "mq" }, { "text": "Mauritania", "value": "mr" }, { "text": "Mauritius", "value": "mu" }, { "text": "Mayotte", "value": "yt" }, { "text": "Mexico", "value": "mx" }, { "text": "Micronesia, Federated States of", "value": "fm" }, { "text": "Moldova, Republic of", "value": "md" }, { "text": "Monaco", "value": "mc" }, { "text": "Mongolia", "value": "mn" }, { "text": "Montenegro", "value": "me" }, { "text": "Montserrat", "value": "ms" }, { "text": "Morocco", "value": "ma" }, { "text": "Mozambique", "value": "mz" }, { "text": "Myanmar", "value": "mm" }, { "text": "Namibia", "value": "na" }, { "text": "Nauru", "value": "nr" }, { "text": "Nepal", "value": "np" }, { "text": "Netherlands", "value": "nl" }, { "text": "New Caledonia", "value": "nc" }, { "text": "New Zealand", "value": "nz" }, { "text": "Nicaragua", "value": "ni" }, { "text": "Niger", "value": "ne" }, { "text": "Nigeria", "value": "ng" }, { "text": "Niue", "value": "nu" }, { "text": "Norfolk Island", "value": "nf" }, { "text": "Northern Mariana Islands", "value": "mp" }, { "text": "Norway", "value": "no" }, { "text": "Oman", "value": "om" }, { "text": "Pakistan", "value": "pk" }, { "text": "Palau", "value": "pw" }, { "text": "Palestinian Territory, Occupied", "value": "ps" }, { "text": "Panama", "value": "pa" }, { "text": "Papua New Guinea", "value": "pg" }, { "text": "Paraguay", "value": "py" }, { "text": "Peru", "value": "pe" }, { "text": "Philippines", "value": "ph" }, { "text": "Pitcairn", "value": "pn" }, { "text": "Poland", "value": "pl" }, { "text": "Portugal", "value": "pt" }, { "text": "Puerto Rico", "value": "pr" }, { "text": "Qatar", "value": "qa" }, { "text": "Réunion", "value": "re" }, { "text": "Romania", "value": "ro" }, { "text": "Russian Federation", "value": "ru" }, { "text": "Rwanda", "value": "rw" }, { "text": "Saint Barthélemy", "value": "bl" }, { "text": "Saint Helena, Ascension and Tristan da Cunha", "value": "sh" }, { "text": "Saint Kitts and Nevis", "value": "kn" }, { "text": "Saint Lucia", "value": "lc" }, { "text": "Saint Martin (French part)", "value": "mf" }, { "text": "Saint Pierre and Miquelon", "value": "pm" }, { "text": "Saint Vincent and the Grenadines", "value": "vc" }, { "text": "Samoa", "value": "ws" }, { "text": "San Marino", "value": "sm" }, { "text": "Sao Tome and Principe", "value": "st" }, { "text": "Saudi Arabia", "value": "sa" }, { "text": "Senegal", "value": "sn" }, { "text": "Serbia", "value": "rs" }, { "text": "Seychelles", "value": "sc" }, { "text": "Sierra Leone", "value": "sl" }, { "text": "Singapore", "value": "sg" }, { "text": "Sint Maarten (Dutch part)", "value": "sx" }, { "text": "Slovakia", "value": "sk" }, { "text": "Slovenia", "value": "si" }, { "text": "Solomon Islands", "value": "sb" }, { "text": "Somalia", "value": "so" }, { "text": "South Africa", "value": "za" }, { "text": "South Georgia and the South Sandwich Islands", "value": "gs" }, { "text": "South Sudan", "value": "ss" }, { "text": "Spain", "value": "es" }, { "text": "Sri Lanka", "value": "lk" }, { "text": "Sudan", "value": "sd" }, { "text": "Suriname", "value": "sr" }, { "text": "Svalbard and Jan Mayen", "value": "sj" }, { "text": "Swaziland", "value": "sz" }, { "text": "Sweden", "value": "se" }, { "text": "Switzerland", "value": "ch" }, { "text": "Syrian Arab Republic", "value": "sy" }, { "text": "Taiwan, Province of China", "value": "tw" }, { "text": "Tajikistan", "value": "tj" }, { "text": "Tanzania, United Republic of", "value": "tz" }, { "text": "Thailand", "value": "th" }, { "text": "Timor-Leste", "value": "tl" }, { "text": "Togo", "value": "tg" }, { "text": "Tokelau", "value": "tk" }, { "text": "Tonga", "value": "to" }, { "text": "Trinidad and Tobago", "value": "tt" }, { "text": "Tunisia", "value": "tn" }, { "text": "Turkey", "value": "tr" }, { "text": "Turkmenistan", "value": "tm" }, { "text": "Turks and Caicos Islands", "value": "tc" }, { "text": "Tuvalu", "value": "tv" }, { "text": "Uganda", "value": "ug" }, { "text": "Ukraine", "value": "ua" }, { "text": "United Arab Emirates", "value": "ae" }, { "text": "United Kingdom", "value": "gb" }, { "text": "United States", "value": "us" }, { "text": "United States Minor Outlying Islands", "value": "um" }, { "text": "Uruguay", "value": "uy" }, { "text": "Uzbekistan", "value": "uz" }, { "text": "Vanuatu", "value": "vu" }, { "text": "Venezuela, Bolivarian Republic of", "value": "ve" }, { "text": "Viet Nam", "value": "vn" }, { "text": "Virgin Islands, British", "value": "vg" }, { "text": "Virgin Islands, U.S.", "value": "vi" }, { "text": "Wallis and Futuna", "value": "wf" }, { "text": "Western Sahara", "value": "eh" }, { "text": "Yemen", "value": "ye" }, { "text": "Zambia", "value": "zm" }, { "text": "Zimbabwe", "value": "zw" }],
			wifi_mode_items: [
				{ text: 'Disabled', value: 'DISABLED' },
				{ text: 'Access Point', value: 'AP' },
				{ text: 'Station', value: 'STA' },
				{ text: 'Auto', value: 'AUTO' }

			],
		}
	},

	computed: {
		menuProps() {
			return { value: false }
		},
		clientSSID: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_sta_ssid;
			},
			set(value) {
				this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_sta_ssid" : value} } })
			}
		},
		clientSSIDList: {
			get() {
				return this.clientSSIDArray;
			},
			set(value) {
				this.clientSSIDArray = value;
			}
		},
		wifiMode: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_mode;
			},
			set(value) {
				this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_mode" : value} } })
			}
		},
		wifiCountry: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_country;
			},
			set(value) {
				this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_country" : value} } })
			}
		},
		wifi_sta_ssid: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_sta_ssid;
			},
			set(value) {
				this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_sta_ssid" : value} } })
			}
		},
		wifi_ap_ssid: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_ap_ssid;
			},
			set(value) {
				this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_ap_ssid" : value} } })
			}
		},
		client_pw: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_sta_pass;
			},
			set(value) {
				this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_sta_pass" : value} } })
			}
		},
		pw: {
			get() {
				return this.$store.state.trilab.settings.network_data.wifi_ap_pass;
			},
			set(value) {
				this.pass = value;
				if (this.confPass == value) {
					this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_ap_pass" : value} } })
				}
			}
		},
		confirmPassword: {
			get() {
				return this.confPass;
			},
			set(value) {
				this.confPass = value;
				if (this.pass == value) {
					this.$store.commit('trilab/setData', { settings:{ network_data: { "wifi_ap_pass" : value} } })
				}
			}
		},
		passwordRules() {
			return [
				v => !!v || "Password is required",
				v => (v && v.length >= 3) || "Password must be at least 3 characters long"
			];
		},
		confirmPasswordRules() {
			return [
				v => !!v || "Confirm Password is required",
				v => (v == this.pw) || "Passwords do not match"
			];
		}

	},
	methods: {
		getWifiList() {
			axios.get(this.$store.getters['trilab/trilabPrefix'] + "/network/wifi/list")
				.then(response => {
					for (var i = 0; i < response.data.list.length; i++) {
						this.clientSSIDArray.push(response.data.list[i]);
					}
				})
				.catch(error => {
					console.log(error);
				});
		},
		onDropdownClicked() {
			this.clientSSIDArray = [];
			this.getWifiList();
		},
		toggle() {
			this.getWifiList();
			this.autoselectMenu = !this.autoselectMenu
		}


	}
}
</script>
