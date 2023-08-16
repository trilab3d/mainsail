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
					<v-text-field type="text" value="trilab" readonly :label="$t('Panels.TrilabAccessPassword.username')"
						hide-details></v-text-field>
					<v-text-field :readonly="!enabledPasswordControl" :rules="passwordRules" v-model="password"
						type="password" :label="$t('Panels.TrilabAccessPassword.password')" hide-details></v-text-field>
					<v-text-field :readonly="!enabledPasswordControl || password.trim() == ''" :rules="confirmPasswordRules"
						v-model="confirmPassword" type="password" ref="confPw"
						:label="$t('Panels.TrilabAccessPassword.confirmPassword')" hide-details></v-text-field>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script lang="ts">



export default {
	data() {
		return {
			enabledPasswordControl: false,
			confirmPassword: "",
			password: "",
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

	},
	watch: {
		password(newVal) {
			if (newVal.trim() == "") {
				this.confirmPassword = "";
			}
			if (newVal == this.confirmPassword && newVal.trim() == "") {
				this.savePassword();
			}
		},
		confirmPassword(newVal) {
			if (newVal.trim() == "") {
				this.password = "";
			}
			if (newVal == this.password && newVal.trim() != "") {
				this.savePassword();
			}

		}
	},
	mounted: function () {
		if (
			this.$store.state.trilab.settings.login.password !== "" &&
			this.$store.state.trilab.settings.login.password !== "NONE"
		) {
			this.enabledPasswordControl = true;
			this.password = this.$store.state.trilab.settings.login.password;
		}
	},
	methods: {
		savePassword() {
			this.$store.commit('trilab/setData', { "settings": { "login": { "password": this.password } } });
		},

	}
}
</script>
