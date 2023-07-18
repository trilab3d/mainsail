
<style scoped>
.slicer-icon {
	display: flex;
	justify-content: center;
}

.slicer-icon img {
	width: 64px;
	height: 64px;
}
</style>
<template>
	<v-card outlined :disabled="this.uiFrozen">
		<v-card-title class="pb-0">
			<span v-html="$t(`panel.slicers.${target}.title`)"></span>
			<v-spacer></v-spacer>
			<a v-show="!uiFrozen" href="javascript:void(0)" @click="showResetConfirmation = true" v-if="false">
				<v-icon small class="mr-1">mdi-restore</v-icon> {{ $t('panel.settingsGeneral.factoryReset') }}
			</a>
		</v-card-title>

		<v-card-text>
			<div class="panel">
				<h2 class="panel-subheading">{{ $t(`panel.slicers.${target}.longTitle`) }}</h2>
				<v-row>
					<v-col cols="12" md="8">
						<p class="panel-description">{{ $t(`panel.slicers.${target}.shortDescription`) }}</p>
					</v-col>
					<v-col cols=12 md="4" class="slicer-icon">
						<img class="panel-image" :src="require('@/assets/' + $t(`panel.slicers.${target}.imgsrc`))" alt="">
					</v-col>
				</v-row>
				<v-btn class="panel-download-btn mt-3 mb-3" href="" @click="downloadSP()" color="primary"
					block>Download</v-btn>
				<p class="panel-long-description">{{ $t(`panel.slicers.${target}.longDescription`) }}</p>
			</div>


		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { LogType } from '@/utils/logging';
import axios from 'axios';
import { mapState, mapGetters, mapMutations } from 'vuex'


export default {

	props: {
		target: {
			type: String,
			required: true,
		},
		slicer: {
			type: String,
			required: false,
			default: ""
		}
	},
	computed: {
		...mapState('trilab', ['settings']),
		...mapGetters(['uiFrozen']),
		...mapGetters('trilab', ['trilabPrefix', 'corePrefix']),




	},
	data() {
		return {

		}
	},
	methods: {
		...mapMutations('trilab', ['assignRoot', 'assignSetting']),
		downloadSP() {
			var data = {
				"slicer": this.slicer,
				"platform": this.getOS()
			};

			axios.post(this.trilabPrefix + "/slicerprofiles", data)
				.then(data => {
					data = data.data;
					if (data.type == "download-local") {
						let link = document.createElement("a");
						link.setAttribute("href", this.corePrefix + "/downloads/files/local/" + data.filename);
						link.setAttribute("download", data.filename);
						link.setAttribute("target", "_blank");
						link.click();

					} else if (data.type == "download-remote") {
						let link = document.createElement("a");
						link.setAttribute("href", data.url);
						link.setAttribute("download", data.filename);
						link.setAttribute("target", "_blank");
						link.click();

					} else if (data.type == "redirect") {
						window.open(data.url, '_blank');

					} else {
						this.$makeNotification(LogType.warning, "Slicer profile not available", "Slicer profile is not available for this printer or system platform, please contact TriLAB support");
					}

				});

		},
		getOS() {
			var userAgent = window.navigator.userAgent,
				platform = window.navigator.platform,
				macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
				windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
				iosPlatforms = ['iPhone', 'iPad', 'iPod'],
				os = null;

			if (macosPlatforms.indexOf(platform) !== -1) {
				os = 'mac64';
			} else if (iosPlatforms.indexOf(platform) !== -1) {
				os = 'ios';
			} else if (windowsPlatforms.indexOf(platform) !== -1) {
				os = 'win64';
			} else if (/Android/.test(userAgent)) {
				os = 'android';
			} else if (!os && /Linux/.test(platform)) {
				os = 'linux';
			}
			return os;
		}

	}
}
</script>
