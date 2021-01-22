<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Earned Class Package Revenue</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Income for each payment type</h2>
                        </div>
                        <div class="actions">
                            <!-- <div class="action_buttons">
                                <a :href="`/print/reporting/sales/earned-package-revenue?start_date=${form.start_date}&end_date=${form.end_date}`" target="_blank" class="action_btn alternate">Print</a>
                                <download-csv
                                    v-if="res.length > 0"
                                    class="action_btn alternate margin"
                                    :data="earnedPackageRevenueAttributes"
                                    :name="`earned-package-revenue-${$moment(form.start_date).format('MM-DD-YY')}-${$moment(form.end_date).format('MM-DD-YY')}.csv`">
                                    Export
                                </download-csv>
                            </div> -->
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-button="true" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-button="true" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div class="total">Total: Php {{ form.total }}</div>
                    </div>
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`${(data.open) ? 'toggled' : ''} tbp`" v-for="(data, key) in res" v-if="res.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.name }}</td>
                                <td>Php {{ totalCount(data.total) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table">
                                            <thead>
                                                <tr>
                                                    <th>{{ (data.type) ? 'Package' : 'Studio' }}</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(value, key) in data.values" :key="key">
                                                    <td>{{ value.name }}</td>
                                                    <!-- <td v-else>
                                                        <div class="table_data_link" @click="toggleInnerReport(`${$route.path}/${convertToSlug(value.name)}`, data, value)">{{ value.name }}</div>
                                                    </td> -->
                                                    <td>Php {{ getRevenue(data, value) }}</td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td colspan="2">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
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
    import Foot from '~/components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            const values = []
            return {
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD'),
                    total: 0
                },
                values: [],
                res: [],
                name: 'Earned Package Revenue',
                access: true,
                loaded: false,
            }
        },
        computed: {
            earnedPackageRevenueAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Revenue': value.name,
                        'Subtotal Revenue': `Php ${(value.values) ? me.computeValuesSubTotal(value, key) : me.totalCount(0)}`,
                        'Branch/Packages': (value.values) ? '-' : value.name,
                        'Total': `${(value.values) ? '-' : `Php ${(me.totalCount((!value.values && value.expired) ? value.expiredRevenue : value.revenue))}`}`
                    }))
                ]
            }
        },
        methods: {
            getRevenue (parent, child) {
                const me = this
                let result = 0

                if (parent.type) {
                    switch (parent.type) {
                        case 'regular':
                            result += child.regular_revenue
                            break
                        case 'unli':
                            result += child.unlimited_revenue
                            break
                        case 'expired':
                            result += child.expired_revenue
                            break
                    }
                } else {
                    result += child.revenue
                }

                return me.totalCount(result)
            },
            // toggleInnerReport (path, parent, child) {
            //     const me = this
            //     me.$router.push(`${path}?id=${child.id}&type=${parent.type}&start_date=${me.form.start_date}&end_date=${me.form.end_date}`)
            // },
            submissionSuccess () {
                const me = this
                me.values = []
                me.fetchData()
            },
            /**
             * Custom toggler for accordion
             * @param  {[object]} event
             * @param  {[int]} key
             * @return {[css]}
             */
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res[key].open ^= true
                if (me.res[key].open) {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                } else {
                    target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                }
            },
            fetchData () {
                const me = this
                me.form.total = 0
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)

                me.$axios.post('api/reporting/packages/earned-class-package-revenue', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data.groupings

                            me.form.total = me.totalCount(res.data.total)
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data
                    me.$store.state.errorStatus = true
                }).then(() => {
                    setTimeout( () => {
                        me.loader(false)
                        const elements = document.querySelectorAll('.cms_table_accordion .tbp')
                        elements.forEach((element, index) => {
                            element.classList.remove('toggled')
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
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
