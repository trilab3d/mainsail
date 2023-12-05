<template>
    <div>
        <v-card elevation="0">
            <v-card-text>
                <!--- foreach in filaments --->

                <v-row>
                    <v-col v-for="(elem, index) in allowedFilaments" :key="index" cols="6">
                        <v-btn block color="orange" class="btnGrid"
                            @click="selectedFilament = elem; selectDialogConfirmation = true">{{ elem.title }}</v-btn>
                    </v-col>
                </v-row>

            </v-card-text>
        </v-card>
        <!--- just a confirm dialog really select filament xxx? --->

        <v-dialog v-model="selectDialogConfirmation" max-width="400px">
            <v-card>
                <v-card-title class="headline">{{ $t("Trilab.TrilabSelectFilamentDialog.Cpnfirm") }}</v-card-title>
                <v-card-text>
                    <p>{{ $t("Trilab.TrilabSelectFilamentDialog.AreYouSureYouWantToSelectFilament") }} {{
                        selectedFilament.title }}?</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="selectDialogConfirmation = false">{{
                        $t("Trilab.TrilabSelectFilamentDialog.Cancel") }}</v-btn>
                    <v-btn color="green darken-1" text
                        @click="selectDialogConfirmation = false; selectFilament(selectedFilament)">{{
                            $t("Trilab.TrilabSelectFilamentDialog.OK") }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
    
<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import TrilabMixin from '@/components/mixins/trilab';
@Component
export default class TrilabServiceDialog extends Mixins(TrilabMixin) {
    @Prop({ required: false, default: false })
    declare showp: boolean
    @Prop({ required: false, default: 'Select a filament' })
    declare titleString: string


    public selectedFilament: any = {};


    public selectDialogConfirmation: boolean = false;
    public maxTemp = 0;

    public filaments = [
        {
            title: "PLA",
            bed: 55,
            extruder: 230,
            chamber: 0,
            flap: 1,
        },
        {
            title: "PETG",
            bed: 70,
            extruder: 250,
            chamber: 0,
            flap: 1,
        },
        {
            title: "ABS",
            bed: 100,
            extruder: 260,
            chamber: 70,
            flap: 0,
        },
        {
            title: "ASA",
            bed: 100,
            extruder: 260,
            chamber: 70,
            flap: 0
        },
        {
            title: "PA",
            bed: 100,
            extruder: 260,
            chamber: 50,
            flap: 0,
        },
        {
            title: "PC",
            bed: 105,
            extruder: 280,
            chamber: 70,
            flap: 0
        },
        {
            title: "PC-CF",
            bed: 100,
            extruder: 280,
            chamber: 0,
            flap: 0
        },
        {
            title: "FLEX",
            bed: 55,
            extruder: 240,
            chamber: 0,
            flap: 1
        },
        {
            title: "PEKK",
            bed: 140,
            extruder: 380,
            chamber: 80,
            flap: 0
        },
        {
            title: "PEEK",
            bed: 150,
            extruder: 400,
            chamber: 80,
            flap: 0
        },
        {
            title: "PEI 1010",
            bed: 150,
            extruder: 400,
            chamber: 80,
            flap: 0
        },
        {
            title: "PEI 9085",
            bed: 150,
            extruder: 360,
            chamber: 80,
            flap: 0
        },
        {
            title: "PSU",
            bed: 130,
            extruder: 340,
            chamber: 70,
            flap: 0
        },
        {
            title: "PPS",
            bed: 130,
            extruder: 340,
            chamber: 70,
            flap: 0
        },
        {
            title: "PPSU",
            bed: 140,
            extruder: 360,
            chamber: 80,
            flap: 0
        },
        {
            title: "PES",
            bed: 150,
            extruder: 360,
            chamber: 80,
            flap: 0
        }
    ]


    get allowedFilaments() {
        return this.filaments.filter((elem) => {
            return elem.extruder <= this.maxTemp;
        })
    }

    get isDialogVisible() {
        return this.showp;
    }
    set isDialogVisible(value) {
        if (!value) {
            this.$emit('close', value);
            this.showp = false;
        }
    }


    localShowSelectFilamentDialog: boolean = false;
    created() {
        this.localShowSelectFilamentDialog = this.showp; // Initialize localShowp in the created hook
        this.maxTemp = (this.$store.state.printer.configfile?.settings["extruder"]?.max_temp ?? 210) - 10;
    }

    selectFilament(filamentObj: any) {
        this.$emit('selectFilament', filamentObj);
    }





}
</script>
    
<style scoped>
/* Adjust the styles as per your design */
.v-dialog--active {
    transition: opacity 0.3s ease-in-out;
}
</style>
  