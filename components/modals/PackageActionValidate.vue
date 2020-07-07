<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text">
                Are you sure you want to {{ $parent.methodType }} this package?
            </div>
            <div class="button_group">
                <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose(false)">Cancel</a>
                <div class="action_success_btn confirm margin alternate" @click.once="toggleClose(true)">Confirm</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            userPackageCountId: {
                default: null
            }
        },
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    let formData = new FormData()
                    me.loader(true)
                    if (me.$parent.methodType != 'unshare') {
                        formData.append('user_id', me.$parent.res.id)
                        formData.append('user_package_count_id', me.userPackageCountId)
                        me.$axios.post(`api/packages/class-packages/${me.$parent.methodType}`, formData).then(res => {
                            if (res.data) {
                                me.$store.state.packageActionValidateStatus = false
                                setTimeout( () => {
                                    if (me.$route.params.slug == 'packages') {
                                        document.getElementById('packages').click()
                                    }
                                    me.$store.state.packageActionPromptStatus = true
                                    if (me.$parent.methodType == 'freeze') {
                                        me.$parent.packagePromptType = 'Freeze'
                                        me.$parent.packagePromptMessage = 'You have successfully froze your package.'
                                    } else {
                                        me.$parent.packagePromptType = 'Unfreeze'
                                        me.$parent.packagePromptMessage = 'You have successfully unfroze your package.'
                                    }
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
                        formData.append('receiver_id', me.$parent.tempData.sharedto_user_id)
                        formData.append('user_package_count_id', me.userPackageCountId)
                        formData.append('sender_id', me.$parent.tempData.user_id)
                        me.$axios.post(`api/packages/class-packages/${me.$parent.methodType}`, formData).then(res => {
                            if (res.data) {
                                me.$store.state.packageActionValidateStatus = false
                                setTimeout( () => {
                                    if (me.$route.params.slug == 'packages') {
                                        document.getElementById('packages').click()
                                    }
                                    me.$store.state.packageActionPromptStatus = true
                                    me.$parent.packagePromptType = 'Unshare'
                                    me.$parent.packagePromptMessage = 'You have successfully unshared your package.'
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
                    }
                } else {
                    me.$store.state.packageActionValidateStatus = false
                    document.body.classList.remove('no_scroll')
                }
            }
        }
    }
</script>
