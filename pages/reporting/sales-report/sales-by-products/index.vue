<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <div class="action_wrapper">
                    <div>
                        <div class="header_title">
                            <h1>Sales by Products</h1>
                            <span>{{ $moment().format('MMMM DD, YYYY') }}</span>
                        </div>
                        <h2 class="header_subtitle">Income from products sold</h2>
                    </div>
                    <div class="actions">
                        <div class="total">Total: {{ totalItems(total_count) }}</div>
                        <div class="toggler">
                            <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleTab(1)">All</div>
                            <div :class="`status ${(status == 2) ? 'active' : ''}`" @click="toggleTab(2)">Paid</div>
                            <div :class="`status ${(status == 3) ? 'active' : ''}`" @click="toggleTab(3)">Pending</div>
                        </div>
                    </div>
                </div>
                <div class="action_buttons">
                    <a href="javascript:void(0)" class="action_btn">Print</a>
                    <a href="javascript:void(0)" class="action_btn margin">Export</a>
                </div>
                <div class="filter_wrapper">
                    <form class="filter_flex" id="filter" method="post" @submit.prevent="submissionSuccess()">
                        <div class="form_group">
                            <label for="studio">Branch</label>
                            <select class="default_select alternate" name="studio">
                                <option value="" selected>All Studios</option>
                                <option :value="studio.id" v-for="(studio, key) in studios" :key="key">{{ studio.name }}</option>
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
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th class="sticky">Class Package</th>
                            <th class="sticky">Sold</th>
                            <th class="sticky">Returned</th>
                            <th class="sticky">Comp</th>
                            <th class="sticky">Discount</th>
                            <th class="sticky">Taxes</th>
                            <th class="sticky">Total Income</th>
                            <th class="sticky">Comp Value</th>
                            <th class="sticky">Cost</th>
                            <th class="sticky">Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><b>Total</b></td>
                            <td><b>500</b></td>
                            <td><b>1</b></td>
                            <td><b>4</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                            <td><b>Php 321,925</b></td>
                        </tr>
                        <tr v-for="(n, key) in 6" :key="key">
                            <td>
                                <nuxt-link class="table_data_link" :to="`${$route.path}/merchandise`">Merchandise</nuxt-link>
                            </td>
                            <td>100</td>
                            <td>2</td>
                            <td>3</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
                            <td>Php 321,925</td>
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
    import Foot from '../../../../components/Foot'
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
                studios: [],
                total_count: 0
            }
        },
        methods: {
            toggleTab (value) {
                const me = this
                me.status = value
            },
            fetchData (value) {
                const me = this
            },
            fetchStudios () {
                const me = this
                me.$axios.get('api/studios').then(res => {
                    me.studios = res.data.studios
                })
            }
        },
        mounted () {
            const me = this
            me.fetchStudios()
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
