<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">Select a Studio (Current: {{ currentStudio.name }})</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group alternate">
                    <div class="form_flex_button">
                        <div :id="`studio_${key}`" :class="`flex_button ${(data.id == currentStudio.id) ? 'active' : ''}`" v-for="(data, key) in studios" :key="key" @click="selectStudio(data, key)">
                            {{ data.name }}
                        </div>
                    </div>
                    <!-- <div class="form_group">
                        <select class="default_select" name="studio" v-model="studio">
                            <option value="" selected disabled>Select a Studio</option>
                            <option :value="studio.id" v-for="(studio, key) in studios" :key="key" v-if="studio.id != currentStudio.id">{{ studio.name }}</option>
                        </select>
                    </div> -->
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="form_check default">
                            </div>
                            <div class="button_group">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Change Studio</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <transition name="fade">
            <studio-changer-prompt v-if="$store.state.studioChangerPromptStatus" :message="message" :hasChanged="hasChanged" />
        </transition>
    </div>
</template>

<script>
    import StudioChangerPrompt from './StudioChangerPrompt'
    export default {
        components: {
            StudioChangerPrompt
        },
        data () {
            return {
                message: '',
                studio: '',
                studios: [],
                currentStudio: [],
                selectedStudio: [],
                hasChanged: false
            }
        },
        methods: {
            selectStudio (data, key) {
                const me = this
                if (data.id != me.currentStudio.id) {
                    let element = document.getElementById(`studio_${key}`)
                    element.classList.add('active')
                    me.studios.forEach((element, index) => {
                        if (key != index) {
                            document.getElementById(`studio_${index}`).classList.remove('active')
                        }
                    })
                    me.studio = data.id
                    me.hasChanged = true
                }
            },
            toggleClose () {
                const me = this
                me.$store.state.changeStudioStatus = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                if (me.studio != '') {
                    me.loader(true)
                    me.$axios.get(`api/studios/${me.studio}`, {
                        headers: {
                            Authorization: `Bearer ${me.$store.state.token}`
                        }
                    }).then(res => {
                        if (res.data) {
                            let formData = new FormData()
                            me.selectedStudio = res.data.studio
                            formData.append('current_studio_id', me.selectedStudio.id)
                            me.$axios.post('api/extras/change-current-user-studio', formData, {
                                headers: {
                                    Authorization: `Bearer ${me.$store.state.token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    setTimeout( () => {
                                        me.$store.state.user = res.data.user
                                        me.$cookies.set('CSID', res.data.user.current_studio_id)
                                    }, 10)
                                }
                            })
                        }
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                            if (!me.$store.state.errorStatus) {
                                me.$store.state.studioChangerPromptStatus = true
                                me.message = `You have successfully changed your studio from ${me.currentStudio.name} to ${me.selectedStudio.name}`
                            }
                        }, 500)
                    })
                } else {
                    me.$store.state.studioChangerPromptStatus = true
                    me.message = `You are already in this studio.`
                }
            }
        },
        mounted () {
            const me = this
            let studio_id = me.$cookies.get('CSID')
            me.$axios.get(`api/studios/${studio_id}`, {
                headers: {
                    Authorization: `Bearer ${me.$store.state.token}`
                }
            }).then(res => {
                if (res.data) {
                    me.currentStudio = res.data.studio
                }
            })
            me.$axios.get('api/studios', {
                headers: {
                    Authorization: `Bearer ${me.$store.state.token}`
                }
            }).then(res => {
                if (res.data) {
                    me.studios = res.data.studios
                }
            })
        }
    }
</script>
