<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
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
                                    <div class="form_group">
                                        <label for="start_time">Start Time <span>*</span></label>
                                        <v-ctk v-model="form.start_time" :only-time="true" :format="'hh:mm A'" :formatted="'hh:mm A'" :no-label="true" :color="'#33b09d'" :id="'start_time'" :name="'start_time'" :label="'Select start time'" @input="getTime($event, 'dynamic')" v-validate="'required'"></v-ctk>
                                        <transition name="slideY"><span class="validation_errors" v-if="errors.has('start_time')">{{ errors.first('start_time') | properFormat }}</span></transition>
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
                                        <select :class="`default_select alternate ${(form.hasTime) ? '' : 'disabled'}`" name="class_type_id" v-validate="'required'" @change="getClassLength($event)">
                                            <option value="" selected disabled>Select a Class Type</option>
                                            <option :value="classType.id" v-for="(classType, key) in classTypes" :key="key">{{ classType.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('class_type_id')">{{ errors.first('class_type_id') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <div class="form_check mb_10">
                                            <input type="checkbox" id="set_custom_name" name="set_custom_name" class="action_check" v-model="form.setCustomName">
                                            <label for="set_custom_name">Set Custom Name</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group" v-if="form.setCustomName">
                                        <label for="custom_name">Custom Class Type Name <span>*</span></label>
                                        <input type="text" name="custom_name" autocomplete="off" class="default_text" placeholder="Enter customer class type name" key="custom_name" v-validate="'required'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('custom_name')">{{ errors.first('custom_name') | properFormat }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="temp_class_length">Class Length</label>
                                        <input type="text" name="temp_class_length" readonly autocomplete="off" class="default_text disabled" v-model="form.classLengthTemp">
                                    </div>
                                </div>
                                <div class="form_group" v-if="studio.online_class">
                                    <label for="zoom_link">Zoom Link <span>*</span></label>
                                    <input type="text" name="zoom_link" autocomplete="off" class="default_text" placeholder="Enter zoom link" v-validate="{required: true, url: {require_protocol: true }}">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('zoom_link')">{{ errors.first('zoom_link') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="description">Description</label>
                                    <textarea name="description" rows="8" id="description" class="default_text" placeholder="Enter description"></textarea>
                                </div>
                                <transition name="fade">
                                    <div class="form_group" v-if="isPrivate">
                                        <label for="occassion">Occassion <span>*</span></label>
                                        <input type="text" name="occassion" autocomplete="off" class="default_text" v-validate="'required|max:70'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('occassion')">{{ errors.first('occassion') | properFormat }}</span></transition>
                                    </div>
                                </transition>
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
                                            <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :min-date="$moment(parseInt($route.params.param)).add(1, 'd').format('YYYY-MM-DD')" :label="'Select end date'" v-validate="'required'"></v-ctk>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                </transition>
                            </div>
                        </div>
                        <div class="form_wrapper" v-if="form.hasTime && form.class_type_id != ''">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Instructor</h2>
                            </div>
                            <div class="form_main_group">
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
                                        <label for="substitute_instructor_id">Substitute Instructor</label>
                                        <select :class="`default_select alternate ${(form.instructor_id != '') ? '' : 'disabled'}`" name="substitute_instructor_id">
                                            <option value="" selected disabled>Select an Instructor</option>
                                            <option :value="instructor.id" v-for="(instructor, key) in instructors" :key="key" v-if="form.instructor_id != instructor.id">{{ instructor.first_name }} {{ instructor.last_name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('substitute_instructor_id')">{{ errors.first('substitute_instructor_id') | properFormat }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <transition name="fade">
                            <div class="form_wrapper" v-if="!isPrivate">
                                <div class="form_header_wrapper">
                                    <h2 class="form_title">Restrictions</h2>
                                </div>
                                <div class="form_main_group">
                                    <div class="form_flex select_all">
                                        <label class="flex_label alternate">Allow class to package types:</label>
                                        <div class="form_check select_all">
                                            <div :class="`custom_action_check ${(checkData) ? 'checked' : ''}`" @click.prevent="toggleSelectAll($event)">Select All</div>
                                        </div>
                                        <div class="form_check" v-for="(packageType, key) in packageTypes" :key="key">
                                            <input type="checkbox" :id="`data_${key}`" name="package_type_restriction" class="action_check" v-model="packageType.checked">
                                            <label :for="`data_${key}`">{{ packageType.name }}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </transition>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Image Upload</h2>
                            </div>
                            <div class="form_main_group">
                                <image-handler-container ref="image_handler" :multiple="false" :notRequired="false" />
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check">
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
    </transition>
</template>

<script>
    import SchedulerRepeatPrompt from '../../../components/modals/SchedulerRepeatPrompt'
    import Foot from '../../../components/Foot'
    import ImageHandlerContainer from '../../../components/ImageHandlerContainer'
    export default {
        components: {
            SchedulerRepeatPrompt,
            ImageHandlerContainer,
            Foot
        },
        data () {
            return {
                name: 'Scheduler',
                access: true,
                loaded: false,
                message: '',
                isRepeat: false,
                isPrivate: false,
                lastRoute: '',
                studio: [],
                classTypes: [],
                packageTypes: [],
                instructors: [],
                form: {
                    hasTime: false,
                    setCustomName: '',
                    classLengthTemp: '',
                    classLength: '',
                    start_time: '',
                    instructor_id: '',
                    class_type_id: '',
                    credits: 0,
                    studio_id: 0,
                    end_date: this.$moment(parseInt(this.$route.params.param)).add(1, 'd').format('YYYY-MM-DD')
                }
            }
        },
        filters: {
            properFormat (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('.')
                if (newValue.length > 1) {
                    newValue = newValue[1].split('[]')
                    if (newValue.length > 1) {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    } else {
                        let nextValue = newValue[0].split('_')
                        if (nextValue.length > 1) {
                            newValue = nextValue[0].charAt(0).toUpperCase() + nextValue[0].slice(1) + ' ' + nextValue[1].charAt(0).toUpperCase() + nextValue[1].slice(1)
                        } else {
                            newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        }
                    }
                } else {
                    newValue = value.split('The ')[1].split(' field')[0].split('[]')
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
        computed: {
            checkData () {
                const me = this
                let count = 0
                let result = false
                me.packageTypes.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.packageTypes.length) {
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
                me.form.class_type_id = target
                me.$axios.get(`api/packages/class-types/${target}`).then(res => {
                    if (res.data) {
                        me.form.classLength = res.data.classType.class_length
                        me.form.classLengthTemp = `${res.data.classType.class_length.split('+')[1].split(':')[0]} hrs, ${res.data.classType.class_length.split('+')[1].split(':')[1]} mins`
                        me.getTime(me.form.start_time, 'static')
                    }
                })
            },
            toggleSelectAll (event) {
                const me = this
                if (me.checkData) {
                    me.packageTypes.forEach((data, index) => {
                        data.checked = false
                    })
                } else {
                    me.packageTypes.forEach((data, index) => {
                        data.checked = true
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            submissionSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('date', me.$moment(parseInt(me.$route.params.param)).format('YYYY-M-D'))
                        formData.append('package_type_restrictions', JSON.stringify(me.packageTypes))
                        formData.append('studio_id', me.form.studio_id)
                        formData.append('class_length', me.form.classLength)
                        me.loader(true)
                        me.$axios.post('api/schedules', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
                                    me.$router.push(`/${me.lastRoute}`)
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            offset: -250
                        })
                    }
                })
            },
            fetchTypes () {
                const me = this
                let studio_id = me.$cookies.get('CSID')
                me.$axios.get(`api/packages/class-types?studio_id=${studio_id}&get=1`).then(res => {
                    me.classTypes = res.data.classTypes
                })
                me.$axios.get(`api/packages/package-types?no_paginate=1&studio_id=${studio_id}`).then(res => {
                    res.data.packageTypes.forEach((data, index) => {
                        data.checked = false
                        me.packageTypes.push(data)
                    })
                })

                me.form.studio_id = me.$cookies.get('CSID')

                me.$axios.get(`api/studios/${me.form.studio_id}`).then(res => {
                    me.studio = res.data.studio
                })

                me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
                setTimeout( () => {
                    $('#description').summernote({
                        tabsize: 4,
                        height: 200,
                        followingToolbar: false,
                        toolbar: [
                            [ 'font', [ 'bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear'] ],
                            [ 'color', [ 'color' ] ],
                            [ 'para', [ 'ol', 'ul', 'paragraph', 'height' ] ],
                            [ 'view', [ 'undo', 'redo', 'fullscreen', 'codeview' ] ]
                        ],
                        codemirror: {
                            lineNumbers: true,
                            htmlMode: true,
                            mode: "text/html",
                            tabMode: 'indent',
                            lineWrapping: true
                        }
                    })
                    me.loader(false)
                }, 100)
                me.loaded = true
            },
            getTime (event, type) {
                const me = this
                let target
                switch (type) {
                    case 'static':
                        target = me.form.start_time
                        break
                    case 'dynamic':
                        target = event
                        break
                }
                me.form.start_time = target
                if (target) {
                    me.form.hasTime = true
                    if (me.form.class_type_id != '') {
                        let formData = new FormData()
                        formData.append('date', me.$moment(parseInt(me.$route.params.param)).format('YYYY-MM-DD'))
                        formData.append('start_time', target)
                        formData.append('class_type_id', me.form.class_type_id)
                        formData.append('studio_id', me.$store.state.user.current_studio_id)
                        me.$axios.post(`api/available-instructors`, formData).then(res => {
                            me.instructors = res.data.instructors
                        })
                    }
                } else {
                    me.form.hasTime = false
                }
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loader(true)
                setTimeout( () => {
                    me.fetchTypes()
                }, 500)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
        }
    }
</script>
