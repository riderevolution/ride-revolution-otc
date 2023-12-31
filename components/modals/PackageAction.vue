<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay assign" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">{{ type }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group alternate">
                    <div class="customer_filter">
                        <div class="form_group" v-click-outside="closeMe">
                            <label for="customer">Find a Member</label>
                            <input type="text" name="customer" autocomplete="off" placeholder="Search for a customer" class="default_text search_alternate" @click="toggleCustomers ^= true" @input="searchCustomer($event)">
                            <transition name="slide"><span class="validation_errors" v-if="findCustomer && customer == ''">Select Member</span></transition>
                            <div :class="`customer_selection ${(customerLength > 6) ? 'scrollable' : ''}`" v-if="toggleCustomers">
                                <div class="customer_selection_list">
                                    <div class="customer_wrapper" v-if="customerLength > 0 && customer.id != data.id" :id="`customer_${data.id}`" v-for="(data, key) in populateCustomers" :key="key" @click="getCustomer(data)">
                                        <img :src="data.customer_details.images[0].path_resized" v-if="data.customer_details.images[0].path_resized != null" />
                                        <div class="customer_image" v-else>
                                            <div class="overlay">
                                                {{ data.first_name.charAt(0) }}{{ data.last_name.charAt(0) }}
                                            </div>
                                        </div>
                                        <div class="customer_name">
                                            {{ data.first_name }} {{ data.last_name }}
                                        </div>
                                    </div>
                                    <div class="no_results" v-if="customerLength == 0" >
                                        No customer(s) found.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_group">
                            <label for="remarks">Notes/Remarks</label>
                            <textarea name="remarks" rows="8" id="remarks" class="default_text" v-model="form.remarks" placeholder="Enter remarks"></textarea>
                        </div>
                    </div>
                    <div class="customer_picked" v-if="customer != ''">
                        <div class="customer_header">
                            <img class="customer_image" :src="customer.customer_details.images[0].path_resized" v-if="customer.customer_details.images[0].path_resized != null" />
                            <div class="customer_default_image" v-else>
                                <div class="overlay">
                                    {{ customer.first_name.charAt(0) }}{{ customer.last_name.charAt(0) }}
                                </div>
                            </div>
                            <div class="customer_details">
                                <h2 class="customer_name">
                                    {{ customer.first_name }} {{ customer.last_name }}
                                </h2>
                                <div class="customer_info">
                                    <span>Birthday: {{ $moment(customer.customer_details.co_birthdate).format('M/D/YY') }}</span>
                                    <span>{{ customer.email }}</span>
                                    <span>{{ customer.customer_details.co_contact_number }}</span>
                                    <span>Shoe Size: <b>US - {{ customer.customer_details.co_shoe_size }}</b></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="form_flex">
                            <div class="button_group">
                                <div class="action_cancel_btn" @click="toggleClose()">Cancel</div>
                                <button type="submit" name="submit" class="action_success_btn margin alternate">Proceed</button>
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
            userPackageCountId: {
                type: Number,
                default: 0
            },
            type: {
                default: null
            }
        },
        data () {
            return {
                findCustomer: false,
                form: {
                    comp: '',
                    remarks: '',
                    assign: 'member'
                },
                toggleCustomers: false,
                customers: [],
                customer: '',
                customerLength: 0
            }
        },
        computed: {
            populateCustomers () {
                const me = this
                let results = []
                results = me.customers
                return results
            }
        },
        methods: {
            closeMe () {
                const me = this
                me.toggleCustomers = false
            },
            toggleClose () {
                const me = this
                me.$store.state.packageActionStatus = false
                document.body.classList.remove('no_scroll')
            },
            submissionSuccess () {
                const me = this
                let formData = new FormData()
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        me.loader(true)
                        switch (me.type) {
                            case 'Transfer':
                                formData.append('receiver_id', me.customer.id)
                                formData.append('user_package_count_id', me.userPackageCountId)
                                formData.append('sender_id', me.$parent.res.id)
                                formData.append('remarks', me.form.remarks)
                                me.$axios.post('api/packages/class-packages/transfer', formData, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }).then(res => {
                                    if (res.data) {
                                        me.$store.state.packageActionStatus = false
                                        if (me.$route.params.slug == 'packages') {
                                            document.getElementById('packages').click()
                                        }
                                        setTimeout( () => {
                                            me.$store.state.packageActionPromptStatus = true
                                            me.$parent.packagePromptType = 'Transferred'
                                            me.$parent.packagePromptMessage = 'You have successfully transfered your package.'
                                        }, 500)
                                    }
                                }).catch(err => {
                                    me.$store.state.errorOverlayStatus = true
                                    me.$store.state.errorList = err.response.data.errors
                                    me.$store.state.errorStatus = true
                                }).then(() => {
                                    setTimeout( () => {
                                        me.loader(false)
                                    }, 500)
                                })
                                break
                            case 'Share':
                                formData.append('receiver_id', me.customer.id)
                                formData.append('user_package_count_id', me.userPackageCountId)
                                formData.append('sender_id', me.$parent.res.id)
                                formData.append('remarks', me.form.remarks)
                                me.$axios.post(`api/packages/class-packages/${me.$parent.methodType}`, formData, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                }).then(res => {
                                    if (res.data) {
                                        me.$store.state.packageActionStatus = false
                                        if (me.$route.params.slug == 'packages') {
                                            document.getElementById('packages').click()
                                        }
                                        setTimeout( () => {
                                            me.$store.state.packageActionPromptStatus = true
                                            me.$parent.packagePromptType = 'Shared'
                                            me.$parent.packagePromptMessage = 'You have successfully shared your package.'
                                        }, 500)
                                    }
                                }).catch(err => {
                                    me.$store.state.errorOverlayStatus = true
                                    me.$store.state.errorList = err.response.data.errors
                                    me.$store.state.errorStatus = true
                                }).then(() => {
                                    setTimeout( () => {
                                        me.loader(false)
                                    }, 500)
                                })
                                break;
                        }

                    } else {
                        if (me.customer == '') {
                            me.findCustomer = true
                        }
                    }
                })
            },
            getCustomer (data) {
                const me = this
                me.toggleCustomers = false
                me.customer = data
                me.findCustomer = false
            },
            searchCustomer (event) {
                const me = this
                let value = event.target.value
                let formData = new FormData()
                formData.append('q', value)
                formData.append('forBooker', 1)
                formData.append('enabled', 1)
                formData.append('user_id', me.$parent.$parent.customer.id)
                me.$axios.post('api/customers/search', formData).then(res => {
                    if (res.data) {
                        me.customers = res.data.customers
                        me.customerLength = me.customers.length
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
            },
            fetchData (value) {
                const me = this
                let formData = new FormData()
                formData.append('forBooker', 1)
                formData.append('user_id', me.$parent.$parent.customer.id)
                me.$axios.post('api/customers/search', formData).then(res => {
                    if (res.data) {
                        me.customers = res.data.customers
                        me.customerLength = me.customers.length
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                })
            }
        },
        mounted () {
            const me = this
            me.fetchData(1)
        }
    }
</script>
