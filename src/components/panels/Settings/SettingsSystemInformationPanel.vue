<style scoped>
td {
	color: black;
}

.theme--dark td {
	color: white;
}
</style>
<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('panel.settingsSystemInformation.caption') }}
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card-text>
			<div class="text-caption mt-3">
				<h3><b>{{ $t('panel.settingsSystemInformation.hardware') }}</b></h3>
			</div>
			<table>
				<tr>
					<td>{{ $t('panel.settingsSystemInformation.factoryDeviceName') }}: </td>
					<td>{{ this.settings.factory_device_name }}</td>
				</tr>
				<tr>
					<td>{{ $t('panel.settingsSystemInformation.serialNumber') }}: </td>
					<td>{{ this.settings.serial_number }}</td>
				</tr>
			</table>
			<v-spacer></v-spacer>
			<div class="text-caption mt-3">
				<h3><b>{{ $t('panel.settingsSystemInformation.software') }}</b></h3>
			</div>
			<table>
				<tr>
					<td>{{ $t('panel.settingsSystemInformation.controllerVersion') }}: </td>
					<td>{{ duetVersion }} (<a href="https://github.com/trilab3d/PrinterController/wiki/Changelog">{{
						$t('panel.settingsSystemInformation.changelog')
					}}</a>)</td>
				</tr>
				<tr>
					<td>{{ $t('panel.settingsSystemInformation.duetVersion') }}: </td>
					<td>{{ rrfVersion }}</td>
				</tr>
				<tr>
					<td>{{ $t('panel.settingsSystemInformation.trilabDWCversion') }}: </td>
					<td>3.5.trilab1.3 <span v-if="serviceView">( 14.06.2023 4:00:30 AM)</span></td>
				</tr>
			</table>
			<p v-html="$t('panel.settingsSystemInformation.licensedUnder')"></p>
			<v-switch :label="$t('panel.settingsSystemInformation.enableAutoUpdates')" hide-details
				v-model="automatic_check_update"></v-switch>
			<v-btn block color="primary" class="mt-3" prepend-icon="head-sync" @click="checkUpdateBtnClick()">
				Check for updates
			</v-btn>


			<v-btn color="primary" block dark :loading="isSelecting" @click="handleFileImport" class="mt-3">
				Upload
			</v-btn>

			<input ref="fileInputUpdate" class="d-none" type="file" @change="onFileSelected">
		</v-card-text>
		<confirm-dialog :title="$t('panel.settingsSystemInformation.updateFound.title')"
			:prompt="$t('panel.settingsSystemInformation.updateFound.text')" :shown.sync="updatesAvailable"
			@confirmed="updateStart()"></confirm-dialog>
		<info-dialog :title="$t('panel.settingsSystemInformation.updateFound.title')" :prompt="getChangelog"
			:shown="getChangelog != ''" @confirmed="confirmReadChangelog()"></info-dialog>
		<trilab-update-dialog :file="selectedFile"></trilab-update-dialog>

	</v-card>
</template>

<script>
'use strict'
/// This component checks trilab updates etc...
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
//import axios from 'axios'
export default {
	data() {
		return {
			showResetConfirmation: false,
			isSelecting: false,
			file: null,
			selectedFile: null,
		}
	},
	computed: {
		...mapState('trilab', ['settings', 'pluginManager', 'updates', 'serviceView']),
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['boards', 'state']),
		...mapState('settings', ['darkTheme']),

		getChangelog() {
			return this.updates.changelog;
		},

		automatic_check_update: {
			get() { return this.settings.automatic_check_update; },
			set(value) { this.assignSetting({ "automatic_check_update": value }); }
		},
		rrfVersion() {
			if (this.boards.length > 0) {
				return this.boards[0].firmwareVersion;
			} else {
				return "N/A";
			}
		},
		duetVersion() {
			let plugins = this.pluginManager.plugins;
			for (var i = 0; i < plugins.length; i++) {
				if (plugins[i]["key"] == "trilab") {
					return plugins[i]["version"];
				}
			}
			return "NaN";
		},
		updatesAvailable() {

			if (this.updates.targets.length > 0 && this.updates.supressUpTodateMsg == false) {

				//switch (store.state.machine.model.state.status) {
				//		case MachineStatus.idle: return 1;
				//		default:
				//			return 2;
				//	}
			}
			return false;
		}
	},

	methods: {
		...mapMutations('trilab', ['assignSetting']),
		...mapActions('trilab', ['checkForUpdates', 'performUpdate', 'confirmReadChangelog']),
		async checkUpdateBtnClick() {
			await this.checkForUpdates();
			if (this.updatesAvailable == false) {
				this.$makeNotification('info', this.$t(`panel.settingsSystemInformation.updateNotFound.title`), this.$t('panel.settingsSystemInformation.updateNotFound.text'));
			} else if (this.updatesAvailable == 2) {
				this.$makeNotification('info', this.$t(`panel.settingsSystemInformation.updateFoundDialogNotIdle.title`), this.$t('panel.settingsSystemInformation.updateFoundDialogNotIdle.text'));
			}

		},
		handleFileImport() {
			this.isSelecting = true;

			// After obtaining the focus when closing the FilePicker, return the button state to normal
			window.addEventListener('focus', () => {
				this.isSelecting = false
			}, { once: true });

			// Trigger click on the FileInput
			this.$refs.fileInputUpdate.click();
		},
		updateStart() {
			this.performUpdate();
		},
		changelogConfirm() {
			this.confirmReadChangelog();
		},
		onFileSelected() {
			/// upload file if the file was selected
			/// read file from refs
			var realFile = this.$refs.fileInputUpdate.files[0];
			this.file = realFile;
			if (this.file === null) {
				console.log('No file selected');
				return false;
			}
			this.file = realFile;
			this.selectedFile = realFile;
		}

	}
}
</script>
