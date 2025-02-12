<template>
	<v-card outlined :disabled="this.uiFrozen">
		<v-card-title class="pb-0">	
			{{ $t('panel.settingsPrintPadEditor.caption') }}
			<v-spacer></v-spacer>
			<a v-show="!uiFrozen" href="javascript:void(0)" @click="showResetConfirmation = true" v-if="false">
				<v-icon small class="mr-1">mdi-restore</v-icon> {{ $t('panel.settingsGeneral.factoryReset') }}
			</a>
		</v-card-title>

		<v-card-text>
			<v-row>
				<v-col cols="6">
					<upload-btn @uploadComplete="addPrinthead" :multiple="false" requireFileStartingWith="config-head" :directory="'0:/sys/'" block class="" :elevation="1" target="printPad" color="success"></upload-btn>
				</v-col>
				<v-col cols="6">
					<v-btn block color="error" :disabled="this.removeButtonDisabled"  @click="showconfirm()">Remove</v-btn>
				</v-col>
			</v-row>
			<div class="d-flex">
				<v-select @change="loadPrintPadContents()" v-model="selectedPad" :items="items" item-text="name"
				item-value="number" return-object v-bind:label="$t('panel.settingsPrintPadEditor.selectPrintpad')"></v-select>
			</div>
			<v-text-field label="Name" v-model="selectedPad.name"></v-text-field>
			<v-textarea :readonly="true" label="Contents" v-model="headContent"></v-textarea>
			<v-btn block color="success" @click="saveContents()">Save</v-btn>
		</v-card-text>
		<confirm-dialog :title="$t('dialog.accessoriesPrinthead.title')" :prompt="$t('dialog.accessoriesPrintpad.prompt', [this.selectedPad.name])" :shown.sync="showReloadPrompt" @confirmed="remove"/>

</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState('machine/model', ['heads', 'pads']),
		...mapState('trilab', ['settings', 'printPads']),
		...mapGetters(['uiFrozen']),

		items() {
			return this.pads;
		},
		removeButtonDisabled(){
			if('number' in this.selectedPad == true && this.uiFrozen == false){
				return  false;
			}
			return true;
		}
	},
	data() {
		return {
			showReloadPrompt: false,
			selectedPad : { name: ""},
			headContent : "",
		}
	},
	methods:{
		...mapActions('machine', ['download', "sendCode"]),
		...mapMutations('machine/model', ['addPad', 'removePad']),
		async loadPrintPadContents(){
			console.log(this.selectedPad);
			let result = await this.download({filename: "0:/sys/" + this.selectedPad.config, type:"text"})
			let notes = this.selectedPad.config;
			var lines = result.split('\n');
			for(var i = 0;i < lines.length;i++){
    			if (lines[i].startsWith("; "))
					notes = notes + lines[i].substring(2) + '\n';
				else
					break;
			}
			this.headContent = notes;
		},
		showconfirm(){
			this.showReloadPrompt = true;
		},
		saveContents(){
			if('number' in this.selectedPad == false){
				this.$makeNotification('error', "Error", "Please select a printhead first");
				return;
			}
			this.sendCode('M1820 P' + this.selectedPad.number + ' S"' + this.selectedPad.name + '" C"' + this.selectedPad.config + '"');
		},
		addPrinthead(files){
			console.log(files);
			console.log("addprintheadcalled");
			let file = files[0];
			let newnum = 0;
			for (let i = 0; i < this.pads.length; i++){
				if(this.pads[i].number > newnum){
					newnum = this.pads[i].number;
				}
			}
			newnum += 1;
			this.headContent = "";
			let obj = {name: "New Printpad " + newnum, number: newnum, config: file.name, diameter: 0};
			this.addPad(obj);
			this.selectedPad = obj;
			this.saveContents();

		},
		remove(){
			this.removeHead(this.selectedPad)
			this.sendCode('M1820 P' + this.selectedPad.number + ' D');
			this.$makeNotification('success', "Success", "PrintPad deleted!");
			this.showReloadPrompt = false;
		}
	}
}
</script>
