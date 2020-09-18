<template>
    <transition name="fade">
        <div class="upcoming_classes_layout table" v-if="loaded">
            <div class="background"></div>
            <div class="action_back_btn" @click="toggleClose()"><img src="/icons/back-icon.svg"><span>Booker</span></div>
            <div class="table_layout">
                <h2>{{ customer.first_name }}'s Class Packages</h2>
                <div class="actions">
                    <div class="total">Total: {{ packageCount }}</div>
                    <div class="cms_table_toggler">
                        <div :class="`status ${(packageStatus == 'all') ? 'active' : ''}`" @click="initial('all')">Owned</div>
                        <div :class="`status ${(packageStatus == 'shared') ? 'active' : ''}`" @click="initial('shared')">Shared</div>
                        <div :class="`status ${(packageStatus == 'frozen') ? 'active' : ''}`" @click="initial('frozen')">Frozen</div>
                    </div>
                </div>
                <table class="cms_table">
                    <thead>
                        <tr>
                            <th>Package Name</th>
                            <th>Package ID</th>
                            <th>Classes Left</th>
                            <th>Classes Used</th>
                            <th>Purchase / Activation</th>
                            <th>Expiry Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody v-if="res.user_package_counts.length > 0">
                        <tr v-for="(data, key) in populatePackages" :key="key" v-if="data.count > 0 && !data.expired">
                            <td>{{ data.class_package.name }}</td>
                            <td>{{ data.class_package.sku_id }}</td>
                            <td>{{ (data.class_package.class_count_unlimited == 1) ? 'Unlimited' : (parseInt(data.count) == data.original_package_count) ? parseInt(data.original_package_count) : parseInt(data.count) }}</td>
                            <td>{{ parseInt(data.original_package_count) - parseInt(data.count) }}</td>
                            <td>{{ formatDate(data.created_at, false) }} / {{ (data.activation_date != 'NA') ? formatDate(data.activation_date, false) : 'N/A' }}</td>
                            <td>{{ (data.class_package.computed_expiration_date) ? formatDate(data.class_package.computed_expiration_date, false) : 'N/A' }}</td>
                            <td class="violator">
                                <span class="warning" v-if="parseInt($moment(data.class_package.computed_expiration_date).diff($moment())) < 0">{{ checkViolator(data, 'warning') }}</span>
                                <span class="shared" v-if="data.sharedto_user_id != null">{{ checkViolator(data, 'shared') }}</span>
                                <span class="frozen" v-if="data.frozen">Frozen</span>
                            </td>
                        </tr>
                    </tbody>
                    <tbody class="no_results" v-else>
                        <tr>
                            <td :colspan="rowCount">No Result(s) Found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </transition>
</template>

<script>
    export default {
        props: {
            customer: {
                default: null
            }
        },
        data () {
            return {
                packageStatus: 'all',
                loaded: false,
                rowCount: 0,
                packageCount: 0,
                res: []
            }
        },
        computed: {
            populatePackages () {
                const me = this
                let result = []
                let current = me.$moment()
                me.res.user_package_counts.forEach((element, index) => {
                    let expiry = me.$moment(element.class_package.computed_expiration_date)
                    if (parseInt(expiry.diff(current, 'days')) > 0) {
                        element.expired = false
                    } else {
                        element.expired = true
                    }
                    if (element.count > 0) {
                        me.packageCount++
                    }
                    result.push(element)
                })
                return result
            }
        },
        methods: {
            checkViolator (data, type) {
                const me = this
                let result = ''
                let expiry = me.$moment(data.class_package.computed_expiration_date)
                let current = me.$moment()
                switch (type) {
                    case 'warning':
                        if (expiry.diff(current, 'days') == 0) {
                            result = expiry.diff(current, 'hours') + ' Hours Left'
                        } else {
                            result = expiry.diff(current, 'days') + ' Days Left'
                        }
                        break
                    case 'shared':
                        if (me.customer.id == data.user_id) {
                            result = `Shared with ${data.sharedto_user.first_name} ${data.sharedto_user.last_name}`
                        } else {
                            result = `Shared by ${data.sharedby_user.first_name} ${data.sharedby_user.last_name}`
                        }
                        break;
                }
                return result
            },
            toggleClose () {
                const me = this
                me.$store.state.packageLayoutStatus = false
            },
            formatDate (value, withTime) {
                if (value) {
                    if (withTime) {
                        return this.$moment(value).format('MMM DD, YYYY hh:mm A')
                    } else {
                        return this.$moment(value).format('MMM DD, YYYY')
                    }
                }
            },
            initial (status) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/customers/${me.customer.id}/packages?packageStatus=${status}`).then(res => {
                    if (res.data) {
                        setTimeout( () => {
                            me.packageCount = 0
                            me.res = res.data.customer
                            me.loaded = true
                        }, 500)
                    }
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.packageStatus = status
                        me.loader(false)
                    }, 500)
                })
            }
        },
        mounted () {
            const me = this
            me.initial('all')
        }
    }
</script>
