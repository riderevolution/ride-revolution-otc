<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Add a Promo</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data">
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Promo Details</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="name">Promo Name <span>*</span></label>
                                    <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required|min: 1|max:200'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ properFormat(errors.first('name')) }}</span></transition>
                                </div>
                                <div class="form_flex">
                                    <div class="form_flex_radio">
                                        <label class="radio_label">Discount Type <span>*</span></label>
                                        <div class="form_radio">
                                            <input type="radio" id="percent" value="percent" name="discount_type" class="action_radio" checked @change="isDiscount = true">
                                            <label for="percent">Percent</label>
                                        </div>
                                        <div class="form_radio">
                                            <input type="radio" id="flat_rate" value="flat_rate" name="discount_type" class="action_radio" @change="isDiscount = false">
                                            <label for="flat_rate">Flat Rate</label>
                                        </div>
                                    </div>
                                    <div class="form_group" v-if="isDiscount">
                                        <label for="discount_percent">Percent Discount <span>*</span></label>
                                        <div class="violator">%</div>
                                        <input type="text" name="discount_percent" key="discount_percent" autocomplete="off" class="default_text" v-validate="'required|numeric|min_value:1|max_value:100'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('discount_percent')">{{ properFormat(errors.first('discount_percent')) }}</span></transition>
                                    </div>
                                    <div class="form_group" v-else>
                                        <label for="discount_flat_rate">Flat Rate Discount <span>*</span></label>
                                        <input type="text" name="discount_flat_rate" key="discount_flat_rate" autocomplete="off" class="default_text" v-validate="{required: true, regex: '^[0-9]+(\.[0-9]{1,2})?$', max_value: 99999}">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('discount_flat_rate')">{{ properFormat(errors.first('discount_flat_rate')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_group">
                                    <label for="promo_code">Promo Code <span>*</span></label>
                                    <input type="text" name="promo_code" autocomplete="off" class="default_text" v-validate="'required|min:1|max:30'">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_code')">{{ properFormat(errors.first('promo_code')) }}</span></transition>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="start_date">Start Date <span>*</span></label>
                                        <v-ctk v-model="form.start_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'start_date'" :name="'start_date'" :min-date="$moment().format('YYYY-MM-DD')" :label="'Select start date'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ properFormat(errors.first('start_date')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="start_time">Start Time <span>*</span></label>
                                        <v-ctk v-model="form.start_time" :only-time="true" :format="'hh:mm A'" :formatted="'hh:mm A'" :no-label="true" :color="'#33b09d'" :id="'start_time'" :name="'start_time'" :label="'Select start time'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has(start_time)">{{ properFormat(errors.first(start_time)) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_check">
                                    <input type="checkbox" id="no_end_date" name="no_end_date" class="action_check" :checked="(form.no_end_date == 1) ? true : false" v-model="form.no_end_date">
                                    <label for="no_end_date">No End Date</label>
                                </div>
                                <br>
                                <div :class="{'form_flex': true, 'disabled': form.no_end_date == 1 }" v-if="!form.no_end_date">
                                    <div class="form_group">
                                        <label for="end_date">End Date <span>*</span></label>
                                        <v-ctk v-model="form.end_date" :only-date="true" :format="'YYYY-MM-DD'" :formatted="'YYYY-MM-DD'" :no-label="true" :color="'#33b09d'" :id="'end_date'" :name="'end_date'" :min-date="$moment(form.start_date).format('YYYY-MM-DD')" :label="'Select end date'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ properFormat(errors.first('end_date')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="end_time">End Time <span>*</span></label>
                                        <v-ctk v-model="form.end_time" :only-time="true" :format="'hh:mm A'" :formatted="'hh:mm A'" :no-label="true" :color="'#33b09d'" :id="'end_time'" :name="'end_time'" :label="'Select end time'" v-validate="'required'"></v-ctk>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has(end_time)">{{ properFormat(errors.first(end_time)) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="redemption_limit">Redemption Limit</label>
                                        <input type="text" name="redemption_limit" autocomplete="off" class="default_text" v-validate="'numeric|min_value:1|max_value:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('redemption_limit')">{{ properFormat(errors.first('redemption_limit')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="per_customer_limit">Per Customer Limit</label>
                                        <input type="text" name="per_customer_limit" autocomplete="off" class="default_text" v-validate="'numeric|min_value:1|max_value:99999'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('per_customer_limit')">{{ properFormat(errors.first('per_customer_limit')) }}</span></transition>
                                    </div>
                                </div>
                                <div class="form_check">
                                    <input type="checkbox" id="restrict_to_new_customers" name="restrict_to_new_customers" class="action_check" checked>
                                    <label for="restrict_to_new_customers">Restrict to New Customers</label>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">{{ (filterType == 'class_packages') ? 'Class Packages' : 'Products' }}</h2>
                                <div class="form_flex_radio">
                                    <label class="radio_label">Apply this promo code to:</label>
                                    <div class="form_radio">
                                        <input type="radio" id="class_packages" value="class_packages" name="affected_type" class="action_radio" v-validate="'required'" @change="getFilter('class_packages')">
                                        <label for="class_packages">Class Packages</label>
                                    </div>
                                    <div class="form_radio">
                                        <input type="radio" id="products" value="products" name="affected_type" class="action_radio" v-validate="'required'" @change="getFilter('products')">
                                        <label for="products">Products</label>
                                    </div>
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('affected_type')">{{ properFormat(errors.first('affected_type')) }}</span></transition>
                                </div>
                            </div>
                            <transition name="fade">
                                <div class="form_main_group" v-if="isFilter">
                                    <div class="form_flex alternate">
                                        <div class="form_group">
                                            <label for="q">Search a {{ (filterType == 'class_packages') ? 'Class Packages' : 'Product' }}</label>
                                            <input type="text" name="q" autocomplete="off" v-model="form.query" :placeholder="`Search for a ${(filterType == 'class_packages') ? 'class packages' : 'products' }`" class="default_text search_alternate">
                                        </div>
                                        <div class="form_group margin" v-if="filterType == 'products'">
                                            <label for="products">Select {{ (filterType == 'class_packages') ? 'Class Packages' : 'Categories' }}</label>
                                            <select class="default_select alternate" name="category_id" v-model="form.categoryID">
                                                <option value="" selected>All {{ (filterType == 'class_packages') ? 'Class Packages' : 'Categories' }}</option>
                                                <option :value="data.id" v-for="(data, key) in filters">{{ data.name }}</option>
                                            </select>
                                        </div>
                                        <div class="button_group alt">
                                            <button type="button" name="button" class="action_btn alternate" @click="submitFilter(filterType)">Filter</button>
                                        </div>
                                    </div>
                                    <div class="form_flex select_all scrollable" v-if="filterData.length > 0">
                                        <label class="flex_label">Select {{ (filterType == 'class_packages') ? 'Class Packages' : 'Products' }}</label>
                                        <div class="form_check select_all">
                                            <div :class="`custom_action_check ${(checkData) ? 'checked' : ''}`" @click.prevent="toggleSelectAll($event)">Select All</div>
                                        </div>
                                        <div class="form_check class_package_select" v-for="(data, key) in filterData" :key="key">
                                            <input type="checkbox" :id="`data_${key}`" name="filter_data" class="action_check" v-model="data.checked">
                                            <label :for="`data_${key}`">{{ data.name }}</label>
                                            <input v-model="data.application_limit" type="number" placeholder="Promo Application Limit" class="class_package_option" v-show="data.checked && filterType == 'class_packages'">
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="hasProduct">The Product field is required</span></transition>
                                    </div>
                                    <div class="no_results" v-else>
                                        No Result(s) Found. Search another {{ (filterType == 'class_packages') ? 'Class Packages' : 'Products' }}
                                    </div>
                                </div>
                            </transition>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_check">
                                <input type="checkbox" id="show_on_web" name="show_on_web" class="action_check">
                                <label for="show_on_web">Show on Web</label>
                            </div>
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" checked>
                                    <label for="enabled">Activate</label>
                                </div>
                                <div class="button_group">
                                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Save</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                name: 'Promotions',
                access: true,
                loaded: false,
                hasProduct: false,
                isFilter: false,
                isDiscount: true,
                lastRoute: '',
                prevRoute: '',
                filters: [],
                filterType: '',
                filterValues: [],
                filterData: [],
                form: {
                    start_date: this.$moment().format('YYYY-MM-DD'),
                    start_time: '',
                    end_start: '',
                    end_time: '',
                    query: '',
                    categoryID: '',
                    no_end_date: false
                }
            }
        },
        computed: {
            checkData () {
                const me = this
                let count = 0
                let result = false
                me.filterData.forEach((data, index) => {
                    if (data.checked) {
                        count++
                    }
                })
                if (count == me.filterData.length) {
                    result = true
                } else {
                    result = false
                }
                return count
            }
        },
        methods: {
            toggleSelectAll (event) {
                const me = this
                if (me.checkData) {
                    me.filterData.forEach((data, index) => {
                        data.checked = false
                        me.hasProduct = true
                    })
                } else {
                    me.filterData.forEach((data, index) => {
                        data.checked = true
                        me.hasProduct = false
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            getFilter (type) {
                const me = this
                me.filterData = []
                let apiRoute = ''
                let formData = new FormData()
                me.filterType = type
                switch (type) {
                    case 'class_packages':
                        apiRoute = 'api/packages/class-packages?promotion=1'
                        break
                    case 'products':
                        apiRoute = 'api/inventory/product-categories'
                        break
                }
                me.$axios.get(apiRoute).then(res => {
                    if (res.data) {
                        if (type == 'class_packages') {
                            res.data.classPackages.data.forEach((data, index) => {
                                data.checked = false
                                me.filterData.push(data)
                            })
                        } else {
                            me.filters = res.data.productCategories
                            formData.append('promotion', 1)
                            formData.append('enabled', 1)
                            me.$axios.post('api/inventory/products/search', formData).then(res => {
                                if (res.data) {
                                    res.data.products.forEach((data, index) => {
                                        data.checked = false
                                        me.filterData.push(data)
                                    })
                                }
                            })
                        }
                        me.isFilter = true
                    }
                })
            },
            submitFilter (type) {
                const me = this
                me.filterData = []
                let formData = new FormData()
                formData.append('promotion', 1)
                formData.append('q', me.form.query)
                switch (type) {
                    case 'class_packages':
                        me.$axios.post('api/packages/class-packages/search', formData).then(res => {
                            if (res.data) {
                                res.data.classPackages.data.forEach((data, index) => {
                                    data.checked = false
                                    me.filterData.push(data)
                                })
                            }
                        })
                        break
                    case 'products':
                        formData.append('category_id', me.form.categoryID)
                        me.$axios.post('api/inventory/products/search', formData).then(res => {
                            if (res.data) {
                                res.data.products.forEach((data, index) => {
                                    data.checked = false
                                    me.filterData.push(data)
                                })
                            }
                        })
                        break
                }
            },
            submissionSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.filterData.forEach((data, index) => {
                        if (data.checked) {
                            ctr++
                        }
                    })
                    me.hasProduct = (ctr > 0) ? false : true
                    if (valid && !me.hasProduct) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('affecteds', JSON.stringify(me.filterData))
                        me.loader(true)
                        me.$axios.post('api/inventory/promos', formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
                                    me.$router.push(`/${me.prevRoute}/${me.lastRoute}`)
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                me.loader(false)
                            }, 500)
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
							offset: -250
						})
                    }
                })
            },
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.loaded = true
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
        }
    }
</script>

<style scoped lang="stylus">
    .form_flex
        &.disabled
            opacity: 0.5
            pointer-events: none
            cursor: not-allowed

    .class_package_select
        flex-flow: row wrap
        .class_package_option
            margin-top: 5px
            flex: 0 0 80%
            padding: 10px
</style>