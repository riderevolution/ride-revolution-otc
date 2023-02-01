<template>
    <div class="default_modal">
        <div class="background" @click.once="toggleClose(false)"></div>
        <div class="confirmation_wrapper">
            <template v-if="$parent.methodType != 'unshare'">
                <div class="confirmation_text mb-10">
                    Are you sure you want to {{ $parent.methodType }} this package?
                </div>
            </template>
            <template v-else>
                <div class="confirmation_text mb-10">
                    Select a user you want to unshare this package
                </div>
            </template>
            <template v-if="$parent.methodType == 'edit'">
                <div class="form_group">
                    <label for="package_credit">Updated Package Credit</label>
                    <input type="text" class="default_text" v-model="form.package_credit" placeholder="Enter package creidt">
                </div>
            </template>
            <template v-if="$parent.methodType == 'unshare'">
                <div class="customer_package_shares">
                    <div
                        v-for="(share, key) in $parent.tempData.shares"
                        :key="key"
                        class="customer_picked"
                    >
                        <div class="customer_header small">
                            <img class="customer_image" :src="share.user.customer_details.images[0].path_resized" v-if="share.user.customer_details.images[0].path_resized != null" />
                            <div class="customer_default_image" v-else>
                                <div class="overlay">
                                    {{ share.user.first_name.charAt(0) }}{{ share.user.last_name.charAt(0) }}
                                </div>
                            </div>
                            <div class="customer_details inline">
                                <div class="customer_details_left">
                                    <h2 class="customer_name">
                                        {{ share.user.first_name }} {{ share.user.last_name }}
                                    </h2>
                                    <div class="customer_info">
                                        <span>{{ share.user.email }}</span>
                                    </div>
                                </div>
                                <div class="customer_details_right">
                                    <div class="action_cancel_btn" @click="selectUser(share)">Remove</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if="$parent.methodType != 'unshare'">
                <div class="form_group">
                    <label for="remarks">Notes/Remarks</label>
                    <textarea name="remarks" rows="8" id="remarks" class="default_text" v-model="form.remarks" placeholder="Enter remarks"></textarea>
                </div>
            </template>
            <div class="button_group">
                <a href="javascript:void(0)" class="action_cancel_btn" @click.once="toggleClose(false)">Cancel</a>
                <template v-if="$parent.methodType != 'unshare'">
                    <div class="action_success_btn confirm margin alternate" @click.once="toggleClose(true)">Confirm</div>
                </template>
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
            selectUser (share) {
                this.$store.state.packageShareConfirmationStatus = true
                this.$parent.shareData = share
            },
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
                    }
                } else {
                    me.$store.state.packageActionValidateStatus = false
                    document.body.classList.remove('no_scroll')
                }
            }
        }
    }
</script>
