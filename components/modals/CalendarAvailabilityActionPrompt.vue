<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose(false)"></div>
        <form id="default_form" class="overlay" @submit.prevent="submit()">
            <div class="modal_wrapper">
                <h2 class="form_title alt">{{ $moment(targetDate, 'YYYY-MM-D').format('ddd, MMM DD, YYYY') }}</h2>
                <div class="modal_main_group">

                    <partial-time-handler-container ref="timePicker" v-if="availabilityStatus == 'partially-available'" />

                    <div class="form_btn_action" v-if="availabilityStatus == 'partially-available'">
                        <div class="btn">
                            <div class="action_btn" @click="addMultiple()"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add Another Time Slot</div>
                        </div>
                    </div>

                    <div class="form_flex">
                        <div class="form_group">
                            <label for="repetition">Repetition</label>
                            <select :class="`default_select alternate ${(form.hasRepeat) ? '' : 'disabled'}`" v-validate="{ required: (form.hasRepeat) ? true : false }" name="repetition" v-model="form.repetition">
                                <option value="" selected disabled>Choose a Repetition</option>
                                <option value="every-day">Every Day</option>
                                <option value="every-week">Every Week</option>
                                <option value="every-month">Every Month</option>
                            </select>
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('repetition')">{{ properFormat(errors.first('repetition')) }}</span></transition>
                        </div>
                        <div class="form_group">
                            <label for="end_date">End Date</label>
                            <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-button="true" :no-label="true" :class="`${(form.hasRepeat) ? '' : 'disabled'}`" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :min-date="$moment(targetDate, 'YYYY-MM-D').format('YYYY-MM-DD')" :label="'Select end date'" v-validate="`${(form.repetition != '') ? 'required' : '' }`"></v-ctk>
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check">
                                <input type="checkbox" id="repeat" name="repeat" class="action_check" v-model="form.hasRepeat">
                                <label for="repeat">Repeat</label>
                            </div>
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose(true)">Go Back</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Add Availability</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import PartialTimeHandlerContainer from '../PartialTimeHandlerContainer'
    export default {
        components: {
            PartialTimeHandlerContainer
        },
        props: {
            targetDate: {
                default: null
            },
            availabilityStatus: {
                default: 'available'
            }
        },
        data () {
            return {
                form: {
                    end_date: '',
                    repetition: '',
                    hasRepeat: false
                }
            }
        },
        methods: {
            /**
             * [addMultiple add images or variants or timepicker]
             * @param {[string]} type [type of method]
             */
            addMultiple (type) {
                const me = this
                setTimeout( () => {
                    me.$refs.timePicker.addImage()
                }, 10)
            },
            toggleClose (status) {
                const me = this
                if (status) {
                    me.$store.state.calendarAvailabilityActionStatus = false
                    me.$store.state.bookerMenuPromptStatus = true
                } else {
                    me.$store.state.calendarAvailabilityActionStatus = false
                    document.body.classList.remove('no_scroll')
                }
            },
            submit () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        me.$store.state.calendarAvailabilityPromptStatus = true
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            }
        }
    }
</script>
