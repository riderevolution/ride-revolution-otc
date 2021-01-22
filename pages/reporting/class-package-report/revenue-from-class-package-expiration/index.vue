<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Revenue From Class Package Expiration</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Expiration details of each class package</h2>
                        </div>
                        <div class="actions">
                            <!-- <a :href="`/print/reporting/class-package/remaining-package-value?start_date=${form.start_date}`" target="_blank" class="action_btn alternate">Print</a>

                            <div class="action_btn alternate" @click="getPackages()" v-if="res.groups.length > 0">
                                Export
                            </div>
                            <download-csv
                                v-if="res.groups.length > 0"
                                class="hidden me"
                                :data="remainingPackageValueAttributes"
                                :name="`remaining-package-value-${$moment(form.start_date).format('MM-DD-YY-hh-mm')}.csv`">
                                Export
                            </download-csv> -->
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
                                <label for="start_date">Start Date <span>*</span></label>
                                <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :label="'Select start date'" v-validate="'required'" :max-date="$moment().format('YYYY-MM-DD')"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date <span>*</span></label>
                                <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :no-button="true" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :label="'Select end date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :max-date="$moment().format('YYYY-MM-DD')" v-validate="'required'"></v-ctk>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tab == 'studio') ? 'active' : ''}`" @click="toggleStatus('studio')">Studio</div>
                        <div :class="`status ${(tab == 'online') ? 'active' : ''}`" @click="toggleStatus('online')">Online</div>
                    </div>
                    <table class="cms_table_accordion">
                        <thead>
                            <tr>
                                <th>Group</th>
                                <th>Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody :class="`content_wrapper ${(data.open) ? 'toggled' : ''}`" v-for="(data, key) in res.groups" v-if="res.groups.length > 0">
                            <tr class="parent">
                                <td class="toggler" @click.self="toggleAccordion($event, key)">{{ data.name }}</td>
                                <td>Php {{ totalCount(data.revenue) }}</td>
                            </tr>
                            <tr>
                                <td class="pads" colspan="8">
                                    <div class="accordion_table">
                                        <table class="cms_table alt">
                                            <thead>
                                                <tr>
                                                    <th>Package Type</th>
                                                    <th>Class Package</th>
                                                    <th>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody v-if="data.values.length > 0">
                                                <tr v-for="(value, key) in data.values" :key="key">
                                                    <td>{{ value.package_type.name }}</td>
                                                    <td>{{ value.name }}</td>
                                                    <td>Php {{ totalCount((data.not_activated) ? value.expiration_revenue : value.expired_revenue) }}</td>
                                                </tr>
                                            </tbody>
                                            <tbody class="no_results" v-else>
                                                <tr>
                                                    <td colspan="7">No Result(s) Found.</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tbody class="no_results" v-if="res.groups.length == 0">
                            <tr>
                                <td colspan="8">No Result(s) Found.</td>
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
    import Pagination from '~/components/Pagination'

    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            const values = []
            return {
                form: {
                    start_date: this.$moment().subtract(1, 'month').format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Remaining Class Package Value',
                access: true,
                filter: true,
                loaded: false,
                res: [],
                tab: 'studio',
                values: []
            }
        },
        computed: {
            remainingPackageValueAttributes () {
                const me = this
                return [
                    ...me.values.map((value, key) => ({
                        'Package Type': value.package_type.name,
                        'Class Package': value.name,
                        'Starting Class Count': (value.starting_class_count == 'Unlimited') ? value.starting_class_count : me.totalItems(value.starting_class_count),
                        'Starting Value': `Php ${me.totalCount(value.starting_value)}`,
                        'Remaining Class Count': (value.remaining_class_count == 'Unlimited') ? value.remaining_class_count : me.totalItems(value.remaining_class_count),
                        'Remaining Value': `Php ${me.totalCount(value.remaining_value)}`
                    }))
                ]
            }
        },
        methods: {
            toggleAccordion (event, key) {
                const me = this
                const target = event.target
                me.res.groups[key].open ^= true
                if (me.res.groups[key].open) {
                    if (target.parentNode.parentNode.querySelector('.accordion_table')) {
                        target.parentNode.parentNode.querySelector('.accordion_table').style.height = `${target.parentNode.parentNode.querySelector('.accordion_table').scrollHeight}px`
                    }
                } else {
                    if (target.parentNode.parentNode.querySelector('.accordion_table')) {
                        target.parentNode.parentNode.querySelector('.accordion_table').style.height = 0
                    }
                }
            },
            toggleStatus (value) {
                const me = this
                me.tab = value

                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', me.tab)

                me.loader(true)
                me.$axios.post('api/reporting/packages/class-package-expiration', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
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
                            if (element.querySelector('.accordion_table')) {
                                element.querySelector('.accordion_table').style.height = 0
                            }
                        })
                    }, 500)
                })
            },
            getPackages () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('all', 1)
                me.values = []
                me.loader(true)
                me.$axios.post('api/reporting/packages/class-package-expiration', formData).then(res => {
                    if (res.data) {

                        res.data.classPackages.forEach((item, index) => {
                            me.values.push(item)
                        })
                    }
                }).catch((err) => {

                }).then(() => {
                    me.loader(false)
                    document.querySelector('.me').click()
                })
            },
            submissionSuccess () {
                const me = this
                me.fetchData()
            },
            fetchData () {
                const me = this
                me.loader(true)
                let formData = new FormData()
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                formData.append('type', 'studio')
                me.$axios.post('api/reporting/packages/class-package-expiration', formData).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.res = res.data
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
                            if (element.querySelector('.accordion_table')) {
                                element.querySelector('.accordion_table').style.height = 0
                            }
                        })
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loader(true)
                let token = me.$cookies.get('70hokcotc3hhhn5')
                me.$axios.get('api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.data != 0) {
                        setTimeout( () => {
                            me.form.studio_id = res.data.user.current_studio_id
                            me.fetchData()
                        }, 500)
                    }
                }).catch(err => {
                    me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
                })
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
