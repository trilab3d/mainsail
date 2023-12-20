<style scoped>
.panel-image {
	position: absolute;
	top: 0;
	right: 0;
	width: 35%;
	max-width:150px;
}

/* under 1000 */
@media (max-width: 1000px) {
	.panel-image {
		position: static;
		margin: 0 auto;
		max-width:unset;
	}

	.slicerTitle {
		display:block;
		text-align: center;
		margin:0 auto;
	}
	.hiddenS {
		display: none;
	}
	.v-card{
		text-align:center;
	}
}

.slicer-icon img {
	width: 35%;
}
</style>
<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			<span class="slicerTitle" v-html="$t(`Panels.trilabSlicers.${target}.longTitle`)"></span>
			<v-spacer class="hiddenS"></v-spacer>
		</v-card-title>

		<v-card-text>
			<div class="panel">
				<!--- <h3 class="panel-subheading">{{ $t(`Panels.trilabSlicers.${target}.longTitle`) }}</h3> --->
				<img class="panel-image v-card__title" :src="$t(`Panels.trilabSlicers.${target}.imgsrc`)" alt="">
				<v-row>
					<v-col cols="12" md="8">
						<p class="panel-description" v-html="$t(`Panels.trilabSlicers.${target}.shortDescription`)"></p>
					</v-col>
				</v-row>
				<v-btn class="panel-download-btn mt-3 mb-3" :href="getHrefLink" @click="downloadSP()" color="primary"
					block>{{ $t("Trilab.SlicerPanel.Download") }}</v-btn>
				<p class="panel-long-description" v-html="$t(`Panels.trilabSlicers.${target}.longDescription`)"></p>
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
		getHrefLink() {
			var platform = this.getOS();
			var href = "";
			if (platform == "mac64" || platform == "macos" || platform == "ios") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.7.1/PrusaSlicer-2.7.1+MacOS-universal-202312121432.dmg";
			} else if (platform == "win64") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.7.1/PrusaSlicer-2.7.1+win64-202312121425_signed.zip";
			} else if (platform == "archlinux") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.6.0/PrusaSlicer-2.6.0+linux-aarch64-GTK3-202307170801.AppImage";
			} else if (platform == "armv7l") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.7.1/PrusaSlicer-2.7.1+linux-armv7l-GTK2-202312121430.AppImage";
			} else if (platform == "linux") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.7.1/PrusaSlicer-2.7.1+linux-x64-GTK3-202312121425.AppImage";
			} else {
				href = "https://github.com/prusa3d/PrusaSlicer/releases";
			}
			return href;
		}



	},
	methods: {
		...mapMutations('trilab', ['assignRoot', 'assignSetting']),
		/*downloadSP() {
			var data = {
				"slicer": this.slicer,
				"platform": this.getOS(),
			};

			axios.post(this.$store.getters['trilab/trilabPrefix'] + "/slicerprofiles", data)
				.then(data => {
					const responseData = data.data; // Get the data from the response
					if (responseData.type == "download-local") {
						let link = document.createElement("a");
						//link.setAttribute("href", this.$store.getters['trilab/trilabPrefix'] + "/downloads/files/local/" + responseData.filename);
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

		},*/
		downloadSP() {
			if (this.getHrefLink == "#") {
				this.$toast.warning(this.$t('Panels.TrilabSlicerPanel.notAvailableText').toString());
				return;
			}

			/*var platform = this.getOS();
			var href = "";
			if (platform == "mac64" || platform == "macos" || platform == "ios") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.6.0/PrusaSlicer-2.6.0+MacOS-universal-202306191415.dmg";
			} else if (platform == "win64") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.6.0/PrusaSlicer-2.6.0+win64-202306191221_signed.zip";
			} else if (platform == "linux") {
				href = "https://github.com/prusa3d/PrusaSlicer/releases/download/version_2.6.0/PrusaSlicer-2.6.0+linux-aarch64-GTK2-202307141454.AppImage";
			} else {
				this.$toast.warning(this.$t('Panels.TrilabSlicerPanel.notAvailableText').toString());
				return;
			}
			let link = document.createElement("a");
			link.setAttribute("href", href);
			link.setAttribute("target", "_blank");
			link.click();*/

		},
		getOS() {
			var userAgent = window.navigator.userAgent,
				platform = window.navigator.platform,
				macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'Mac OS'],
				windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
				archLinuxPlatforms = ['ArchLinux', 'Arch Linux'],
				armv7LinuxPlatforms = ["armv7l"],
				linuxPlatforms = ['Linux'],
				os = null;


			for (let i = 0; i < macosPlatforms.length; i++) {
				if (userAgent.indexOf(macosPlatforms[i]) !== -1) {
					return 'macos';
				}
			}
			for (let i = 0; i < windowsPlatforms.length; i++) {
				if (userAgent.indexOf(windowsPlatforms[i]) !== -1) {
					return 'win64';
				}
			}

			for (let i = 0; i < archLinuxPlatforms.length; i++) {
				if (userAgent.indexOf(archLinuxPlatforms[i]) !== -1) {
					return 'archlinux';
				}
			}

			for (let i = 0; i < armv7LinuxPlatforms.length; i++) {
				if (userAgent.indexOf(armv7LinuxPlatforms[i]) !== -1) {
					return 'armv7l';
				}
			}

			for (let i = 0; i < linuxPlatforms.length; i++) {
				if (userAgent.indexOf(linuxPlatforms[i]) !== -1) {
					return 'linux';
				}
			}



			return os;
		}

	}
}
</script>
