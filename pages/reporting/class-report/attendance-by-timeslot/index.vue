<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <div class="action_wrapper">
                        <div>
                            <div class="header_title">
                                <h1>Attendance by Timeslot</h1>
                                <span>{{ $moment(form.start_date).format('MMMM DD, YYYY') }}</span>
                            </div>
                            <h2 class="header_subtitle">Average attendance per time slot.</h2>
                        </div>
                        <div class="actions">
                            <a href="javascript:void(0)" class="action_btn alternate">Print</a>
                            <a href="javascript:void(0)" class="action_btn alternate margin">Export</a>
                        </div>
                    </div>
                    <div class="filter_wrapper">
                        <form class="filter_flex" id="filter" @submit.prevent="submitFilter()">
                            <div class="form_group">
                                <label for="studio_id">Studio</label>
                                <select class="default_select alternate" name="studio_id">
                                    <option value="" selected>All Studios</option>
                                    <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="class_type_id">Class Type</label>
                                <select class="default_select alternate" name="class_type_id">
                                    <option value="" selected>All Class Type</option>
                                </select>
                            </div>
                            <div class="form_group margin">
                                <label for="start_date">Start Date</label>
                                <input type="date" name="start_date" v-model="form.start_date" class="default_text date" />
                            </div>
                            <div class="form_group margin">
                                <label for="end_date">End Date</label>
                                <input type="date" name="end_date" v-model="form.end_date"  class="default_text date" />
                            </div>
                            <button type="submit" name="button" class="action_btn alternate margin">Search</button>
                        </form>
                    </div>
                </section>
                <section id="content">
                    <div class="cms_table_toggler">
                        <div :class="`status ${(tabStatus == 'weekdays') ? 'active' : ''}`" @click="toggleTab('weekdays')">Weekdays</div>
                        <div :class="`status ${(tabStatus == 'weekends') ? 'active' : ''}`" @click="toggleTab('weekends')">Weekends</div>
                    </div>
                    <div class="cms_five_row">
                        <div class="column" v-for="(n, key) in 5" :key="key">
                            <div class="column_header">
                                <div class="day">{{ $moment().add(n, 'days').format('dddd') }}</div>
                                <div class="avg">Avg. 9</div>
                            </div>
                            <div class="column_content">
                                <table class="cms_table_alt">
                                    <thead>
                                        <tr>
                                            <th>Time Slots</th>
                                            <th>Avg. Total Riders</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(n, key) in 10" :key="key">
                                            <td class="name">{{ $moment().format('h:mm A') }}</td>
                                            <td>
                                                {{ n }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
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
            return {
                loaded: false,
                rowCount: 0,
                tabStatus: 'weekdays',
                studios: [],
                categories: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    end_date: this.$moment().format('YYYY-MM-DD')
                }
            }
        },
        methods: {
            toggleTab (status) {
                const me = this
                me.tabStatus = status
            },
            submitFilter () {
                const me = this
            },
            fetchData () {
                const me = this
                me.$axios.get('api/studios?enabled=1').then(res => {
                    if (res.data) {
                        me.studios = res.data.studios
                    }
                })
                me.loaded = true
            }
        },
        mounted () {
            const me = this
            setTimeout( () => {
                me.fetchData()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 500)
        }
    }
</script>
