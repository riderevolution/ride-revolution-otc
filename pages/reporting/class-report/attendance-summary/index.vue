<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance Summary</h1>
                                <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Summary of rider count and revenue per class schedule</h2>
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
                                <label for="start_date">Start Date</label>
                                <input type="date" name="start_date" class="default_text date" />
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date</label>
                                <input type="date" name="end_date" class="default_text date" />
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <table class="cms_table alt">
                        <thead>
                            <tr>
                                <th class="stick">Date</th>
                                <th class="stick">Total Rides</th>
                                <th class="stick">Paying Riders</th>
                                <th class="stick">Comped Riders</th>
                                <th class="stick">First Timers</th>
                                <th class="stick">No Shows</th>
                                <th class="stick">Cancel</th>
                                <th class="stick">Waitlist</th>
                                <th class="stick">Repeat</th>
                                <th class="stick">Avg Riders</th>
                                <th class="stick">Number Classes</th>
                                <th class="stick">Avg Spots</th>
                                <th class="stick">Total Bikes</th>
                                <th class="stick">Capacity</th>
                                <th class="stick">Paying</th>
                                <th class="stick">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><b>Summary</b></td>
                                <td><b>165</b></td>
                                <td><b>23</b></td>
                                <td><b>23</b></td>
                                <td><b>23</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>0</b></td>
                                <td><b>86%</b></td>
                                <td><b>83%</b></td>
                                <td><b>1000</b></td>
                            </tr>
                            <tr v-for="(n, key) in 10" :key="key">
                                <td>{{ $moment().format('MMM DD, YYYY') }}</td>
                                <td>165</td>
                                <td>23</td>
                                <td>23</td>
                                <td>23</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>0</td>
                                <td>86%</td>
                                <td>83%</td>
                                <td>1000</td>
                            </tr>
                        </tbody>
                        <!-- <tbody class="no_results" v-else>
                            <tr>
                                <td :colspan="rowCount">No Result(s) Found.</td>
                            </tr>
                        </tbody> -->
                    </table>
                    <!-- <pagination :apiRoute="res.customers.path" :current="res.customers.current_page" :last="res.customers.last_page" /> -->
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
                range: {
                    start: new Date(),
                    end: new Date()
                },
                loaded: false,
                rowCount: 0,
                res: [],
                types: []
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
            },
            fetchData () {
                const me = this
                me.loaded = true
            },
            fetchTypes () {
                const me = this
                me.$axios.get('api/extras/customer-types').then(res => {
                    me.types = res.data.customerTypes
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            me.fetchTypes()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
