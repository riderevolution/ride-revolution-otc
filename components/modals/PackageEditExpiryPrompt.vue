<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">Update {{ data.class_package.name }} Expiration Date</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_group">
                        <v-ctk v-model="form.date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'date'" :name="'date'" :label="'Select extension date'" :min-date="$moment(data.class_package.computed_expiration_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('date')">{{ errors.first('date') | properFormat }}</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Update</button>
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
            data: {
                default: null
            }
        },
        data () {
            return {
                form: {
                    date: this.$moment(this.data.class_package.computed_expiration_date).format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.editPackageExpiryStatus = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                me.loader(true)
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        console.log(me.data);
                        formData.append('user_package_count_id', me.data.id)
                        me.$axios.post('api/packages/class-packages/update-expiry', formData).then(res => {
                            if (res.data) {
                                setTimeout( () => {
                                    me.$store.state.editPackageExpiryStatus = false
                                    if (me.$route.params.slug == 'packages') {
                                        document.getElementById('packages').click()
                                    }
                                    document.body.classList.remove('no_scroll')
                                }, 500)
                            }
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        document.querySelector('.validation_errors').scrollIntoView({block: 'center', behavior: 'smooth'})
                    }
                })

            }
        }
    }
</script>
