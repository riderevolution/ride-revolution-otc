<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <div class="confirmation_text mb-10">
                Are you sure you want to {{ $parent.methodType }} this package?
            </div>
            <template v-if="$parent.methodType == 'edit'">
                <div class="form_group">
                    <label for="package_credit">Updated Package Credit</label>
                    <input type="text" class="default_text" v-model="form.package_credit" placeholder="Enter package creidt">
                </div>
            </template>
            <div class="form_group">
                <label for="remarks">Notes/Remarks</label>
                <textarea name="remarks" rows="8" id="remarks" class="default_text" v-model="form.remarks" placeholder="Enter remarks"></textarea>
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
        data: () => ({
            form: {
                package_credit: '',
                remarks: ''
            }
        }),
        methods: {
            toggleClose (status) {
                const me = this
                if (status) {
                    let token = me.$cookies.get('70hokcotc3hhhn5')
                    let formData = new FormData()
                    if (me.$parent.methodType == 'edit') {
                        formData.append('package_credit', me.form.package_credit)
                    }
                    formData.append('remarks', me.form.remarks)
                    me.loader(true)
                    if (me.$parent.methodType != 'unshare') {
                        formData.append('user_id', me.$parent.res.id)
                        formData.append('user_package_count_id', me.userPackageCountId)
                        me.$axios.post(`api/packages/class-packages/${me.$parent.methodType}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            if (res.data) {
                                me.$store.state.packageActionValidateStatus = false
                                setTimeout( () => {
                                    if (me.$route.params.slug == 'packages') {
                                        document.getElementById('packages').click()
                                    }
                                    me.$store.state.packageActionPromptStatus = true
                                    switch (me.$parent.methodType) {
                                        case 'freeze':
                                            me.$parent.packagePromptType = 'Freeze'
                                            me.$parent.packagePromptMessage = 'You have successfully froze your package.'
                                            break
                                        case 'unfreeze':
                                            me.$parent.packagePromptType = 'Unfreeze'
                                            me.$parent.packagePromptMessage = 'You have successfully unfroze your package.'
                                            break
                                        case 'edit':
                                            me.$parent.packagePromptType = 'Edited Package Credit'
                                            me.$parent.packagePromptMessage = 'You have successfully updated your package.'
                                            break
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
                        me.$axios.post(`api/packages/class-packages/${me.$parent.methodType}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
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
