<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Promotions Redeemed</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                        <h2 class="header_subtitle">List of promos used by customers</h2>
                    </div>
                    <div class="actions">
                        <div class="action_buttons">
                            <a href="javascript:void(0)" class="action_btn">Print</a>
                            <a href="javascript:void(0)" class="action_btn margin">Export</a>
                        </div>
                    </div>
                </div>
                <div class="filter_wrapper">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                        <div class="form_group">
                            <label for="promo">Promo</label>
                            <select class="default_select alternate" name="promo">
                                <option value="" selected>All Promos</option>
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
                <div class="cms_table_toggler">
                    <div class="total">Grand Total: {{ totalItems(total_count) }}</div>
                </div>
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th class="sticky">Date Redeemed</th>
                            <th class="sticky">Full Name</th>
                            <th class="sticky">Promo</th>
                            <th class="sticky">Promo Code</th>
                            <th class="sticky">Discount</th>
                            <th class="sticky">Total Discount</th>
                            <th class="sticky">Remaining</th>
                            <th class="sticky">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(n, key) in 5" :key="key">
                            <td>{{ $moment().format('MMMM DD, YYYY') }}</td>
                            <td><nuxt-link class="table_data_link" to="/customers">Sample Sample</nuxt-link></td>
                            <td>BDO12</td>
                            <td>124</td>
                            <td>20%</td>
                            <td>Php 24,000</td>
                            <td>8</td>
                            <td>Active</td>
                        </tr>
                    </tbody>
                    <!-- <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody> -->
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
                rowCount: 0,
                status: 1,
                res: [],
                total_count: 0
            }
        },
        methods: {
            submissionSuccess () {
                const me = this

            },
            fetchData (value) {
                const me = this
            }
        },
        mounted () {
            const me = this
            me.fetchData(1)
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
        }
    }
</script>
