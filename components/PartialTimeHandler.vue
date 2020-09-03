<template>
    <div class="form_flex" v-if="enabled" :data-vv-scope="`time_form_${unique}`">
        <div v-if="$parent.showCloser" class="form_close alternate" @click="removeImage()"></div>
        <div class="form_group">
            <label for="start_time">Start Time <span>*</span></label>
            <v-ctk v-model="form.start_time" :only-time="true" :format="'hh:mm A'" :formatted="'hh:mm A'" :no-label="true" :color="'#33b09d'" :id="'start_time'" :name="'start_time[]'" :label="'Select start time'" @input="getFrom($event)" :data-vv-name="`time_form_${unique}.start_time[]`" v-validate="'required'"></v-ctk>
            <transition name="slideY"><span class="validation_errors" v-if="errors.has(`time_form_${unique}.start_time[]`)">{{ properFormat(errors.first(`time_form_${unique}.start_time[]`)) }}</span></transition>
        </div>
        <div class="form_group">
            <label for="end_time">End Time <span>*</span></label>
            <v-ctk v-model="form.end_time" :only-time="true" :format="'hh:mm A'" :formatted="'hh:mm A'" :no-label="true" :color="'#33b09d'" :id="'end_time'" :name="'end_time[]'" :min="form.end_time" :min-date="form.end_time" :label="'Select end time'" @input="checkTime()" :data-vv-name="`time_form_${unique}.end_time[]`" v-validate="'required'" :class="`${(form.hasTimeFrom) ? '' : 'disabled'}`"></v-ctk>
            <transition name="slideY"><span class="validation_errors" v-if="errors.has(`time_form_${unique}.end_time[]`) && !form.lowerThanStart">{{ properFormat(errors.first(`time_form_${unique}.end_time[]`)) }}</span></transition>

            <transition name="slideY"><span class="validation_errors" v-if="form.lowerThanStart">The End Time field is required</span></transition>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            unique: {
                default: 0
            }
        },
        data () {
            return {
                form: {
                    start_time: '',
                    end_time: '',
                    min_time: '',
                    lowerThanStart: false,
                    hasTimeFrom: false,
                },
                enabled: true
            }
        },
        inject: ['$validator'],
        methods: {
            getFrom (event) {
                const me = this
                let target = event
                me.form.min_time = target
                me.form.hasTimeFrom = true
            },
            removeImage () {
                let me = this
                if (me.$parent.times.length > 1) {
					me.enabled = false
					me.$parent.determineIfShowCloser()
				}
            },
            checkTime () {
                const me = this
                if (me.$moment(`${me.$parent.$parent.targetDate} ${me.form.end_time}`).diff(me.$moment(`${me.$parent.$parent.targetDate} ${me.form.start_time}`), 'seconds') < 0) {
                    me.form.lowerThanStart = true
                } else {
                    me.form.lowerThanStart = false
                }
            },
            changeConvention (type) {
                const me = this
                if (type == 'start') {
                    me.form.start.convention = (me.form.start.convention == 'AM') ? 'PM' : 'AM'
                } else {
                    me.form.end.convention = (me.form.end.convention == 'AM') ? 'PM' : 'AM'
                }
            }
        }
    }
</script>
