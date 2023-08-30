<template>
  <v-dialog v-model="localShowp" max-width="400px" persistent>
    <v-card>
      <v-card-title class="headline">Service Login</v-card-title>
      <v-card-text>
        <v-text-field v-model="username" v-if="false" label="Username" outlined></v-text-field>
        <v-text-field ref="password" v-model="password" label="Password" outlined type="password"></v-text-field>
        <v-btn text @click="$emit('close')">Cancel</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
  
<script lang="ts">
import BaseMixin from '@/components/mixins/base'
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { SHA256 } from 'crypto-js';
import TrilabMixin from '@/components/mixins/trilab';
@Component
export default class TrilabServiceDialog extends Mixins(TrilabMixin) {
  @Prop({ required: false, default: false })
  declare showp: boolean
  @Prop({ required: false, default: 'service' })
  declare requestedacess: string

  localShowp: boolean = false;
  username = '';
  correctPasswordHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
  password: string = '';
  computeHash(inputval: string) {
    return SHA256(inputval).toString();
  }
  created() {
    this.localShowp = this.showp; // Initialize localShowp in the created hook
  }

  login() {
    console.log('Logging in...');
    if (this.requestedacess === 'service') {
      this.TrilabServiceView = true;
    } else if (this.requestedacess === 'hidden') {
      this.TrilabHiddenView = true;
    }
    this.$emit('close');
  }

  @Watch('password')
  onPasswordChanged(value: string, oldValue: string) {
    if (this.computeHash(value) === this.correctPasswordHash) {
      this.login();
      this.password = '';
    }
  }
  @Watch('showp')
  // Watch for changes in the prop and update the local data property
  onShowpChanged(newVal: any) {
    this.localShowp = newVal;
    if (newVal === true) {
        setTimeout(() => {
            const input = this.$refs.password as HTMLInputElement;
            input.focus();
        }, 100);
    }
  }




}
</script>
  
<style scoped>
/* Adjust the styles as per your design */
.v-dialog--active {
  transition: opacity 0.3s ease-in-out;
}
</style>
