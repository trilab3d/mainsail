<template>
  <v-dialog v-model="showp" max-width="400px">
    <v-card>
      <v-card-title class="headline">Service Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field v-model="username" v-if="false" label="Username" outlined></v-text-field>
          <v-text-field v-model="password" label="Password" outlined type="password"></v-text-field>
          <v-btn text @click="$emit('close')">Cancel</v-btn>
        </v-form>
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


  username = '';
  correctPasswordHash = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
  password: string = '';
  computeHash(inputval: string) {
    return SHA256(inputval).toString();
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

}
</script>
  
<style scoped>
/* Adjust the styles as per your design */
.v-dialog--active {
  transition: opacity 0.3s ease-in-out;
}
</style>
