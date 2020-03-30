<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Attendance with Revenue</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                        <h2 class="header_subtitle">Revenue for each class schedule</h2>
                    </div>
                    <div class="actions">
                        <a href="javascript:void(0)" class="action_btn">Print</a>
                        <a href="javascript:void(0)" class="action_btn margin">Export</a>
                    </div>
                </div>
                <div class="filter_wrapper">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                        <div class="form_group">
                            <label for="type">Branch</label>
                            <select class="default_select alternate" name="type">
                                <option value="" selected>All Customer Types</option>
                                <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="type">Class Type</label>
                            <select class="default_select alternate" name="type">
                                <option value="" selected>All Customer Types</option>
                                <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="type">Class Package</label>
                            <select class="default_select alternate" name="type">
                                <option value="" selected>All Customer Types</option>
                                <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="type">Instructor</label>
                            <select class="default_select alternate" name="type">
                                <option value="" selected>All Customer Types</option>
                                <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="type">Customer Type</label>
                            <select class="default_select alternate" name="type">
                                <option value="" selected>All Customer Types</option>
                                <option :value="type.id" v-for="(type, key) in types" :key="key">{{ type.name }}</option>
                            </select>
                        </div>
                        <div class="form_group margin">
                            <label for="range">Date Range</label>
                            <no-ssr>
                                <vc-date-picker
                                    mode='range'
                                    v-model="range"
                                    :input-props='{
                                        class: "vc-appearance-none default_select alternate",
                                        id: "range",
                                        name: "range",
                                        readonly: true
                                    }'
                                />
                            </no-ssr>
                        </div>
                        <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                    </form>
                </div>
            </section>
            <section id="content">
                <table class="cms_table_accordion">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Class Type</th>
                            <th>Instructor</th>
                            <th>Total Riders</th>
                            <th>Total Revenue</th>
                            <th>Total Discount</th>
                            <th>Total Net Revenue</th>
                        </tr>
                    </thead>
                    <tbody :class="`${(role.open) ? 'toggled' : ''}`" v-for="(role, key) in res">
                        <tr class="parent">
                            <td class="toggler" @click.self="toggleAccordion($event, key)">{{ $moment().format('MMMM DD, YYYY') }}</td>
                            <td>{{ $moment().format('h:mm A') }}</td>
                            <td>Ride Rev</td>
                            <td>Billie Capistrano</td>
                            <td>4</td>
                            <td>Php 3,000</td>
                            <td>4</td>
                            <td>Php 3,000</td>
                        </tr>
                        <tr>
                            <td class="pads" colspan="8">
                                <div class="accordion_table">
                                    <table class="cms_table">
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
                                        <tbody v-if="role.staff_details.length > 0">
                                            <tr v-for="(staff, key) in role.staff_details" :key="key">
                                                <td>{{ key + 1 }}</td>
                                                <td>Anna Walker</td>
                                                <td>Paying</td>
                                                <td>First Timer Package</td>
                                                <td>Php 1,100</td>
                                                <td>Php 0</td>
                                                <td>Php 1,100</td>
                                            </tr>
                                        </tbody>
                                        <tbody class="no_results" v-else>
                                            <tr>
                                                <td :colspan="rowCount">No Result(s) Found.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../.././../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                range: {
                    start: new Date(),
                    end: new Date()
                },
                isUser: 0,
                id: 0,
                type: 0,
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0,
                studios: [],
                types: [],
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                let formData = new FormData(document.getElementById('filter'))
                formData.append('enabled', me.status)
                me.loader(true)
                me.$axios.post(`api/staff/search`, formData).then(res => {
                    me.res = res.data.roles
                    me.rowCount = 4
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
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
            /**
             * Count Permissions per role
             * @param  {[array]} values
             * @return {[ctr]}
             */
            countPermissions (values) {
                const me = this
                if (values !== undefined) {
                    let ctr = 0
                    values.forEach((value, index) => {
                        if (value.checked) {
                            ctr++
                        }
                    })
                    if (ctr == 16) {
                        return 'All'
                    } else {
                        return ctr
                    }
                }
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
            toggleOnOff (value) {
                const me = this
                me.status = value
                me.fetchData(value)
                setTimeout( () => {
                    me.rowCount = document.getElementsByTagName('th').length
                }, 10)
            },
            async fetchData (value) {
                const me = this
                me.loader(true)
                me.rowCount = 4
                if (value != -1) {
                    me.$axios.get(`api/roles?enabled=${value}`).then(res => {
                        me.res = res.data.roles
                        me.total_count = me.res.length
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
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
                } else {
                    me.$axios.get(`api/staff?enabled=0`).then(res => {
                        me.res = res.data.staff.data
                        me.total_count = me.res.length
                    }).catch(err => {
                        me.$store.state.errorList = err.response.data.errors
                        me.$store.state.errorStatus = true
                    }).then(() => {
                        setTimeout( () => {
                            me.loader(false)
                        }, 500)
                    })
                }
            },
            async fetchStudios () {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            me.fetchStudios()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
