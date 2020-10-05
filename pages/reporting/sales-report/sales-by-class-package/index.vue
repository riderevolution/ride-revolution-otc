<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Sales by Class Package</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income from class package sold.</h2>
                        </div>
                        <div class="actions">
                            <a :href="`/print/reporting/sales/class-package?payment_status=${payment_status}&studio_id=${form.studio_id}&start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getSales()" v-if="res.result.data.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.result.data.length > 0"
                                class="hidden me"
                                :data="classPackageAttributes"
                                :name="`sales-by-class-package-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                Export
                            </download-csv>

                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" v-model="form.studio_id" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(payment_status == 'all') ? 'active' : ''}`" @click="toggleTab('all')">All</div>
                        <div :class="`status ${(payment_status == 'paid') ? 'active' : ''}`" @click="toggleTab('paid')">Paid</div>
                        <div :class="`status ${(payment_status == 'pending') ? 'active' : ''}`" @click="toggleTab('pending')">Pending</div>
                    </div>
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Class Package</th>
                                <th>Sold</th>
                                <th>Returned</th>
                                <th>Comp</th>
                                <th>Comp Value</th>
                                <th>Discount</th>
                                <th>Taxes</th>
                                <th>Total Income</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="parent bb">
                                <td><b>{{ total.name }}</b></td>
                                <td><b>{{ total.sold }}</b></td>
                                <td><b>{{ total.returned }}</b></td>
                                <td><b>{{ total.comp }}</b></td>
                                <td><b>Php {{ totalCount(total.total_comp) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_discount) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_tax) }}</b></td>
                                <td><b>Php {{ totalCount(total.total_income) }}</b></td>
                            </tr>
                        </tbody>
                        <tbody :class="`${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.result.data">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.parent.name }}</td>
                                <td>{{ data.parent.sold }}</td>
                                <td>{{ data.parent.returned }}</td>
                                <td>{{ data.parent.comp }}</td>
                                <td>Php {{ totalCount(data.parent.total_comp) }}</td>
                                <td>Php {{ totalCount(data.parent.total_discount) }}</td>
                                <td>Php {{ totalCount(data.parent.total_tax) }}</td>
                                <td>Php {{ totalCount(data.parent.total_income) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Spot</th>
                                                    <th>Customer</th>
                                                    <th>Status</th>
                                                    <th>Package Used</th>
                                                    <th>Revenue</th>
                                                    <th>Discount</th>
                                                    <th>Net Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(data, key) in data.values" :key="key">
                                                    <td>
                                                        <nuxt-link :event="''" class="table_data_link" :to="`${$route.path}/${convertToSlug(data.name)}`" @click.native.prevent="toggleInnerReport('class-package', `${$route.path}/${convertToSlug(data.name)}`, data.id)">{{ data.name }}</nuxt-link>
                                                    </td>
                                                    <td>{{ (data.sold) ? data.sold : 0 }}</td>
                                                    <td>{{ (data.returned) ? data.returned : 0 }}</td>
                                                    <td>{{ (data.comp) ? data.comp : 0 }}</td>
                                                    <td>Php {{ (data.total_comp) ? totalCount(data.total_comp) : 0 }}</td>
                                                    <td>Php {{ (data.total_discount) ? totalCount(data.total_discount) : 0 }}</td>
                                                    <td>Php {{ (data.total_tax) ? totalCount(data.total_tax) : 0 }}</td>
                                                    <td>Php {{ (data.total_income) ? totalCount(data.total_income) : 0 }}</td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td colspan="8">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <pagination :apiRoute="res.result.path" :current="res.result.current_page" :last="res.result.last_page" />
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
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                name: 'Sales by Class Package',
                access: true,
                filter: true,
                loaded: false,
                payment_status: 'all',
                studios: [],
                res: [],
                values: [],
                total: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    studio_id: ''
                }
            }
        },
        computed: {
            classPackageAttributes () {
                const me = this
                return [
                    ...me.values.map(value => ({
                        'Studio': this.getStudio(),
                        'Payment Status': me.payment_status,
                        'Class Package': value.name,
                        'Package Type': (value.package_type) ? value.package_type.name : '-' ,
                        'Sold': (value.sold) ? value.sold : 0,
                        'Returned': (value.returned) ? value.returned : 0,
                        'Comp': (value.comp) ? value.comp : 0,
                        'Comp Value': `Php ${(value.total_comp) ? value.total_comp : 0}`,
                        'Discount': `Php ${(value.total_discount) ? value.total_discount : 0}`,
                        'Taxes': `Php ${(value.total_tax) ? value.total_tax : 0}`,
                        'Total Income': `Php ${(value.total_income) ? value.total_income : 0}`
                    }))
                ]
            }
        },
        methods: {
            getSales () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                me.values = []

                me.loader(true)
                me.$axios.post(`api/reporting/sales/sales-by-class-package?all=1`, formData).then(res => {
                    if (res.data) {
                        res.data.result.forEach((item, key) => {
                            item.values.forEach((value, key) => {
                                me.values.push(value)
                            })
                        })
                        me.values.push(res.data.total)
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            getStudio () {
                const me = this
                let result = ''
                if (me.form.studio_id != '') {
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
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.result.data[key].open ^= true
                if (me.res.result.data[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
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
                me.$axios.post('api/reporting/sales/sales-by-class-package', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total

                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
                    }, 500)
                })
            },
            fetchData (value) {
                const me = this
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                let formData = new FormData()
                formData.append('studio_id', me.form.studio_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date',  me.form.end_date)
                formData.append('payment_status', value)
                me.$axios.post('api/reporting/sales/sales-by-class-package', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
                            me.total = res.data.total
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
                        const elements = document.querySelectorAll('.cms_table_accordion .content_wrapper')
                        elements.forEach((element, index) => {
                            element.querySelector('.accordion_table').style.height = 0
                        })
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
