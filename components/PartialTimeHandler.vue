<template>
    <div class="form_flex" v-if="enabled" :data-vv-scope="`time_form_${unique}`">
        <div v-if="$parent.showCloser" class="form_close alternate" @click="removeImage()"></div>
        <div class="form_group">
            <label for="start_time">Start Time <span>*</span></label>
            <input type="time" name="start_time[]" v-validate="'required'" class="default_text" @change="getFrom($event)">
            <transition name="slideY"><span class="validation_errors" v-if="errors.has('start_time[]')">{{ errors.first('start_time[]') | properFormat }}</span></transition>
        </div>
        <div class="form_group">
            <label for="end_time">End Time <span>*</span></label>
            <input type="time" name="end_time[]" :min="$moment(form.timeTo, 'HH:mm').format('HH:mm')" v-validate="'required'" :class="`default_text ${(form.hasTimeFrom) ? '' : 'disabled'}`">
            <transition name="slideY"><span class="validation_errors" v-if="errors.has('end_time[]')">{{ errors.first('end_time[]') | properFormat }}</span></transition>
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
                    timeTo: '',
                    hasTimeFrom: false,
                },
                enabled: true
            }
        },
        inject: ['$validator'],
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
                }else {
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
            getFrom (event) {
                const me = this
                let target = event.target.value
                me.form.timeTo = target
                me.form.hasTimeFrom = true
            },
            removeImage () {
                let me = this
                if (me.$parent.times.length > 1) {
					me.enabled = false
					me.$parent.determineIfShowCloser()
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
