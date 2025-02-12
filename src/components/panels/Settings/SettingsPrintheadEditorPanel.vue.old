<template>
	<v-card outlined :disabled="this.uiFrozen">
		<v-card-title class="pb-0">
			{{ $t('panel.settingsPrintHeadEditor.caption') }}
			<v-spacer></v-spacer>
			<a v-show="!uiFrozen" href="javascript:void(0)" @click="showResetConfirmation = true" v-if="false">
				<v-icon small class="mr-1">mdi-restore</v-icon> {{ $t('panel.settingsGeneral.factoryReset') }}
			</a>
		</v-card-title>

		<v-card-text>
			<v-row>
				<v-col cols="6">
					<upload-btn @uploadComplete="addPrinthead" :multiple="false" requireFileStartingWith="config-head" :directory="'0:/sys/'" block class="" :elevation="1" target="printHead" color="success"></upload-btn>
				</v-col>
				<v-col cols="6">
					<v-btn block color="error" :disabled="this.removeButtonDisabled"  @click="showconfirm()">Remove</v-btn>
				</v-col>
			</v-row>
			<div class="d-flex">
				<v-select @change="loadPrintHeadContents()" v-model="selectedHead" :items="items" item-text="name"
				item-value="number" return-object v-bind:label="$t('panel.settingsPrintHeadEditor.selectPrinthead')"></v-select>
			</div>
			<v-text-field label="Name" v-model="selectedHead.name"></v-text-field>
			<v-textarea :readonly="true" label="Contents" v-model="headContent"></v-textarea>
			<v-btn block color="success" @click="saveContents()">Save</v-btn>
		</v-card-text>
		<confirm-dialog :title="$t('dialog.accessoriesPrinthead.title')" :prompt="$t('dialog.accessoriesPrinthead.prompt', [this.selectedHead.name])" :shown.sync="showReloadPrompt" @confirmed="remove"/>

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
			return this.heads;
		},
		removeButtonDisabled(){
			if('number' in this.selectedHead == true && this.uiFrozen == false){
				return  false;
			}
			return true;
		}
	},
	data() {
		return {
			showReloadPrompt: false,
			selectedHead : { name: ""},
			headContent : "",
			pass: "",
			confPass: "",
		}
	},
	methods:{
		...mapActions('machine', ['download', "sendCode"]),
		...mapMutations('machine/model', ['addHead', 'removeHead']),
		async loadPrintHeadContents(){
			console.log(this.selectedHead);
			let result = await this.download({filename: "0:/sys/" + this.selectedHead.config, type:"text"})
			let notes = this.selectedHead.config;
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
			if('number' in this.selectedHead == false){
				this.$makeNotification('error', "Error", "Please select a printhead first");
				return;
			}
			this.sendCode('M1810 P' + this.selectedHead.number + ' S"' + this.selectedHead.name + '" C"' + this.selectedHead.config + '"');
		},
		addPrinthead(files){
			console.log(files);
			console.log("addprintheadcalled");
			let file = files[0];
			let newnum = 0;
			for (let i = 0; i < this.heads.length; i++){
				if(this.heads[i].number > newnum){
					newnum = this.heads[i].number;
				}
			}
			newnum += 1;
			this.headContent = "";
			let obj = {name: "New Printhead " + newnum, number: newnum, config: file.name};
			this.addHead(obj);
			this.selectedHead = obj;
			this.saveContents();

		},
		remove(){
			this.removeHead(this.selectedHead)
			this.sendCode('M1810 P' + this.selectedHead.number + ' D');
			this.$makeNotification('success', "Success", "Printhead deleted!");
			this.showReloadPrompt = false;
		}
	}
}
</script>
