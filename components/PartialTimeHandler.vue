<template>
    <div class="form_flex" v-if="enabled" :data-vv-scope="`time_form_${unique}`">
        <div v-if="$parent.showCloser" class="form_close alternate" @click="removeImage()"></div>
        <div class="form_group flex alternate">
            <label>Start Time<span>*</span></label>
            <div class="form_flex_input">
                <input type="text" name="start_time_hour[]" class="default_text" autocomplete="off" v-model="form.start.hour" maxlength="2" v-validate="'required|numeric|max_value:12|min_value:0'">
                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_time_hour[]')">{{ errors.first('start_time_hour[]') | properFormat }}</span></transition>
            </div>
            <div class="form_flex_separator">:</div>
            <div class="form_flex_input">
                <input type="text" name="start_time_minutes[]" class="default_text" autocomplete="off" v-model="form.start.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_time_minutes[]')">{{ errors.first('start_time_minutes[]') | properFormat }}</span></transition>
            </div>
            <div class="form_flex_input">
                <input type="text" name="start_convention[]" class="default_text number no_click" readonly autocomplete="off" v-model="form.start.convention" v-validate="'required'">
                <div class="up" @click="changeConvention('start')"></div>
                <div class="down" @click="changeConvention('start')"></div>
                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_convention[]')">{{ errors.first('start_convention[]') | properFormat }}</span></transition>
            </div>
        </div>
        <div class="form_group flex alternate">
            <label>End Time<span>*</span></label>
            <div class="form_flex_input">
                <input type="text" name="end_time_hour[]" class="default_text" autocomplete="off" v-model="form.end.hour" maxlength="2" v-validate="'required|numeric|max_value:12|min_value:0'">
                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_time_hour[]')">{{ errors.first('end_time_hour[]') | properFormat }}</span></transition>
            </div>
            <div class="form_flex_separator">:</div>
            <div class="form_flex_input">
                <input type="text" name="end_time_minutes[]" class="default_text" autocomplete="off" v-model="form.end.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_time_minutes[]')">{{ errors.first('end_time_minutes[]') | properFormat }}</span></transition>
            </div>
            <div class="form_flex_input">
                <input type="text" name="end_convention[]" class="default_text number no_click" readonly autocomplete="off" v-model="form.end.convention" v-validate="'required'">
                <div class="up" @click="changeConvention('end')"></div>
                <div class="down" @click="changeConvention('end')"></div>
                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_convention[]')">{{ errors.first('end_convention[]') | properFormat }}</span></transition>
            </div>
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
                    start: {
                        hour: '-',
                        mins: '-',
                        convention: 'AM'
                    },
                    end: {
                        hour: '-',
                        mins: '-',
                        convention: 'PM'
                    }
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
            removeImage () {
                let me = this
                if (me.$parent.times.length > 1) {
					me.enabled = false
					me.$parent.determineIfShowCloser()
				}
            },
            changeConvention (type) {
                const me = this
                if (type == ' start') {
                    me.form.start.convention = (me.form.start.convention == 'AM') ? 'PM' : 'AM'
                } else {
                    me.form.end.convention = (me.form.end.convention == 'AM') ? 'PM' : 'AM'
                }
            }
        }
    }
</script>
