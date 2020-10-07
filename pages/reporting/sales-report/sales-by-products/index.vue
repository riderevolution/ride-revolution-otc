<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Products</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from products sold</h2>
                        </div>
                        <div class="actions">
                            <div class="action_buttons">
                                <a :href="`/print/reporting/sales/products?payment_status=${payment_status}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                                <download-csv
                                    v-if="res.length > 0"
                                    class="action_btn alternate margin"
                                    :data="productsAttributes"
                                    :name="`sales-by-products-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                    Export
                                </download-csv>
                            </div>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" v-model="form.studio_id" name="studio_id">
                                    <option value="0" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
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
                    <div class="cms_table_toggler">
                        <div class="total">Total: {{ totalItems(total_count) }}</div>
                        <div :class="`status ${(payment_status == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                        <div :class="`status ${(payment_status == 'paid') ? 'active' : ''}`" @click="toggleTab('paid')">Paid</div>
                        <div :class="`status ${(payment_status == 'pending') ? 'active' : ''}`" @click="toggleTab('pending')">Pending</div>
                    </div>
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="sticky">Item</th>
                                <th class="sticky">Sold</th>
                                <th class="sticky">Returned</th>
                                <th class="sticky">Comp</th>
                                <th class="sticky">Discount</th>
                                <th class="sticky">Taxes</th>
                                <th class="sticky">Comp Value</th>
                                <th class="sticky">Profit</th>
                                <th class="sticky">Cost</th>
                                <th class="sticky">Total Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>{{ total.returned }}</b></td>
                                <td><b>{{ total.comp }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td :class="`${(total.total_profit) ? (total.total_profit <= 0 ? 'red' : 'green') : ''}`"><b>Php {{ totalCount(total.total_profit) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_cost) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res" :key="key">
                                <td>
                                    <nuxt-link :event="''" class="table_data_link" :to="`${$route.path}/${convertToSlug(data.name)}`" @click.native="toggleInnerReport(`${(data.name == 'Gift Cards') ? 'gift-card' : 'product-variant'}`, `${$route.path}/${convertToSlug(data.name)}`, data.id)">{{ data.name }}</nuxt-link>
                                </td>
                                <td>{{ (data.sold) ? data.sold : 0 }}</td>
                                <td>{{ (data.returned) ? data.returned : 0 }}</td>
                                <td>{{ (data.comp) ? data.comp : 0 }}</td>
                                <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                <td :class="`${(data.total_profit) ? (data.total_profit <= 0 ? 'red' : 'green') : ''}`">Php {{ (data.total_profit) ? totalCount(data.total_profit) : 0 }}</td>
                                <td>Php {{ (data.total_cost) ? totalCount(data.total_cost) : 0 }}</td>
                                <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
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
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                name: 'Sales by Products',
                access: true,
                loaded: false,
                rowCount: 0,
                payment_status: 'all',
                studios: [],
                values: [],
                res: [],
                total: [],
                total_count: 0,
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: 0
                }
            }
        },
        computed: {
            productsAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': this.getStudio(),
                        'Payment Status': me.payment_status,
                        'Item': value.name,
                        'Sold': (value.sold) ? value.sold : 0,
                        'Returned': (value.returned) ? value.returned : 0,
                        'Comp': (value.comp) ? value.comp : 0,
                        'Discount': `Php ${(value.total_discount) ? value.total_discount : 0}`,
                        'Taxes': `Php ${(value.total_tax) ? value.total_tax : 0}`,
                        'Comp Value': `Php ${(value.total_comp) ? value.total_comp : 0}`,
                        'Profit': `Php ${(value.total_profit) ? value.total_profit : 0}`,
                        'Cost': `Php ${(value.total_cost) ? value.total_cost : 0}`,
                        'Total Income': `Php ${(value.total_income) ? value.total_income : 0}`,
                    }))
                ]
            },
        },
        methods: {
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != 0) {
                    me.studios.forEach((studio, index) => {
                        if (studio.id == me.form.studio_id) {
                            result = studio.name
                        }
                    })
                } else {
                    result = 'All Studios'
                }
                return result
            },
            toggleInnerReport (type, path, id) {
                const me = this
                me.$router.push(`${path}?payment_status=${me.payment_status}&studio_id=${me.form.studio_id}&slug=${type}&id=${id}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
            },
            toggleTab (value) {
                const me = this
                me.values = []
                me.payment_status = value
                me.fetchData(value)
            },
            submitFilter () {
                const me = this
                me.values = []
                me.loader(true)
                let formData = new FormData(document.getElementById('filter'))
                formData.append('payment_status', me.payment_status)
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.total_count
                            me.res = res.data.result
                            me.total = res.data.total

                            res.data.result.forEach((item, i) => {
                                me.values.unshift(item)
                            })
                            me.values.push(res.data.total)

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
            fetchData (value) {
                const me = this
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                formData.append('payment_status', value)
                if (me.form.studio_id != '') {
                    formData.append('studio_id', me.form.studio_id)
                }
                me.$axios.post('api/reporting/sales/sales-by-product', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.total_count = res.data.total_count
                            me.res = res.data.result
                            me.total = res.data.total

                            res.data.result.forEach((item, i) => {
                                me.values.push(item)
                            })
                            me.values.push(res.data.total)

                            me.$axios.get('api/studios', {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }).then(res => {
                                if (res.data) {
                                    me.studios = res.data.studios
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
                let studio_id = me.$cookies.get('CSID')
                me.form.studio_id = studio_id
                me.fetchData('all')
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
