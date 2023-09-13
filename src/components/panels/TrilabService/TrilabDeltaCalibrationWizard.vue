<template>
	<v-card>
		<v-card-title>
			<h2>Kalibrace delty</h2>
		</v-card-title>
		<v-card-text>
			<v-container v-if="step == 0">
				<v-card outlined v-if="step == 0">
					<v-card-title>
						<h3>Krok 1. BASIC kalibrace</h3>
					</v-card-title>
					<v-card-text>
						<p>Nejdřív ze všeho je nutné spustit základní kalibraci. Spustíte ji tlačítkem dole</p>
						<v-btn color="primary" :disabled="printerIsPrinting" @click="sendBasicCalibrationCommand()">SPUSTIT
							KALIBRACI</v-btn>
					</v-card-text>
				</v-card>
			</v-container>


			<v-container v-if="step == 1">
				<v-card outlined v-if="step == 1">
					<v-card-title>
						<h3>Krok 2. Uložení configu</h3>
					</v-card-title>
					<v-card-text>
						<p>Počkejte na dokončení kalibrace sedmi bodů a poté stiskněte tlačítko</p>
						<v-btn color="success" :disabled="printerIsPrinting" @click="sendSaveConfigCommand()">Uložit
							konfiguraci</v-btn>
					</v-card-text>
				</v-card>
			</v-container>


			<v-container v-if="step == 2">
				Základní delta kalibrace obecně dobře vypočítá delta parametry tak, aby byla tryska ve správné vzdálenosti
				od lože. Nepokouší se však kalibrovat přesnost rozměrů X a Y. Pro ověření rozměrové přesnosti je dobré
				provést rozšířenou delta kalibraci.

				Tento kalibrační postup vyžaduje vytisknout zkušební objekt a změřit části tohoto zkušebního objektu pomocí
				digitálních třmenů.

				Před provedením rozšířené delta kalibrace je třeba provést základní delta kalibraci (příkazem
				DELTA_CALIBRATE) a uložit výsledky (příkazem SAVE_CONFIG). Ujistěte se, že od posledního provedení základní
				delta kalibrace nedošlo k žádné významné změně konfigurace tiskárny ani hardwaru (pokud si nejste jisti,
				proveďte základní delta kalibraci znovu, včetně příkazu SAVE_CONFIG, těsně před tiskem testovacího objektu
				popsaného níže).

			</v-container>












			<v-row class="mt-3">
				<v-col cols="6">
					<v-btn :disabled="prevStepDisabled" block @click="prevClick()">Prev</v-btn>
				</v-col>
				<v-col cols="6">
					<v-btn :disabled="nextStepDisabled" block @click="nextClick()">Next</v-btn>
				</v-col>
			</v-row>

		</v-card-text>
	</v-card>
</template>

<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import TrilabMixin from '@/components/mixins/trilab'
import ControlMixin from '@/components/mixins/control';
import { Component, Mixins, Watch } from 'vue-property-decorator';

export default class TrilabDeltaCalibrationWizard extends Mixins(BaseMixin, TrilabMixin, ControlMixin) {
	public step :number = 0;
	public nextStepDisabled :boolean = false;
	public prevStepDisabled:boolean = true;

	nextClick() {
		console.log("nextClick");
		this.step++;
		console.log(this.step);
		if (this.step == 1) {
			this.prevStepDisabled = false;
		}
		this.nextStepDisabled = true;
		setTimeout(() => {
			this.nextStepDisabled = false;
		}, 3000);
	}
	prevClick() {
		if (this.step == 1) {
			this.prevStepDisabled = true;
		}
		this.step--;

	}

	sendBasicCalibrationCommand() {
		this.doHome(); /// g28
		this.$store.dispatch('server/addEvent', { message: 'DELTA_CALIBRATE', type: 'command' })
		this.$socket.emit('printer.gcode.script', { script: 'DELTA_CALIBRATE' })
		this.nextStepDisabled = false;
	}


	sendSaveConfigCommand() {
		this.$store.dispatch('server/addEvent', { message: 'SAVE_CONFIG', type: 'command' })
		this.$socket.emit('printer.gcode.script', { script: 'SAVE_CONFIG' }, { loading: 'topbarSaveConfig' })
	}



}
</script>
