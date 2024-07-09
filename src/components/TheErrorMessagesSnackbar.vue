<template>
    <v-snackbar v-model="show" color="red" :timeout="-1" fixed right bottom dark elevation="24" class="mt-12">
        {{ currentText }}
        <template v-slot:action="{ attrs }">
            <v-btn color="red" v-bind="attrs" @click="pop()">
                X
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Mixins, Watch } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import { mdiClose } from '@mdi/js'

@Component({
    components: {},
})
export default class TheErrorMessagesSnackbar extends Mixins(BaseMixin) {
    mdiClose = mdiClose

    public lastDisplayDate = new Date().getTime();
    //public lastDisplayDate = 0;
    public queue = [] as any[]

    pop() {
        this.queue.shift();
    }

    get show() {
        return this.queue.length > 0;
    }
    get currentText() {
        if (this.queue.length < 1) return '';
        var dateFormatted = this.formatTime(this.queue[0].date.getTime(), true);
        return dateFormatted + " : " + this.queue[0].formatMessage;
    }

    getformattedText(event: any){
        var dateFormatted = this.formatTime(event.date.getTime(), true);
        return dateFormatted + " : " + event.formatMessage;
    }

    get events() {
		return this.$store.getters['server/getConsoleEvents'](false, 30);
    }

    @Watch('events')
    onEventsChange() {
        
        console.log("EVENTS CHANGED");
        //const events = this.events;
        //console.log("EVENTS:");
        //console.log(this.events);
        const lastDisplayDate = this.lastDisplayDate;
        const lastDisplayDateIndex = this.events.findIndex((event: any) => event.date.getTime() > lastDisplayDate);
        if (lastDisplayDateIndex === -1) return;

        const lastEvents = this.events.slice(lastDisplayDateIndex);
        const lastErrorEvents = lastEvents.filter((event: any) => event.message.startsWith('!!') || event.message.startsWith('echo'));
        for (const event of lastErrorEvents) {
            if (event.date.getTime() > this.lastDisplayDate) {
                this.lastDisplayDate = event.date.getTime();
            }
            this.$toast.error(this.getformattedText(event));
            //console.log('New event!' + event.message);
            //this.$toast.error(event.message);
            //this.queue.push(event);
        }


    }
    mounted() {
        ///simulate eventsChanged
        this.onEventsChange();
    }
}
</script>
