<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionAddSuccess()" v-if="type == 0 && loaded">
            <div class="modal_wrapper">
                <h2 class="form_title">Add a New User</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group alternate scrollable">
                    <div class="form_group">
                        <label for="name">Choose a Role <span>*</span></label>
                        <select class="default_select alternate" name="role_id" v-validate="'required'" v-model="form.role">
                            <option value="" selected disabled>Choose a Role</option>
                            <option :value="role.id" v-for="(role, index) in roles">{{ role.display_name }}</option>
                        </select>
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('role_id')">{{ properFormat(errors.first('role_id')) }}</span></transition>
                    </div>
                    <div class="form_flex select_all">
                        <label class="flex_label alternate">Restrict user to studios: <span>*</span></label>
                        <div class="form_check select_all">
                            <div :class="`custom_action_check ${(checkStudio) ? 'checked' : ''}`" @click.prevent="toggleSelectAllStudio($event)">Select All</div>
                        </div>
                        <div class="form_check" v-for="(studio, key) in studios" :key="key">
                            <input type="checkbox" :id="`studio_${key}`" name="studios" v-model="studio.checked" @change="toggleStudio()" class="action_check">
                            <label :for="`studio_${key}`">{{ studio.name }}</label>
                        </div>
                        <transition name="slide"><span class="validation_errors" v-if="hasStudio">The Studio field is required</span></transition>
                    </div>
                    <div class="form_flex">
                        <div class="form_group">
                            <label for="first_name">First Name <span>*</span></label>
                            <input type="text" name="first_name" autocomplete="off" class="default_text" v-validate="'required|max:100'">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ properFormat(errors.first('first_name')) }}</span></transition>
                        </div>
                        <div class="form_group">
                            <label for="last_name">Last Name <span>*</span></label>
                            <input type="text" name="last_name" autocomplete="off" class="default_text" v-validate="'required|max:100'">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ properFormat(errors.first('last_name')) }}</span></transition>
                        </div>
                    </div>
                    <div class="form_group">
                        <label for="email">Email Address <span>*</span></label>
                        <input type="text" name="email" autocomplete="off" class="default_text" v-validate="'required|email|max:70'">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ properFormat(errors.first('email')) }}</span></transition>
                    </div>
                    <div class="form_flex">
                        <div class="form_group">
                            <label for="password">Password <span>*</span></label>
                            <input type="password" name="password" autocomplete="off" class="default_text" ref="password" v-validate="'required|min:8'">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('password')">{{ properFormat(errors.first('password')) }}</span></transition>
                        </div>
                        <div class="form_group">
                            <label for="password_confirmation">Password Confirmation <span>*</span></label>
                            <input type="password" name="password_confirmation" autocomplete="off" class="default_text" v-validate="'required|confirmed:password'">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('password_confirmation')">{{ properFormat(errors.first('password_confirmation')) }}</span></transition>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check default">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Add User</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <form id="default_form" class="overlay" @submit.prevent="submissionUpdateSuccess()" v-if="type == 1 && loaded">
            <div class="modal_wrapper">
                <h2 class="form_title">Update {{ res.first_name }} {{ res.last_name }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group scrollable">
                    <div class="form_group">
                        <label for="name">Choose a Role <span>*</span></label>
                        <select class="default_select alternate" name="role_id" v-validate="'required'" v-model="form.role">
                            <option value="" disabled>Choose a Role</option>
                            <option :value="role.id" v-for="(role, index) in roles" :selected="form.role == role.id">{{ role.display_name }}</option>
                        </select>
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('role')">{{ properFormat(errors.first('role')) }}</span></transition>
                    </div>
                    <div class="form_flex select_all">
                        <label class="flex_label alternate">Restrict user to studios: <span>*</span></label>
                        <div class="form_check select_all">
                            <div :class="`custom_action_check ${(checkStudio) ? 'checked' : ''}`" @click.prevent="toggleSelectAllStudio($event)">Select All</div>
                        </div>
                        <div class="form_check" v-for="(studio, key) in studios" :key="key">
                            <input type="checkbox" :id="`studio_${key}`" name="studios" v-model="studio.checkedForReal" class="action_check">
                            <label :for="`studio_${key}`">{{ studio.name }}</label>
                        </div>
                        <transition name="slide"><span class="validation_errors" v-if="hasStudio">The Studio field is required</span></transition>
                    </div>
                    <div class="form_flex">
                        <div class="form_group">
                            <label for="first_name">First Name <span>*</span></label>
                            <input type="text" name="first_name" autocomplete="off" class="default_text" v-validate="'required|max:100'" v-model="res.first_name">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('first_name')">{{ properFormat(errors.first('first_name')) }}</span></transition>
                        </div>
                        <div class="form_group">
                            <label for="last_name">Last Name <span>*</span></label>
                            <input type="text" name="last_name" autocomplete="off" class="default_text" v-validate="'required|max:100'" v-model="res.last_name">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('last_name')">{{ properFormat(errors.first('last_name')) }}</span></transition>
                        </div>
                    </div>
                    <div class="form_group">
                        <label for="email">Email Address <span>*</span></label>
                        <input type="text" name="email" autocomplete="off" class="default_text" v-validate="'required|email|max:70'" v-model="res.email">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ properFormat(errors.first('email')) }}</span></transition>
                    </div>
                    <div class="form_flex">
                        <div class="form_group">
                            <label for="password">Password</label>
                            <input type="password" name="password" autocomplete="off" class="default_text" ref="password" v-validate="'min:8'">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('password')">{{ properFormat(errors.first('password')) }}</span></transition>
                        </div>
                        <div class="form_group">
                            <label for="password_confirmation">Password Confirmation</label>
                            <input type="password" name="password_confirmation" autocomplete="off" class="default_text" v-validate="'confirmed:password'">
                            <transition name="slide"><span class="validation_errors" v-if="errors.has('password_confirmation')">{{ properFormat(errors.first('password_confirmation')) }}</span></transition>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check default">
                                <input type="checkbox" id="enabled" name="enabled" class="action_check" :checked="res.enabled == 1">
                                <label for="enabled">Activate</label>
                            </div>
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Update User</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            type: {
                type: Number,
                default: 0
            },
            status: {
                type: Number,
                default: 0
            },
            id: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {
                hasStudio: false,
                loaded: false,
                res: {
                    staff_details: {
                        role_id: '',
                        studio_access: [
                            {
                                studio_id: ''
                            }
                        ]
                    }
                },
                form: {
                    role: ''
                },
                roles: [],
                studios: [],
                studioLength: 0
            }
        },
        computed: {
            checkStudio () {
                const me = this
                let count = 0
                let result = false
                me.studios.forEach((data, index) => {
                    if (me.type == 0) {
                        if (data.checked) {
                            count++
                        }
                    } else {
                        if (data.checkedForReal) {
                            count++
                        }
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
            toggleStudio () {
                const me = this
                if (me.hasStudio) {
                    me.hasStudio = false
                }
            },
            toggleSelectAllStudio (event) {
                const me = this
                if (me.checkStudio) {
                    me.studios.forEach((data, index) => {
                        if (me.type == 0) {
                            data.checked = false
                        } else {
                            data.checkedForReal = false
                        }
                        me.hasStudio = true
                    })
                } else {
                    me.studios.forEach((data, index) => {
                        if (me.type == 0) {
                            data.checked = true
                        } else {
                            data.checkedForReal = true
                        }
                        me.hasStudio = false
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            toggleClose () {
                const me = this
                me.$store.state.userForm = false
                document.body.classList.remove('no_scroll')
            },
            submissionAddSuccess () {
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
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('studios', JSON.stringify(me.studios))
                        me.loader(true)
                        me.$axios.post('api/staff', formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Added')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 200)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                                if (!me.$store.state.errorStatus) {
                                    me.$parent.fetchData(me.status)
                                    me.$store.state.userForm = false
                                }
                            }, 200)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            submissionUpdateSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.studios.forEach((data, index) => {
                        if (data.checkedForReal) {
                            ctr++
                        }
                    })
                    me.hasStudio = (ctr > 0) ? false : true
                    if (valid && !me.hasStudio) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        if (formData.get('password').length <= 0) {
                            formData.delete('password')
                        }
                        formData.append('_method', 'PATCH')
                        formData.append('studios', JSON.stringify(me.studios))
                        me.loader(true)
                        me.$axios.post(`api/staff/${me.id}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Updated')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 200)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                                if (!me.$store.state.errorStatus) {
                                    me.$parent.fetchData(me.status)
                                    me.$store.state.userForm = false
                                }
                            }, 200)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            fetchStudios (studioStatus) {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
            }
        },
        async mounted () {
            const me = this
            me.$axios.get('api/roles').then(res => {
                me.roles = res.data.roles
            })
            if (me.id != 0) {
                me.$axios.get(`api/staff/${me.id}`).then(res => {
                    me.res = res.data.user
                    me.studios = res.data.user.studios
                    me.form.role = res.data.user.staff_details.role_id
                })
            } else {
                me.fetchStudios()
            }
            me.loaded = true
        }
    }
</script>
