<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Add New Class Type</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Class Type Overview</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="name">Class Name <span>*</span></label>
                                    <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') | properFormat }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="description">Description <span>*</span></label>
                                    <textarea name="description" rows="8" class="default_text" v-validate="'required'"></textarea>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('description')">{{ errors.first('description') | properFormat }}</span></transition>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group flex">
                                        <label>Class Length <span>*</span></label>
                                        <div class="form_flex_input">
                                            <input type="text" name="class_length_hours" class="default_text number" autocomplete="off" v-model="form.classLength.hour" maxlength="10" v-validate="'required|numeric|max_value:9999999999|min_value:0'">
                                            <div class="placeholder">hours</div>
                                            <div class="up" @click="addCount('classLength', 'hour')"></div>
                                            <div class="down" @click="subtractCount('classLength', 'hour')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('class_length_hours')">{{ errors.first('class_length_hours') | properFormat }}</span></transition>
                                        </div>
                                        <div class="form_flex_input">
                                            <input type="text" name="class_length_minutes" class="default_text number" autocomplete="off" v-model="form.classLength.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                            <div class="placeholder">mins.</div>
                                            <div class="up" @click="addCount('classLength', 'mins')"></div>
                                            <div class="down" @click="subtractCount('classLength', 'mins')"></div>
                                            <transition name="slide"><span class="validation_errors" v-if="errors.has('class_length_minutes')">{{ errors.first('class_length_minutes') | properFormat }}</span></transition>
                                        </div>
                                    </div>
                                    <div class="form_group">
                                        <div class="form_flex_radio no_margin">
                                            <label class="radio_label">Is this bookable? <span>*</span></label>
                                            <div class="form_radio">
                                                <input type="radio" id="bookable_yes" value="Yes" name="bookable" class="action_radio" checked>
                                                <label for="bookable_yes">Yes</label>
                                            </div>
                                            <div class="form_radio">
                                                <input type="radio" id="bookable_no" value="No" name="bookable" class="action_radio">
                                                <label for="bookable_no">No</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form_flex select_all">
                                    <label class="flex_label alternate">Restrict class to studios: <span>*</span></label>
                                    <div class="form_check select_all">
                                        <div :class="`custom_action_check ${(checkStudio) ? 'checked' : ''}`" @click.prevent="toggleSelectAllStudio($event)">Select All</div>
                                    </div>
                                    <div class="form_check" v-for="(studio, key) in studios" :key="key">
                                        <input type="checkbox" :id="`studio_${key}`" name="studios" v-model="studio.checked" class="action_check" @change="hasStudio = true">
                                        <label :for="`studio_${key}`">{{ studio.name }}</label>
                                    </div>
                                    <transition name="slide"><span class="validation_errors" v-if="hasStudio">The Studio field is required</span></transition>
                                </div>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                    <label for="enabled">Activate</label>
                                </div>
                                <div class="button_group">
                                    <nuxt-link :to="`/admin/${prevRoute}/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Classes and Packages',
                access: true,
                loaded: false,
                hasStudio: false,
                lastRoute: '',
                prevRoute: '',
                studios: [],
                form: {
                    studios: [],
                    classLength: {
                        hour: '-',
                        mins: '-'
                    }
                },
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
            checkStudio () {
                const me = this
                let count = 0
                let result = false
                me.studios.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.studios.length) {
                    result = true
                } else {
                    result = false
                }
                return result
            }
        },
        methods: {
            toggleSelectAllStudio (event) {
                const me = this
                if (me.checkStudio) {
                    me.studios.forEach((data, index) => {
                        data.checked = false
                        me.hasStudio = true
                    })
                } else {
                    me.studios.forEach((data, index) => {
                        data.checked = true
                        me.hasStudio = false
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            validateAdd (data, value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'classLength':
                                data != 0 && (me.form.classLength.hour = 0)
                                me.form.classLength.hour = (data += 1)
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'classLength':
                                data != 0 && (me.form.classLength.mins = 0)
                                data < 60 && (me.form.classLength.mins = (data += 1))
                                break
                        }
                        break
                }
            },
            validateSubtract (data, value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'classLength':
                                data > 0 && (me.form.classLength.hour = (data -= 1))
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'classLength':
                                data > 0 && (me.form.classLength.mins = (data -= 1))
                                break
                        }
                        break
                }
            },
            addCount (value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'classLength':
                                me.validateAdd(parseInt(me.form.classLength.hour), value, type)
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'classLength':
                                me.validateAdd(parseInt(me.form.classLength.mins), value, type)
                                break
                        }
                        break
                }
            },
            subtractCount (value, type) {
                const me = this
                switch (type) {
                    case 'hour':
                        switch (value) {
                            case 'classLength':
                                me.validateSubtract(parseInt(me.form.classLength.hour), value, type)
                                break
                        }
                        break
                    case 'mins':
                        switch (value) {
                            case 'classLength':
                                me.validateSubtract(parseInt(me.form.classLength.mins), value, type)
                                break
                        }
                        break
                }
            },
            submissionSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.studios.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.hasStudio = (ctr > 0) ? false : true
                    if (valid && !me.hasStudio) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('class_length', `${(me.form.classLength.hour * 3600) + (me.form.classLength.mins * 60) + (0 * 1)}+${me.form.classLength.hour}:${me.form.classLength.mins}`)
                        formData.append('studios', JSON.stringify(me.studios))
                        me.loader(true)
                        me.$axios.post('api/packages/class-types', formData).then(res => {
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
                                    me.$router.push(`/admin/${me.prevRoute}/${me.lastRoute}`)
                                }
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
            fetchStudios (studioStatus) {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                    me.loaded = true
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchStudios(false)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>
