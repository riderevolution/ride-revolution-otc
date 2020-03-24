<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay assign" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">Sample</h2>
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
                    </div>
                    <div class="customer_picked" v-if="customer != ''">
                        <div class="customer_header">
                            <img class="customer_image" :src="customer.customer_details.images[0].path_resized" v-if="customer.customer_details.images.length > 0" />
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
            packageID: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {
                findCustomer: false,
                form: {
                    comp: '',
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
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        // me.loader(true)
                        let formData = new FormData()
                        formData.append('receiver_id', me.customer.id)
                        formData.append('class_package_id', me.packageID)
                        formData.append('sender_id', me.$parent.res.id)
                        me.$axios.post('api/packages/class-packages/transfer', formData).then(res => {
                            if (res.data) {
                                setTimeout( () => {
                                    console.log(res.data);
                                }, 500)
                            }
                        // }).catch(err => {
                        //     me.$store.state.errorList = err.response.data.errors
                        //     me.$store.state.errorStatus = true
                        // }).then(() => {
                        //     setTimeout( () => {
                        //         me.loader(false)
                        //     }, 500)
                        })
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
