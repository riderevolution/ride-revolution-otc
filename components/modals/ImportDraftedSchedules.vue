<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
            <div class="modal_wrapper">
                <h2 class="form_title">Import Drafted Schedules</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_photo alternate">
                        <input type="file" id="file" name="file" class="action_photo" @change="getFile($event)" v-validate="'required'">
                        <label for="file" class="pointer">
                            <span>{{ fileTitle }}</span>
                        </label>
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('file')">{{ properFormat(errors.first('file')) }}</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Upload File</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                fileTitle: 'Upload Excel File'
            }
        },
        methods: {
            getFile (event) {
                const me = this
                let element = event.target
                if (element.files[0]) {
                    me.fileTitle = element.files[0].name
                }
            },
            toggleClose () {
                const me = this
                me.$parent.toggle.import = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        me.loader(true)
                        me.$axios.post('api/drafted-schedules/import', formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Schedules Imported Successfully')
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
                                    me.$parent.submissionSuccess()
                                    me.$parent.toggle.import = false
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
            }
        }
    }
</script>
