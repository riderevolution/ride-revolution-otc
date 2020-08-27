<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Customer</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Total sales from each Ride Revolution member</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/customer?customer_type_id=${form.customer_type_id}&gender=${form.gender}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                                <download-csv
                                    v-if="res.length > 0"
                                    class="action_btn alternate margin"
                                    :data="customerAttributes"
                                    :name="`sales-by-customer-${$moment().format('MM-DD-YY-hh-mm')}.csv`">
                                    Export
                                </download-csv>
                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="customer_type_id">Customer Type</label>
                                <select class="default_select alternate" name="customer_type_id" v-model="form.customer_type_id">
                                    <option value="" selected>All Customer Type</option>
                                    <option :value="type.id" v-for="(type, index) in types">{{ type.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="gender">Gender</label>
                                <select class="default_select alternate" name="gender" v-model="form.gender">
                                    <option value="" selected>All Gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ errors.first('start_date') | properFormat }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') | properFormat }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Full Name</th>
                                <th class="sticky">Type</th>
                                <th class="sticky">Class Package Total</th>
                                <th class="sticky">Merchandise Total</th>
                                <th class="sticky">Email</th>
                                <th class="sticky">Contact Number</th>
                                <th class="sticky">City</th>
                            </tr>
                        </thead>
                        <tbody v-if="res.length > 0">
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link class="table_data_link" :to="`/customers/${data.id}/packages`">{{ `${data.first_name} ${data.last_name}` }}</nuxt-link>
                                </td>
                                <td>{{ data.customer_details.customer_type.name }}</td>
                                <td>Php {{ totalCount(data.total_class_package) }}</td>
                                <td>Php {{ totalCount(data.total_merchandise) }}</td>
                                <td>{{ data.email }}</td>
                                <td>{{ data.customer_details.co_contact_number }}</td>
                                <td>{{ (data.customer_details.pa_city) ? data.customer_details.pa_city : 'N/A' }}</td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </div>
            <transition name="fade">
                <foot v-if="$store.state.isAuth" />
            </transition>
        </div>
    </transition>
</template>

<script>
    import Foot from '../../.././../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Sales by Customer',
                access: true,
                loaded: false,
                rowCount: 0,
                status: 1,
                res: [],
                values: [],
                types: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    gender: '',
                    customer_type_id: ''
                }
            }
        },
        computed: {
            customerAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Full Name': `${value.first_name} ${value.last_name}`,
                        'Customer Type': me.getCustomerType(),
                        'Class Package Total': `Php ${value.total_class_package}`,
                        'Merchandise Total': `Php ${value.total_merchandise}`,
                        'Email': value.email,
                        'Contact Number': value.customer_details.co_contact_number,
                        'City': (value.customer_details.pa_city) ? value.customer_details.pa_city : 'N/A'
                    }))
                ]
            }
        },
        methods: {
            getCustomerType () {
                const me = this
                let result = ''
                if (me.form.customer_type_id != '') {
                    me.types.forEach((type, index) => {
                        if (type.id == me.form.customer_type_id) {
                            result = type.name
                        }
                    })
                } else {
                    result = 'All Customer Type'
                }
                return result
            },
            submitFilter () {
                const me = this
                me.values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                me.$axios.post('api/reporting/sales/sales-by-customer', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.$moment().format('YYYY-MM-DD'))
                formData.append('end_date', me.$moment().format('YYYY-MM-DD'))
                me.$axios.post('api/reporting/sales/sales-by-customer', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.result

                            res.data.result.forEach((item, i) => {
                                me.values.push(item)
                            })

                            me.$axios.get('api/extras/customer-types').then(res => {
                                if (res.data) {
                                    me.types = res.data.customerTypes
                                }
                            })
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        me.rowCount = document.getElementsByTagName('th').length
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
