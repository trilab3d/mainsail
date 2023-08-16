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
	<v-card outlined>
		<v-card-title class="pb-0">
			<span v-html="$t(`Panels.trilabSlicers.${target}.title`)"></span>
			<v-spacer></v-spacer>
		</v-card-title>

		<v-card-text>
			<div class="panel">
				<h3 class="panel-subheading">{{ $t(`Panels.trilabSlicers.${target}.longTitle`) }}</h3>
				<v-row>
					<v-col cols="12" md="8">
						<p class="panel-description">{{ $t(`Panels.trilabSlicers.${target}.shortDescription`) }}</p>
					</v-col>
					<v-col cols=12 md="4" class="slicer-icon">
						<img class="panel-image" :src="$t(`Panels.trilabSlicers.${target}.imgsrc`)" alt="">
					</v-col>
				</v-row>
				<v-btn class="panel-download-btn mt-3 mb-3" href="" @click="downloadSP()" color="primary"
					block>Download</v-btn>
				<p class="panel-long-description">{{ $t(`Panels.trilabSlicers.${target}.longDescription`) }}</p>
			</div>


		</v-card-text>
	</v-card>
</template>

<script lang="ts">

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

	data() {
		return {

		}
	},
	computed: {
		//...mapState('trilab', ['settings']),
		//...mapGetters(['uiFrozen']),
		//...mapGetters('trilab', ['trilabPrefix', 'corePrefix']),




	},
	methods: {
		...mapMutations('trilab', ['assignRoot', 'assignSetting']),
		downloadSP() {
			var data = {
				"slicer": this.slicer,
				"platform": this.getOS(),
			};

			axios.post(this.$store.getters['trilab/trilabPrefix'] + "/slicerprofiles", data)
				.then(data => {
					const responseData = data.data; // Get the data from the response
					if (responseData.type == "download-local") {
						let link = document.createElement("a");
						link.setAttribute("href", this.$store.getters['trilab/trilabPrefix'] + "/downloads/files/local/" + responseData.filename);
						link.setAttribute("download", responseData.filename);
						link.setAttribute("target", "_blank");
						link.click();

					} else if (responseData.type == "download-remote") {
						let link = document.createElement("a");
						link.setAttribute("href", responseData.url);
						link.setAttribute("download", responseData.filename);
						link.setAttribute("target", "_blank");
						link.click();

					} else if (responseData.type == "redirect") {
						window.open(responseData.url, '_blank');

					} else {
						this.$toast.warning(this.$t('Panels.TrilabSlicerPanel.notAvailableText').toString());
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
