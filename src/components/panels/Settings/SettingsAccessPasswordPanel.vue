<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('Panels.TrilabAccessPassword.caption') }}
			<v-spacer></v-spacer>

		</v-card-title>

		<v-card-text>
			<v-switch :label="$t('Panels.TrilabAccessPassword.enablePwdControl')" hide-details
				v-model="enabledPasswordControl"></v-switch>

			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-text-field type="text" v-model="username" :readonly="!enabledPasswordControl" :label="$t('Panels.TrilabAccessPassword.username')"
						hide-details></v-text-field>
					<v-text-field :readonly="!enabledPasswordControl" :rules="passwordRules" v-model="password"
						type="password" :label="$t('Panels.TrilabAccessPassword.password')" hide-details></v-text-field>
					<v-text-field :readonly="!enabledPasswordControl || password.trim() == ''" :rules="confirmPasswordRules"
						v-model="confirmPassword" type="password" ref="confPw"
						:label="$t('Panels.TrilabAccessPassword.confirmPassword')" hide-details></v-text-field>
					<v-divider class="my-2"></v-divider>
					<v-btn block primary @click="showWarningDialog = true" :disabled="!passwordsOk">{{ $t('Trilab.SettingsAccessPasswordPanel.SaveBtn') }}</v-btn>
				</v-col>
			</v-row>
			<v-dialog v-model="showWarningDialog" max-width="400">
				<v-card>
					<v-card-title class="headline">{{ $t('Panels.TrilabAccessPassword.Warning') }}</v-card-title>
					<v-card-text>
						<p>{{ $t('Panels.TrilabAccessPassword.DialogMessage') }} </p>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="red darken-1" text @click="showWarningDialog = false">{{ $t('Panels.TrilabAccessPassword.DialogNoButton') }}</v-btn>
						<v-btn color="green darken-1" text @click="showWarningDialog = false; saveSettings()">{{ $t('Panels.TrilabAccessPassword.DialogYesButton') }}</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>


		</v-card-text>
	</v-card>
</template>

<script lang="ts">


import axios from 'axios';
export default {
	data() {
		return {
			enabledPasswordControl: false,
			username: "",
			confirmPassword: "",
			password: "",
			credentialsSet: false,
			showWarningDialog: false
		}
	},

	computed: {

		passwordRules() {
			return [
				(v: any) => !!v || "Password is required",
				(v: any) => (v && v.length >= 3) || "Password must be at least 3 characters long"
			];
		},
		confirmPasswordRules() {
			return [
				(v: any) => !!v || "Confirm Password is required",
				(v: any) => (v == this.password) || "Passwords do not match"
			];
		},
		passwordsOk() {
			return this.password.trim() != "" && this.confirmPassword.trim() != "" && this.password == this.confirmPassword && this.username.trim() != "" ;
		}
	},

	watch: {
		password(newVal) {
			if (newVal.trim() == "") {
				this.confirmPassword = "";
			}
		},
		confirmPassword(newVal) {
			if (newVal.trim() == "") {
				this.password = "";
			}
		}
	},
	mounted: function () {
		if (
			this.$store.state.trilab.settings.login.password !== "" &&
			this.$store.state.trilab.settings.login.password !== "NONE"
		) {
			//this.enabledPasswordControl = true;
			//this.password = this.$store.state.trilab.settings.login.password;
		}
		this.getCredentials();
		if(this.$store.state.trilab.settings.locked == true){
			this.enabledPasswordControl = true;
		}
	},
	methods: {

		getCredentials() {
			///getMainAddress from trilab getters
			const addressToAsk = this.$store.getters['trilab/trilabPrefix'] + "/credentials";
			axios.get(addressToAsk).then((response) => {
					var obj = response.data;
					console.log("CREDENTIALS RESPONSE");
					console.log(obj);
					if(obj.user?.trim() == ""){
						console.log("CREDENTIALS NOT SET");
						this.credentialsSet = false;
					} else if(obj.user?.trim() != ""){
						this.credentialsSet = true;
						this.username = obj.user;
						console.log("CREDENTIALS ARE SET");
					}
				})
				.catch((error) => {
					console.log(error);
				});
		},

		async setCredentials() {
			await axios.post(this.$store.getters['trilab/trilabPrefix'] + "/credentials", {
				user: this.username, password: this.password});
			this.getCredentials();
			return true;
		},

		async saveSettings() {
			/// ONLY ALLOW TO SAVE WHEN PASSWORDS ARE SAME, USERNAME IS NOT EMPTY AND PASSWORDS ARE NOT EMPTY
			/// THIS IS 

			await this.setCredentials();
			/// here save only data
			this.$store.commit('trilab/setData', { "settings": { "locked": this.enabledPasswordControl } });
			await this.$store.dispatch('trilab/saveSettings', { "locked": this.enabledPasswordControl } );

			/// after 3s, do a reload
			setTimeout(() => {
				window.location.reload();
			}, 3000);
		},

	}
}
</script>
