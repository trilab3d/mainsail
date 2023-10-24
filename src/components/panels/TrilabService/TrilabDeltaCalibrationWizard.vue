<!-- eslint-disable no-unreachable -->
<template>
	<v-card>
		<v-card-title>
			<h2>Kalibrace delty</h2>
		</v-card-title>
		<v-card-text>
			<v-row class="justify-center">
				<v-col cols="6" sm="12" md="6">
					<v-container v-if="step == 0">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. BASIC kalibrace</h3>
							</v-card-title>
							<v-card-text>
								<p>Nejdřív ze všeho je <strong>nutné</strong> spustit základní kalibraci. Spustíte ji
									tlačítkem dole a poté
									počkejte na restart tiskárny</p>
								<v-btn :disabled="printerBusy" color="primary"
									:loading="loadings.includes('delta_calibrate')" block
									@click="sendBasicCalibrationCommand()">SPUSTIT
									KALIBRACI</v-btn>
							</v-card-text>
						</v-card>
					</v-container>

					<v-container v-if="step == 1">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. ADVANCED kalibrace</h3>
							</v-card-title>
							<v-card-text>
								Základní delta kalibrace obecně dobře vypočítá delta parametry tak, aby byla tryska ve
								správné
								vzdálenosti
								od podložky. Nepokouší se však kalibrovat přesnost rozměrů X a Y. Pro ověření rozměrové
								přesnosti je
								dobré
								provést rozšířenou delta kalibraci.
								<br>
								Tento kalibrační postup vyžaduje vytisknout zkušební objekt a změřit části tohoto zkušebního
								objektu
								pomocí
								digitálních třmenů.
								<br>
								<strong>Ujistěte se</strong>, že od posledního provedení
								základní
								delta kalibrace nedošlo k žádné významné změně konfigurace tiskárny ani hardwaru (pokud si
								nejste
								jisti,
								proveďte základní delta kalibraci znovu, těsně před tiskem
								testovacího
								objektu
								níže).
								<br>
								<v-btn :disabled="printerBusy || loadings.includes('DeltaCalibrationWizardPrint')" block
									@click="sendPrintTestObject()">Vytisknout testovací objekt</v-btn>
								<p class="mt-6 mb-2">Vytiskněte testovací objekt a počkejte, až zcela vychladne.</p>
								<small>Dále zadávané hodnoty musí být spuštěny
									se stejným nastavením tiskárny, které bylo použito při tisku kalibračního objektu (mezi
									tiskem a
									měřením nespouštějte příkaz DELTA_CALIBRATE ani neprovádějte nic, co by jinak změnilo
									konfiguraci
									tiskárny).

									Pokud je to možné, provádějte dále popsaná měření, když je objekt stále připevněn k
									tiskové podložce,
									ale nedělejte si starosti, pokud se díl od podložky oddělí - jen se snažte při měření
									objekt neohýbat.</small>

							</v-card-text>
						</v-card>

					</v-container>


					<v-container v-if="step == 2">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. ADVANCED kalibrace</h3>
							</v-card-title>
							<v-card-text>

								<p>Pokud byl objekt zmenšen na menší nebo větší velikost, uveďte faktor měřítka, který byl
									použit při slicování objektu. Pokud velikost změněna nebyla, ponechte výchozí hodnotu.
									<small>(Hodnota měřítka 2.0 by znamenala dvojnásobek původní velikosti objektu, hodnota
										0.5 by znamenala polovinu původní velikosti.)</small>
								</p>

								<p>Nyní zadejte hodnotu (s desetinnými čísly - Použijte tečku místo desetinné
									čárky):</p>

								<v-row>
									<v-text-field label="Měřítko velikosti" @input="isNumber($event)" v-model="scaleFactor"
										:rules="[rules.required, rules.validFloat]"></v-text-field>

								</v-row>

							</v-card-text>
						</v-card>

					</v-container>



					<v-container v-if="step == 3">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. ADVANCED kalibrace</h3>
							</v-card-title>
							<v-card-text>
								<p>
									Začněte měřením vzdálenosti mezi středovým sloupem a sloupem vedle štítku "A" (který by
									měl rovněž
									směřovat k věži "A")</p>
								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta-a-distance.jpg" alt="delta-a-distance"
										style="width:100%; max-width:500px">
									<p><small>Měření - krok 1</small></p>
								</div>

								<p>Poté postupujte proti směru hodinových ručiček a změřte vzdálenosti mezi středovým
									sloupem a ostatními sloupy <small>(vzdálenost od středu ke sloupu naproti štítku C,
										vzdálenost
										od středu ke sloupu se štítkem B atd.).</small></p>
								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta_cal_e_step1.jpg" alt="step_1" style="width:100%; max-width:500px">
									<p><small>Měření - krok 2</small></p>
								</div>

								<p>Nyní zadejte naměřené hodnoty (s desetinnými čísly - Použijte tečku místo desetinné
									čárky):</p>

								<v-row>

									<v-col v-for="(field, index) in fields" :key="index" cols="4" md="6" lg="4">
										<v-text-field :label="field.label" v-model="field.value" @input="isNumber($event)"
											:rules="[rules.required, rules.validFloat, rules.trilabFieldsCheck]"
											:ref="field.label"></v-text-field>
									</v-col>

								</v-row>
							</v-card-text>
						</v-card>

					</v-container>

					<v-container v-if="step == 4">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. ADVANCED kalibrace</h3>
							</v-card-title>
							<v-card-text>

								<p>Změřte vzdálenost mezi sloupkem A a sloupkem naproti štítku C.</p>
								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta-outer-distance.jpg" alt="step_1"
										style="width:100%; max-width:500px">
									<p><small>Měření - krok 2</small></p>
								</div>
								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta_cal_e_step2.jpg" alt="step_1" style="width:100%; max-width:500px">
									<p><small>Měření - krok 2</small></p>
								</div>


								<p>Nyní zadejte naměřené hodnoty (s desetinnými čísly - Použijte tečku místo desetinné
									čárky):</p>

								<v-row>

									<v-col v-for="(field, index) in far_fields" :key="index" cols="4" md="12" lg="4">
										<v-text-field :label="field.label" v-model="field.value" @input="isNumber($event)"
											:rules="[rules.required, rules.validFloat, rules.farsCheck]"
											:ref="field.label"></v-text-field>
									</v-col>

								</v-row>
							</v-card-text>
						</v-card>

					</v-container>


					<v-container v-if="step == 5">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. ADVANCED kalibrace</h3>
							</v-card-title>
							<v-card-text>

								<p>V tomto okamžiku je možné předmět z lůžka odstranit. Konečné měření se týká samotných
									sloupů. Změřte velikost středového sloupku podél ramene A, poté ramene B a nakonec
									ramene C</p>
								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta-a-pillar.jpg" alt="step_3" style="width:100%; max-width:500px">
									<p><small>Měření - krok 3</small></p>
								</div>

								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta_cal_e_step3.jpg" alt="step_3" style="width:100%; max-width:500px">
									<p><small>Měření - krok 3</small></p>
								</div>


								<p>Nyní zadejte naměřené hodnoty (s desetinnými čísly - Použijte tečku místo desetinné
									čárky):</p>

								<v-row>

									<v-col v-for="(field, index) in pillarFields" :key="index" cols="4" md="6" lg="4">
										<v-text-field :label="field.label" v-model="field.value" @input="isNumber($event)"
											:rules="[rules.required, rules.validFloat, rules.pillarsCheck]"
											:ref="field.label"></v-text-field>
									</v-col>

								</v-row>

							</v-card-text>
						</v-card>

					</v-container>

					<v-container v-if="step == 6">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. ADVANCED kalibrace</h3>
							</v-card-title>
							<v-card-text>

								<p>Konečné rozměry se týkají vnějších pilířů. Začněte měřením vzdálenosti sloupu A podél
									linie od sloupu A ke sloupu naproti sloupu C.</p>
								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta-outer-distance.jpg" alt="step_3"
										style="width:100%; max-width:500px">
									<p><small>Měření - krok 4</small></p>
								</div>

								<p>Poté postupujte proti směru hodinových ručiček a změřte zbývající vnější pilíře (pilíř
									napříč od C podél linie k B, pilíř B podél linie k pilíři napříč od A atd.).</p>

								<div style="text-align:center" class="my-3 mx-3">
									<img src="/img/delta_cal_e_step4.jpg" alt="step_3" style="width:100%; max-width:500px">
									<p><small>Měření - krok 4</small></p>
								</div>


								<p>Nyní zadejte naměřené hodnoty (s desetinnými čísly - Použijte tečku místo desetinné
									čárky):</p>

								<v-row>

									<v-col v-for="(field, index) in outerPillarFields" :key="index" cols="2" md="12" lg="2">
										<v-text-field :label="field.label" v-model="field.value" @input="isNumber($event)"
											:rules="[rules.required, rules.validFloat, rules.outerPillarsCheck]"
											:ref="field.label"></v-text-field>
									</v-col>

								</v-row>

							</v-card-text>
						</v-card>

					</v-container>



					<v-container v-if="step == 7">
						<v-card outlined>
							<v-card-title>
								<h3>Krok {{ step + 1 }}. UPOZORNĚNÍ</h3>
							</v-card-title>
							<v-card-text>

								<p>Dokončení tohoto příkazu může trvat několik minut. Po dokončení vypočítá aktualizované
									parametry delta (poloměr delta, úhly věže, polohy koncových zarážek a délky ramen). Poté
									uloží jak aktualizované parametry delta, tak informace z měření
									vzdálenosti. Budoucí kalibrace budou rovněž využívat tyto informace o
									vzdálenosti. Po stisknutí tlačítka níže se
									nepokoušejte znovu zadávat nezpracovaná
									měření vzdálenosti, protože tento příkaz mění konfiguraci tiskárny a nezpracovaná měření
									již neplatí.
								</p>
								<p style="text-align:center; font-weight:bold">Po stisknutí tohoto tlačítka se tento wizard
									a uložené hodnoty resetují a případné korekce je potřeba udělat odznova</p>
								<v-btn :disabled="printerBusy || sendCalibrateCommandEnabled == false" :loading="advancedCalibrationInProgress" color="red"
									class="mt-4" block @click="sendCalibrateCommand()">Spustit
									Kalibraci</v-btn>

							</v-card-text>
						</v-card>

					</v-container>
					<v-row class="mt-3 mx-1">
						<v-col cols="6">
							<v-btn :disabled="isPrevDisabled" block @click="prevClick()">
								<v-icon left>
									{{ mdiChevronLeft }}
								</v-icon>
								Předchozí
							</v-btn>
						</v-col>
						<v-col cols="6">
							<v-btn :disabled="isNextDisabled" block @click="nextClick()">Další
								<v-icon right>
									{{ mdiChevronRight }}
								</v-icon>
							</v-btn>
						</v-col>
						<v-col v-if="skipVisible" cols="12">
							<v-btn block @click="skipStep()">Přeskočit
								<v-icon right>
									{{ mdiSkipNext }}
								</v-icon>
							</v-btn>
						</v-col>
						<v-col cols="12" :disabled="printerIsPrinting">
							<v-btn block color="red" prepend-icon="mdi-restart" @click="startOver()">
								<v-icon left>
									{{ mdiRestart }}
								</v-icon>
								Začít znovu
							</v-btn>
						</v-col>
					</v-row>
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
import { mdiChevronRight, mdiRestart, mdiChevronLeft, mdiSkipNext } from '@mdi/js';
import { watch } from 'fs';
@Component
export default class TrilabDeltaCalibrationWizard extends Mixins(BaseMixin, ControlMixin, TrilabMixin) {
	mdiChevronRight = mdiChevronRight;
	mdiChevronLeft = mdiChevronLeft;
	mdiRestart = mdiRestart;
	mdiSkipNext = mdiSkipNext;




	public advancedCalibrationInProgress = false;
	public advancedCalibrationStartTime = Date.now();
	public calibrationstep: number = 0;
	public last_step: number = 9;
	public nextBtnEnabled = true;
	public sendCalibrateCommandEnabled = true;
	public basicDeltaCalibrationDone = false;
	public prevBtnEnabled = true;
	public testPrintDone = false;


	get skipVisible() {
		if ("skip_visible" in this.stepConfigObject) {
			return this.stepConfigObject.skip_visible;
		}
		return false;
	}

	get stepConfigObject() {
		/// return not by index but by step
		return this.stepConfig.filter((item) => item.index == this.step)[0];
	}


	get isNextDisabled() {
		let boolFromStepConfig: any = this.stepConfigObject.next_enabled;
		if (typeof boolFromStepConfig == "function") {
			boolFromStepConfig = boolFromStepConfig();
		}

		return boolFromStepConfig == false || !this.nextBtnEnabled;
	}
	get isPrevDisabled() {
		let boolFromStepConfig: any = this.stepConfigObject.prev_enabled;
		if (typeof boolFromStepConfig == "function") {
			boolFromStepConfig = boolFromStepConfig();
		}

		return boolFromStepConfig == false || !this.prevBtnEnabled;

	}


	startOver() {
		if (confirm("Opravdu chcete začít znovu? Smažou se všechna uložená data v databázi a wizard se vrátí na začátek")) {
			this.deleteAllItemsInWizardDB();
			this.resetWizard();
		}
	}

	checkDeltaCalibrationDone() {
		if (this.printerBusy || this.basicDeltaCalibrationDone == false) {
			return false;
		}
		return true;
	}

	checkPrintingDone() {
		if (this.printerIsPrinting || this.testPrintDone == false) {
			return false;
		}
		return true;
	}


	get printerBusy() {
		const idle_timeout_state = this.$store.state.printer.idle_timeout?.state
		return this.printerIsPrinting || idle_timeout_state === "Printing";
	}
	@Watch('printer_state')
	onPrinterStateChange(newVal: String, oldVal: String) {
		console.log("Printer state changed from " + oldVal + " to " + newVal);
	}


	public stepConfig = [
		{
			index: 0,
			next_enabled: this.checkDeltaCalibrationDone,
			prev_enabled: false,
			skip_visible: true,
		},
		{
			index: 1,
			next_enabled: this.checkPrintingDone,
			prev_enabled: true,
			skip_visible: true,
		},
		{
			index: 2,
			next_enabled: this.scaleValid,
			prev_enabled: true,
			nextAction: this.sendSaveScaleCommand
		},
		{
			index: 3,
			next_enabled: this.distsValid,
			prev_enabled: true,
			nextAction: this.sendSaveDistsCommand
		},
		{
			index: 4,
			next_enabled: this.farsValid,
			prev_enabled: true,
			nextAction: this.sendSaveFarsCommand
		},
		{
			index: 5,
			next_enabled: this.pillarsValid,
			prev_enabled: true,
			nextAction: this.sendSavePillarsCommand
		},
		{
			index: 6,
			next_enabled: this.outerPillarsValid,
			prev_enabled: true,
			nextAction: this.sendSaveOuterPillarsCommand
		},
		{
			index: 7,
			next_enabled: false,
			prev_enabled: true
		},
	];

	public scaleFactor: any = "1.0";


	created() {
		this.init();
		var thisref = this;
		if ((window as any)['printerStateIntervalDebug'] != undefined) {
            clearInterval((window as any)['printerStateIntervalDebug'])
        }

		(window as any)["printerStateIntervalDebug"] = setInterval(function(){
			const idle_timeout_state = thisref.$store.state.printer.idle_timeout?.state
			console.log("printerState: " + thisref.printer_state + " idle_timeout_state: " + idle_timeout_state)
		}, 1000)
	}

	async init() {
		/// we have to fetch values from moonraker db
		setInterval(this.testVypis, 30000);
		var step = await this.latestStepFromDB();
		console.log(step);
		if (step.status != 200) {
			this.step = 0;
			console.log("Setuju step na 0");
		} else {
			step = await step.json();
			console.log("toto je step: ");
			console.log(step);
			this.step = parseInt(step.result.value);
		}


		///lets try to load the values from db
		var values = await this.latestValuesFromDB();
		for (let i = 0; i < this.fields.length; i++) {
			let keyToCheck = this.fields[i].label;
			if (keyToCheck in values.result.value) {
				this.fields[i].value = values.result.value[keyToCheck];
			}
		}
		for (let i = 0; i < this.far_fields.length; i++) {
			let keyToCheck = this.far_fields[i].label;
			if (keyToCheck in values.result.value) {
				this.far_fields[i].value = values.result.value[keyToCheck];
			}
		}
		for (let i = 0; i < this.pillarFields.length; i++) {
			let keyToCheck = this.pillarFields[i].label;
			if (keyToCheck in values.result.value) {
				this.pillarFields[i].value = values.result.value[keyToCheck];
			}
		}
		for (let i = 0; i < this.outerPillarFields.length; i++) {
			let keyToCheck = this.outerPillarFields[i].label;
			if (keyToCheck in values.result.value) {
				this.outerPillarFields[i].value = values.result.value[keyToCheck];
			}
		}
		if ("basicDeltaDone" in values.result.value) {
			this.basicDeltaCalibrationDone = true;
		}
		if ("testPrintDone" in values.result.value) {
			this.testPrintDone = true;
		}
		if ("scaleFactor" in values.result.value) {
			this.scaleFactor = parseFloat(values.result.value["scaleFactor"]);
		}
		if("advanced_calibration_finished_alert" in values.result.value){
			alert("Kalibrace dokončena");
			/// delete it from db
			fetch(this.dbUrl("advanced_calibration_finished_alert"), {
				method: 'DELETE',
			});
		}
	}

	async latestValuesFromDB() {
		var response = await fetch(this.dbUrl());
		if (!response.ok) {
			console.log("Network response was not ok");
		}
		return response.json();
	}

	async testVypis() {
		var response = await fetch(this.dbUrl());
		if (!response.ok) {
			console.log("Network response was not ok");
		}
		console.log(response.json());
	}



	public fields = [
		{ label: "a_dist", value: "", valid: false },
		{ label: "far_c_dist", value: "", valid: false },
		{ label: "b_dist", value: "", valid: false },
		{ label: "far_a_dist", value: "", valid: false },
		{ label: "c_dist", value: "", valid: false },
		{ label: "far_b_dist", value: "", valid: false },
	];

	public far_fields = [
		{ label: "a_to_far_c", value: "", valid: false },
		{ label: "far_c_to_b", value: "", valid: false },
		{ label: "b_to_far_a", value: "", valid: false },
		{ label: "far_a_to_c", value: "", valid: false },
		{ label: "c_to_far_b", value: "", valid: false },
		{ label: "far_b_to_a", value: "", valid: false },
	];


	public pillarFields = [
		{ label: "center_pillar_a", value: "", valid: false },
		{ label: "center_pillar_b", value: "", valid: false },
		{ label: "center_pillar_c", value: "", valid: false },
	];


	public outerPillarFields = [
		{ label: "pillar_a", value: "", valid: false },
		{ label: "far_c", value: "", valid: false },
		{ label: "pillar_b", value: "", valid: false },
		{ label: "far_a", value: "", valid: false },
		{ label: "pillar_c", value: "", valid: false },
		{ label: "far_b", value: "", valid: false },
	]

	public rules = {
		required: (value: string) => !!value || 'Pole je povinné',
		validFloat: (value: string) => {
			if (value == "0") {
				return "Zadejte nenulovou hodnotu";
			}
			if (value == "") {
				return "Pole je povinné";
			}
			const periodCount = value.split('.').length - 1;
			if (periodCount > 1) {
				return 'Více než jedna tečka není povoleno';
			}
			if (periodCount < 1) {
				return "Zadejte alespoň jednu desetinnou tečku";
			}
			const afterPeriod = value.split('.')[1];
			if (afterPeriod.length < 1) {
				return "Zadejte alespoň jednu číslici za desetinnou tečkou";
			}

			const floatValue = parseFloat(value);
			if (isNaN(floatValue)) {
				return 'Použijte číslo s desetinnými místy';
			}
			return true;
		},
		farsCheck: (value: string) => {
			let intval = parseFloat(value);
			console.log("checkujeme fars: " + intval);
			if (intval <= 70 || intval >= 160) {
				return "Zadejte hodnotu mezi 70 a 160";
			}
			return true;
		},
		trilabFieldsCheck: (value: string) => {
			let intval = parseFloat(value);
			console.log("checkujeme fields: " + intval);
			if (intval <= 70.0 || intval >= 160.0) {
				return "Zadejte hodnotu mezi 70 a 160";
			}
			return true;
		},
		pillarsCheck: (value: string) => {
			let intval = parseFloat(value);
			console.log("checkujeme pillars: " + intval);
			if (intval <= 8.0 || intval >= 20.0) {
				console.log("returning false for pillar");
				return "Zadejte hodnotu mezi 8 a 20";
			}
			return true;
		},
		outerPillarsCheck: (value: string) => {
			let intval = parseFloat(value);
			console.log("checkujeme outerpillars: " + intval);
			if (intval <= 8.0 || intval >= 20.0) {
				return "Zadejte hodnotu mezi 8 a 20";
			}
			return true;
		}


	};



	distsValid() {
		let isValid = true;
		for (const field of this.fields) {
			// Check if the field's value is valid using the rules.validFloat rule
			const fieldIsValid = this.rules.validFloat(field.value.toString());

			if (fieldIsValid !== true) {
				isValid = false;
				console.log(`Field "${field.label}" is invalid: ${fieldIsValid}`);
			}
		}

		if (isValid) {
			// All inputs are valid, you can perform further actions here
			console.log('All inputs are valid');
			return true;
		} else {
			console.log('Some inputs are invalid');
			return false;
		}
	}

	farsValid() {
		let isValid = true;
		for (const field of this.far_fields) {
			// Check if the field's value is valid using the rules.validFloat rule
			const fieldIsValid = this.rules.validFloat(field.value.toString());

			if (fieldIsValid !== true) {
				isValid = false;
				console.log(`Field "${field.label}" is invalid: ${fieldIsValid}`);
			}
		}

		if (isValid) {
			// All inputs are valid, you can perform further actions here
			console.log('All inputs are valid');
			return true;
		} else {
			console.log('Some inputs are invalid');
			return false;
		}
	}

	pillarsValid() {
		let isValid = true;
		for (const field of this.pillarFields) {
			// Check if the field's value is valid using the rules.validFloat rule
			const fieldIsValid = this.rules.validFloat(field.value.toString());

			if (fieldIsValid !== true) {
				isValid = false;
				console.log(`Field "${field.label}" is invalid: ${fieldIsValid}`);
			}
		}

		if (isValid) {
			// All inputs are valid, you can perform further actions here
			console.log('All inputs are valid');
			return true;
		} else {
			console.log('Some inputs are invalid');
			return false;
		}
	}

	outerPillarsValid() {
		let isValid = true;
		for (const field of this.outerPillarFields) {
			// Check if the field's value is valid using the rules.validFloat rule
			const fieldIsValid = this.rules.validFloat(field.value.toString());

			if (fieldIsValid !== true) {
				isValid = false;
				console.log(`Field "${field.label}" is invalid: ${fieldIsValid}`);
			}
		}

		if (isValid) {
			// All inputs are valid, you can perform further actions here
			console.log('All inputs are valid');
			return true;
		} else {
			console.log('Some inputs are invalid');
			return false;
		}

	}
	scaleValid() {
		let isValid = true;
		const fieldIsValid = this.rules.validFloat(this.scaleFactor.toString());

		if (fieldIsValid !== true) {
			isValid = false;
			console.log(`Field "scaleFactor" is invalid: ${fieldIsValid}`);
		}

		if (isValid) {
			// All inputs are valid, you can perform further actions here
			console.log('All inputs are valid');
			return true;
		} else {
			console.log('Some inputs are invalid');
			return false;
		}
	}


	async latestStepFromDB() {
		var response: any = await fetch(this.dbUrl("step"));
		return response;
	}

	get step(): number {
		return this.calibrationstep;
	}
	set step(step: number) {
		this.calibrationstep = step;
	}


	dbUrl(key: string = "", value: string = "") {
		var toReturn = this.$store.getters['socket/getUrl'] + '/server/database/item?namespace=trilabdeltacalibrationwizard';
		if (key != "") {
			toReturn = toReturn + "&key=" + key;
		}
		if (value != "") {
			toReturn = toReturn + "&value=" + value;
		}

		return toReturn;
	}


	isNumber(evt: any) {
		console.log(evt);
		evt = (evt) ? evt : window.event;
		var charCode = (evt.which) ? evt.which : evt.keyCode;
		if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
			console.log("char prevented");
			evt.preventDefault();;
		} else {
			console.log("char allowed");
			console.log(charCode);
			console.log("event:");
			console.log(evt);
			return true;
		}
	}


	nextClick() {
		console.log("nextClick");

		//// check if we have to run some action
		if (this.stepConfigObject.nextAction && typeof this.stepConfigObject.nextAction == "function") {
			this.stepConfigObject.nextAction();
		}

		this.step = this.step + 1;
		var thatRef = this;


		console.log(this.step);
		fetch(this.dbUrl("step", this.step.toString()), { method: 'POST' });
		/// scroll to top of the page
		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 100);
	}
	prevClick() {
		/// scroll to top of the page
		this.step--;
		fetch(this.dbUrl("step", this.step.toString()), { method: 'POST' });
		setTimeout(function () {
			window.scrollTo(0, 0);
		}, 100);

	}



	sendPrintTestObject() {
		const filename = (".service-gcodes/calibrate_size_scale1_v1.1.gcode")
		this.$socket.emit('printer.print.start', { filename: filename }, { loading: 'DeltaCalibrationWizardPrint' })
		fetch(this.dbUrl("testPrintDone", "true"), { method: 'POST' });
		this.testPrintDone = true;
	}

	async sendBasicCalibrationCommand() {
		this.$store.dispatch('printer/sendGcode', "_basic_calibrate");
		this.$store.dispatch('gui/gcodehistory/addToHistory', "_basic_calibrate");
		fetch(this.dbUrl("basicDeltaDone", "true"), { method: 'POST' });

		//this.$store.dispatch('server/addEvent', { message: 'DELTA_CALIBRATE', type: 'command' })
		//this.$socket.emit('printer.gcode.script', { script: 'DELTA_CALIBRATE' }, { loading: 'delta_calibrate' })
	}


	sendSaveConfigCommand() {
		this.$store.dispatch('server/addEvent', { message: 'SAVE_CONFIG', type: 'command' })
		this.$socket.emit('printer.gcode.script', { script: 'SAVE_CONFIG' }, { loading: 'topbarSaveConfig' })
	}



	sendSaveDistsCommand() {
		/// save to moonraker db
		/// for each field in fields fetch the request with post value will be field.value and key will be field.label
		for (const field of this.fields) {
			var response = fetch(this.dbUrl(field.label, field.value.toString()), { method: 'POST' });
			console.log(response);
		}

		//this.$store.dispatch('server/addEvent', { message: `DELTA_ANALYZE CENTER_DISTS=${this.a_dist},${this.far_c_dist},${this.b_dist},${this.far_a_dist},${this.c_dist},${this.far_c_dist}`, type: 'command' })
		//thiTheSidebars.$socket.emit('printer.gcode.script', { script: `DELTA_ANALYZE CENTER_DISTS=${this.a_dist},${this.far_c_dist},${this.b_dist},${this.far_a_dist},${this.c_dist},${this.far_c_dist}` }, { loading: 'TrilabWizardDeltaNext' })

	}

	sendSaveFarsCommand() {
		for (const field of this.far_fields) {
			var response = fetch(this.dbUrl(field.label, field.value.toString()), { method: 'POST' });
			console.log(response);
		}
		//this.$store.dispatch('server/addEvent', { message: `DELTA_ANALYZE OUTER_DISTS=${this.a_to_far_c},${this.far_c_to_b},${this.b_to_far_a},${this.far_a_to_c},${this.c_to_far_b},${this.far_b_to_a}`, type: 'command' })
		//this.$socket.emit('printer.gcode.script', { script: `DELTA_ANALYZE OUTER_DISTS=${this.a_to_far_c},${this.far_c_to_b},${this.b_to_far_a},${this.far_a_to_c},${this.c_to_far_b},${this.far_b_to_a}` }, { loading: 'TrilabWizardDeltaNext' })
	}
	sendSavePillarsCommand() {
		for (const field of this.pillarFields) {
			var response = fetch(this.dbUrl(field.label, field.value.toString()), { method: 'POST' });
			console.log(response);
		}
		//this.$store.dispatch('server/addEvent', { message: `DELTA_ANALYZE CENTER_PILLAR_WIDTHS=${this.center_pillar_a},${this.center_pillar_b},${this.center_pillar_c}`, type: 'command' })
		//this.$socket.emit('printer.gcode.script', { script: `DELTA_ANALYZE CENTER_PILLAR_WIDTHS=${this.center_pillar_a},${this.center_pillar_b},${this.center_pillar_c}` })
	}

	sendSaveOuterPillarsCommand() {
		for (const field of this.outerPillarFields) {
			var response = fetch(this.dbUrl(field.label, field.value.toString()), { method: 'POST' });
			console.log(response);
		}
		//this.$store.dispatch('server/addEvent', { message: `DELTA_ANALYZE OUTER_PILLAR_WIDTHS=${this.pillar_a},${this.far_c},${this.pillar_b},${this.far_a},${this.pillar_c},${this.far_b}`, type: 'command' })
		//this.$socket.emit('printer.gcode.script', { script: `DELTA_ANALYZE OUTER_PILLAR_WIDTHS=${this.pillar_a},${this.far_c},${this.pillar_b},${this.far_a},${this.pillar_c},${this.far_b}` })
	}
	sendSaveScaleCommand() {
		var response = fetch(this.dbUrl("scaleFactor", this.scaleFactor.toString()), { method: 'POST' });
	}

	getField(label: string): any {
		for (const field of this.fields) {
			if (field.label == label) {
				return field.value;
			}
		}
	}
	getFarField(label: string): any {
		for (const field of this.far_fields) {
			if (field.label == label) {
				return field.value;
			}
		}
	}
	getPillarField(label: string): any {
		for (const field of this.pillarFields) {
			if (field.label == label) {
				return field.value;
			}
		}
	}
	getOuterPillarField(label: string): any {
		for (const field of this.outerPillarFields) {
			if (field.label == label) {
				return field.value;
			}
		}
	}
	async sendCalibrateCommand() {
		this.sendCalibrateCommandEnabled = false;


		let center_dists = `DELTA_ANALYZE CENTER_DISTS=${this.getField('a_dist')},${this.getField('far_c_dist')},${this.getField('b_dist')},${this.getField('far_a_dist')},${this.getField('c_dist')},${this.getField('far_c_dist')}`;
		let outer_dists = `DELTA_ANALYZE OUTER_DISTS=${this.getFarField('a_to_far_c')},${this.getFarField('far_c_to_b')},${this.getFarField('b_to_far_a')},${this.getFarField('far_a_to_c')},${this.getFarField('c_to_far_b')},${this.getFarField('far_b_to_a')}`;
		let center_pillar_widths = `DELTA_ANALYZE CENTER_PILLAR_WIDTHS=${this.getPillarField('center_pillar_a')},${this.getPillarField('center_pillar_b')},${this.getPillarField('center_pillar_c')}`;
		let outer_pillar_widths = `DELTA_ANALYZE OUTER_PILLAR_WIDTHS=${this.getOuterPillarField('pillar_a')},${this.getOuterPillarField('far_c')},${this.getOuterPillarField('pillar_b')},${this.getOuterPillarField('far_a')},${this.getOuterPillarField('pillar_c')},${this.getOuterPillarField('far_b')}`;
		let scale = `DELTA_ANALYZE SCALE=${this.scaleFactor}`;

		console.log(center_dists);
		console.log(outer_dists);
		console.log(center_pillar_widths);
		console.log(outer_pillar_widths);


		await this.$store.dispatch('server/addEvent', { message: center_dists, type: 'command' })
		await this.$socket.emit('printer.gcode.script', { script: center_dists }, { loading: 'TrilabWizardDeltaNext' })

		await this.$store.dispatch('server/addEvent', { message: outer_dists, type: 'command' })
		await this.$socket.emit('printer.gcode.script', { script: outer_dists }, { loading: 'TrilabWizardDeltaNext' })

		await this.$store.dispatch('server/addEvent', { message: center_pillar_widths, type: 'command' })
		await this.$socket.emit('printer.gcode.script', { script: center_pillar_widths })

		await this.$store.dispatch('server/addEvent', { message: outer_pillar_widths, type: 'command' })
		await this.$socket.emit('printer.gcode.script', { script: outer_pillar_widths })

		await this.$store.dispatch('server/addEvent', { message: scale, type: 'command' })
		await this.$socket.emit('printer.gcode.script', { script: scale })



		/// remove all items in database
		this.advancedCalibrationStartTime = Date.now();
		this.advancedCalibrationInProgress = true;
		this.deleteAllItemsInWizardDB();
		this.$store.dispatch('printer/sendGcode', "_advanced_calibrate");
		this.$store.dispatch('gui/gcodehistory/addToHistory', "_advanced_calibrate");
	}


	@Watch('events')
	onEventsChange() {
		/// events
		if(this.advancedCalibrationInProgress == false){return;}
		const events = this.events;
		/// check each event if it includes 'Working on calibration' and from there to up, check if any message includes SAVE_CONFIG, if yes, advancedCalibrationInProgress to false and snackbar advanced calibration completed

		for (let i = 0; i < events.length; i++) {
			if (events[i].message.includes("Working on calibration")) {
				for (let j = i; j >= 0; j--) {

					if (events[j].message.includes("SAVE_CONFIG")) {
						this.advancedCalibrationInProgress = false;
						fetch(this.dbUrl("advanced_calibration_finished_alert", "1"), { method: 'POST' });
						alert("Kalibrace dokončena");
						return;
					}
				}
			}
		}
		
	}


    get events() {
        return this.$store.getters['server/getConsoleEvents'](false, 50);
    }



	resetWizard() {
		this.step = 0;
		this.basicDeltaCalibrationDone = false;
		this.testPrintDone = false;
		this.sendCalibrateCommandEnabled = false;
		this.prevBtnEnabled = true;
		this.nextBtnEnabled = true;

		for (const field of this.fields) {
			field.value = "";
		}
		for (const field of this.far_fields) {
			field.value = "";
		}
		for (const field of this.pillarFields) {
			field.value = "";
		}
		for (const field of this.outerPillarFields) {
			field.value = "";
		}

	}


	deleteAllItemsInWizardDB() {
		/// delete all items in database
		for (const field of this.fields) {
			let response = fetch(this.dbUrl(field.label), { method: 'DELETE' });
			console.log(response);
		}
		for (const field of this.far_fields) {
			let response = fetch(this.dbUrl(field.label), { method: 'DELETE' });
			console.log(response);
		}
		for (const field of this.pillarFields) {
			let response = fetch(this.dbUrl(field.label), { method: 'DELETE' });
			console.log(response);
		}
		for (const field of this.outerPillarFields) {
			let response = fetch(this.dbUrl(field.label), { method: 'DELETE' });
			console.log(response);
		}
		fetch(this.dbUrl("step"), { method: 'DELETE' });
		fetch(this.dbUrl("basicDeltaDone"), { method: 'DELETE' });
		fetch(this.dbUrl("testPrintDone"), { method: 'DELETE' });
	}

	skipStep() {
		if (confirm("Opravdu chcete přeskočit tento krok? Provedení tohoto kroku nevadí, pokud již tato akce byla provedena")) {
			this.step = this.step + 1;
		}
	}

}
</script>
