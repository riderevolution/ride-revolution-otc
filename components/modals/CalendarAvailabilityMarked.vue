<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <div class="confirmation_wrapper">
            <h2 class="confirmation_title">Oops!</h2>
            <div class="confirmation_default">
                You have already been scheduled a class on this date. If you still want to change your schedule please contact the admin.
            </div>
            <div class="confirmation_marked">
                <div class="label">Your classes:</div>
                <div class="marked_dates" v-for="(data, key) in schedules" :key="key">
                    <div class="date">{{ data.schedule.studio.name }}, {{ data.schedule.start_time }} - {{ (data.schedule.custom_name != null) ? data.schedule.custom_name : data.schedule.class_type.name }}</div>
                </div>
                <div class="form_group">
                    <label for="remarks">Remarks <span>*</span></label>
                    <textarea name="remarks" rows="3" id="remarks" class="default_text" v-model="form.remarks" v-validate="'required|max:500'" placeholder="Enter your remarks"></textarea>
                    <transition name="slide"><span class="validation_errors" v-if="errors.has('remarks')">{{ errors.first('remarks') | properFormat }}</span></transition>
                </div>
            </div>
            <div class="button_group">
                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                <div class="action_success_btn confirm margin alternate" @click="toggleProceed()">Proceed</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            schedules: {
                default: null
            }
        },
        data () {
            return {
                form: {
                    remarks: ''
                }
            }
        },
        filters: {
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    let nextValue = newValue[0].split('_')
                    if (nextValue.length > 1) {
                        newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                    } else {
                        newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = ''
                        let lastValue = ''
                        if (newValue[0] != 'co' && newValue[0] != 'pa' && newValue[0] != 'ec' && newValue[0] != 'ba') {
                            firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                        for (let i = 1; i < newValue.length; i++) {
                            if (newValue[i] != 'id') {
                                lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                            }
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')
                if (message.length > 1) {
                    message = message[1]
                    return `The ${newValue} field${message}`
                } else {
					if (message[0].split('file').length > 1) {
                        message = message[0].split('file')[1]
                        return `The ${newValue} field${message}`
                    } else {
                        return `The ${newValue}`
                    }
                }
            }
        },
        methods: {
            toggleProceed () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')

                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            toggleClose () {
                const me = this
                me.$store.state.calendarAvailabilityMarkedStatus = false
                document.body.classList.remove('no_scroll')
            }
        }
    }
</script>
