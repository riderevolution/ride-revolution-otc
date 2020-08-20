<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Remaining Package Value</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">
                                Summary of rider count and revenue per class schedule
                                <ul>
                                    <li>Classes which are after the cutoff date are excluded</li>
                                    <li>Comps are excluded</li>
                                    <li>The value of unlimiteds is calculated as a ratio of days that the series has been active over the total days to expire of the series</li>
                                </ul>
                            </h2>
                        </div>
                        <div class="actions">
                            
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submissionSuccess()">
                            <div class="form_group">
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
                                <th>Class Package</th>
                                <th>Starting Class Count</th>
                                <th>Starting Value</th>
                                <th>Remaining Class Count</th>
                                <th>Remaining Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Summary</b></td>
                                <td><b>{{ totalItems(res.summary.starting_class_count) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.starting_value) }}</b></td>
                                <td><b>{{ totalItems(res.summary.remaining_class_count) }}</b></td>
                                <td><b>Php {{ totalCount(res.summary.remaining_value) }}</b></td>
                            </tr>
                            <tr v-for="(data, key) in res.classPackages" :key="key">
                                <td>{{ data.name }}</td>
                                <td>{{ (data.starting_class_count == 'Unlimited') ? data.starting_class_count : totalItems(data.starting_class_count) }}</td>
                                <td>Php {{ totalCount(data.starting_value) }}</td>
                                <td>{{ (data.remaining_class_count == 'Unlimited') ? data.remaining_class_count : totalItems(data.remaining_class_count) }}</td>
                                <td>Php {{ totalCount(data.remaining_value) }}</td>
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
    import Pagination from '../../../../components/Pagination'
    export default {
        components: {
            Foot,
            Pagination
        },
        data () {
            return {
                form: {
                    studio_id: 0,
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                },
                name: 'Remaining Class Package Value',
                access: true,
                loaded: false,
                res: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                me.fetchData()
            },
            fetchData () {
                const me = this
                let formData = new FormData
                formData.append('studio_id', me.form.studio_id)
                formData.append('start_date', me.form.start_date)
                formData.append('end_date', me.form.end_date)
                me.$axios.post('api/reporting/packages/remaining-class-package-value', formData).then(res => {
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
