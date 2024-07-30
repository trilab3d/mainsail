<style scoped>
img {
	max-width: 100%;
}
</style>
<template>
	<v-dialog v-model="showDialog" :max-width="700" @close="$emit('close')" @click:outside="$emit('close')"
		@keydown.esc="$emit('close')">
		<v-card>
			<v-card-title>{{ $t('App.Trilab.SlicerWizards.Prusa.Title') }}</v-card-title>
			<v-card-text>
				<p>{{ $t('App.Trilab.SlicerWizards.Prusa.Description') }}</p>
				<v-divider class="mt-3 mb-3"></v-divider>
				<v-btn v-if="slicerProfilesDownloadUrl != ''" block color="#ED6B21" class="panel-download-btn mt-3 mb-3"
					:href="slicerProfilesDownloadUrl">
					{{ $t('App.Trilab.SlicerPanel.DownloadProfiles') }}
				</v-btn>

				<h3>{{ $t('App.Trilab.SlicerWizards.Prusa.StepsForImporting')  }}</h3>
				<p>1. {{ $t('App.Trilab.SlicerWizards.Prusa.FirstStep') }}</p>
				<img src="/public/img/wizards/prusaprofileimport/1.jpg" alt="Step 1">
				<v-divider class="mb-3 mt-3"></v-divider>
				<p>2. {{ $t('App.Trilab.SlicerWizards.Prusa.SecondStep') }}</p>
				<img src="/public/img/wizards/prusaprofileimport/3.jpeg" alt="Step 3">
				<v-divider class="mb-3 mt-3"></v-divider>
				<p>3. {{ $t('App.Trilab.SlicerWizards.Prusa.ThirdStep') }}</p>
				<img src="/public/img/wizards/prusaprofileimport/4.jpeg" alt="Step 4">
				<v-divider class="mb-3 mt-3"></v-divider>
				<p>4. {{ $t('App.Trilab.SlicerWizards.Prusa.FourthStep') }} </p>
				<img src="/public/img/wizards/prusaprofileimport/5.jpeg" alt="Step 5">
				<v-divider class="mb-3 mt-3"></v-divider>
				<p>5. {{ $t('App.Trilab.SlicerWizards.Prusa.FifthStep') }}</p>
				<img src="/public/img/wizards/prusaprofileimport/6.jpeg" alt="Step 6">
				<p>6. {{ $t('App.Trilab.SlicerWizards.Prusa.SixthStep') }}</p>




			</v-card-text>
			<v-card-actions>
				<v-btn color="primary" @click="$emit('close')">{{ $t('App.Trilab.SlicerWizards.CloseWizard') }}</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">

import axios from 'axios';
import { mapState, mapGetters, mapMutations } from 'vuex'
import { Component, Mixins, Prop } from 'vue-property-decorator'


@Component({
	components: {
	},
})
export default class TrilabPrusaSlicersWizard extends Mixins() {
	@Prop({ default: '' }) slicerProfilesDownloadUrl!: string;
	showDialog = true;


}
</script>
