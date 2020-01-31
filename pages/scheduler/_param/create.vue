<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link :to="`/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Create a Schedule</h1>
                </div>
            </section>
            <section id="content">
                <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                    <div class="form_wrapper">
                        <div class="form_header_wrapper">
                            <h2 class="form_title">{{ $moment(parseInt($route.params.param)).format('MMMM D, YYYY (ddd)') }}</h2>
                            <div class="form_check toggler" @click="isPrivate ^= true">
                                <input type="hidden" id="private_class" name="private_class" class="action_check" :value="(isPrivate) ? 1 : 0">
                                <div :class="`toggle ${(isPrivate) ? 'active' : ''}`"></div>
                                <label for="private_class">Private Class</label>
                            </div>
                        </div>
                        <div class="form_main_group">
                            <div class="form_flex">
                                <div class="form_group flex alternate">
                                    <label>Start Time<span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="start_time_hour" class="default_text" autocomplete="off" v-model="form.start.hour" maxlength="2" v-validate="'required|numeric|max_value:12|min_value:0'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_time_hour')">{{ errors.first('start_time_hour') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_flex_separator">:</div>
                                    <div class="form_flex_input">
                                        <input type="text" name="start_time_minutes" class="default_text" autocomplete="off" v-model="form.start.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_time_minutes')">{{ errors.first('start_time_minutes') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <input type="text" name="start_convention" class="default_text number no_click" autocomplete="off" v-model="form.start.convention" v-validate="'required'">
                                        <div class="up" @click="changeConvention()"></div>
                                        <div class="down" @click="changeConvention()"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_convention')">{{ errors.first('start_convention') | properFormat }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group">
                                    <label for="peak_type">Peak Type <span>*</span></label>
                                    <select class="default_select alternate" name="peak_type" v-validate="'required'">
                                        <option value="" selected disabled>Choose a Peak</option>
                                        <option value="peak">Peak</option>
                                        <option value="non-peak">Non-Peak</option>
                                    </select>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('peak_type')">{{ errors.first('peak_type') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="class_type_id">Class Type <span>*</span></label>
                                    <select class="default_select alternate" name="class_type_id" v-validate="'required'" @change="getClassLength($event)">
                                        <option value="" selected disabled>Select a Class Type</option>
                                        <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                    </select>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('class_type_id')">{{ errors.first('class_type_id') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="temp_class_length">Class Length</label>
                                    <input type="text" name="temp_class_length" autocomplete="off" class="default_text disabled" v-model="form.classLengthTemp">
                                </div>
                            </div>
                            <div class="form_group">
                                <label for="description">Description <span>*</span></label>
                                <input type="text" name="description" autocomplete="off" class="default_text" v-validate="'required|max:200'">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('description')">{{ errors.first('description') | properFormat }}</span></transition>
                            </div>
                            <transition name="fade">
                                <div class="form_group" v-if="isPrivate">
                                    <label for="occassion">Occassion <span>*</span></label>
                                    <input type="text" name="occassion" autocomplete="off" class="default_text" v-validate="'required|max:70'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('occassion')">{{ errors.first('occassion') | properFormat }}</span></transition>
                                </div>
                            </transition>
                            <transition name="fade">
                                <div class="form_flex select_all" v-if="!isPrivate">
                                    <label class="flex_label alternate">Restrict class to customer types: <span>*</span></label>
                                    <div class="form_check select_all">
                                        <div :class="`custom_action_check ${(checkData) ? 'checked' : ''}`" @click.prevent="toggleSelectAll($event)">Select All</div>
                                    </div>
                                    <div class="form_check" v-for="(customerType, key) in customerTypes" :key="key">
                                        <input type="checkbox" :id="`data_${key}`" name="customer_type_restriction" class="action_check" v-model="customerType.checked">
                                        <label :for="`data_${key}`">{{ customerType.name }}</label>
                                    </div>
                                    <transition name="slide"><span class="validation_errors" v-if="hasCustomerTypes">The Type field is required</span></transition>
                                </div>
                            </transition>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="instructor_id">Instructor <span>*</span></label>
                                    <select class="default_select alternate" name="instructor_id" v-validate="'required'" v-model="form.instructor_id">
                                        <option value="" selected disabled>Select an Instructor</option>
                                        <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                    </select>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('instructor_id')">{{ errors.first('instructor_id') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="substitute_instructor_id">Substitute Instructor <span>*</span></label>
                                    <select :class="`default_select alternate ${(form.instructor_id != '') ? '' : 'disabled'}`" name="substitute_instructor_id" v-validate="'required'">
                                        <option value="" selected disabled>Select an Instructor</option>
                                        <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key" v-if="form.instructor_id != instructor.id">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                    </select>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('substitute_instructor_id')">{{ errors.first('substitute_instructor_id') | properFormat }}</span></transition>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group" v-if="isPrivate">
                                    <label for="no_of_riders">No. of Riders <span>*</span></label>
                                    <input type="text" name="no_of_riders" autocomplete="off" class="default_text" v-validate="'required|numeric|min_value:1|max_value:99'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('no_of_riders')">{{ errors.first('no_of_riders') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group flex">
                                    <label for="class_credits">Credits to Deduct <span>*</span></label>
                                    <div class="form_flex_input full">
                                        <input type="text" name="class_credits" autocomplete="off" v-model="form.credits" class="default_text" v-validate="'required|numeric|min_value:1|max_value:9'">
                                        <div class="up" @click="addCount()"></div>
                                        <div class="down" @click="subtractCount()"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('class_credits')">{{ errors.first('class_credits') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                            <div class="form_group">
                                <div class="form_check">
                                    <input type="checkbox" id="featured" name="featured" class="action_check">
                                    <label for="featured">Add to featured classes</label>
                                </div>
                            </div>
                            <div class="form_group">
                                <div class="form_check">
                                    <input type="checkbox" id="repeat" name="repeat" class="action_check" @change="isRepeat ^= true">
                                    <label for="repeat">Repeat</label>
                                </div>
                            </div>
                            <transition name="fade">
                                <div class="form_flex" v-if="isRepeat">
                                    <div class="form_group">
                                        <label for="repetition">Repetition <span>*</span></label>
                                        <select class="default_select alternate" name="repetition" v-validate="'required'">
                                            <option value="" selected disabled>Choose a Repetition</option>
                                            <option value="every-day">Every Day</option>
                                            <option value="every-week">Every Week</option>
                                            <option value="every-month">Every Month</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('repetition')">{{ errors.first('repetition') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="end_date">End Date <span>*</span></label>
                                        <input type="date" name="end_date" autocomplete="off" class="default_text date" :min="$moment().add(1, 'd').format('YYYY-MM-DD')" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <nuxt-link :to="`/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>
        </div>
        <transition name="fade">
            <scheduler-repeat-prompt v-if="$store.state.schedulerRepeatPromptStatus" :message="message" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import SchedulerRepeatPrompt from '../../../components/modals/SchedulerRepeatPrompt'
    import Foot from '../../../components/Foot'
    export default {
        components: {
            SchedulerRepeatPrompt,
            Foot
        },
        data () {
            return {
                message: '',
                hasCustomerTypes: false,
                isRepeat: false,
                isPrivate: false,
                lastRoute: '',
                classTypes: [],
                customerTypes: [],
                instructors: [],
                form: {
                    start: {
                        hour: '-',
                        mins: '-',
                        convention: 'AM'
                    },
                    classLengthTemp: '',
                    classLength: '',
                    instructor_id: '',
                    credits: 0
                }
            }
        },
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        let lastValue = ''
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
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
            }
        },
        computed: {
            checkData () {
                const me = this
                let count = 0
                let result = false
                me.customerTypes.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.customerTypes.length) {
                    result = true
                } else {
                    result = false
                }
                return result
            }
        },
        methods: {
            addCount () {
                const me = this
                let data
                data = parseInt(me.form.credits)
                if (data != 9) {
                    data != 0 && (me.form.credits = 0)
                    me.form.credits = (data += 1)
                }
            },
            subtractCount () {
                const me = this
                let data
                data = parseInt(me.form.credits)
                data > 0 && (me.form.credits = (data -= 1))
            },
            getClassLength (event) {
                const me = this
                let target = event.target.value
                me.$axios.get(`api/packages/class-types/${target}`).then(res => {
                    if (res.data) {
                        me.form.classLength = res.data.classType.class_length
                        me.form.classLengthTemp = `${res.data.classType.class_length.split('+')[1].split(':')[0]} hrs, ${res.data.classType.class_length.split('+')[1].split(':')[1]} mins`
                    }
                })
            },
            toggleSelectAll (event) {
                const me = this
                if (me.checkData) {
                    me.customerTypes.forEach((data, index) => {
                        data.checked = false
                        me.hasCustomerTypes = true
                    })
                } else {
                    me.customerTypes.forEach((data, index) => {
                        data.checked = true
                        me.hasCustomerTypes = false
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            changeConvention () {
                const me = this
                me.form.start.convention = (me.form.start.convention == 'AM') ? 'PM' : 'AM'
            },
            submissionSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.customerTypes.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.hasCustomerTypes = (ctr > 0) ? false : true
                    if (valid && !me.hasCustomerTypes) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('start_time', `${me.form.start.hour}:${me.form.start.mins} ${me.form.start.convention}`)
                        formData.append('date', me.$moment(parseInt(me.$route.params.param)).format('YYYY-M-D'))
                        formData.append('customer_type_restrictions', JSON.stringify(me.customerTypes))
                        formData.append('studio_id', me.$store.state.user.current_studio_id)
                        formData.append('class_length', me.form.classLength)
                        me.loader(true)
                        me.$axios.post('api/schedules', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$router.push(`/${me.lastRoute}`)
                                }
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        if (valid && me.hasCustomerTypes) {
                            let formData = new FormData(document.getElementById('default_form'))
                            formData.append('start_time', `${me.form.start.hour}:${me.form.start.mins} ${me.form.start.convention}`)
                            formData.append('date', me.$moment(parseInt(me.$route.params.param)).format('YYYY-M-D'))
                            formData.append('customer_type_restrictions', JSON.stringify(me.customerTypes))
                            formData.append('studio_id', me.$store.state.user.current_studio_id)
                            formData.append('class_length', me.form.classLength)
                            me.loader(true)
                            me.$axios.post('api/schedules', formData).then(res => {
                                setTimeout( () => {
                                    if (res.data) {
                                        me.notify('Content has been Added')
                                    } else {
                                        me.$store.state.errorList.push('Sorry, Something went wrong')
                                        me.$store.state.errorStatus = true
                                    }
                                }, 500)
                            }).catch(err => {
                                me.$store.state.errorList = err.response.data.errors
                                me.$store.state.errorStatus = true
                            }).then(() => {
                                setTimeout( () => {
                                    if (!me.$store.state.errorStatus) {
                                        me.$router.push(`/${me.lastRoute}`)
                                    }
                                    me.loader(false)
                                }, 500)
                            })
                        } else {
                            me.$scrollTo('.validation_errors', {
                                offset: -250
                            })
                        }
                    }
                })
            },
            fetchTypes () {
                const me = this
                me.$axios.get('api/packages/class-types').then(res => {
                    me.classTypes = res.data.classTypes.data
                })
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.customerTypes = res.data.customerTypes
                })
                me.$axios.get(`api/instructors?enabled=1&studio_id=${me.$store.state.user.current_studio_id}`).then(res => {
                    me.instructors = res.data.instructors.data
                })
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchTypes()
            }, 150)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
