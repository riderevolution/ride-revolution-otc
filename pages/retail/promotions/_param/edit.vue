<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table">
                <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                <div class="action_wrapper">
                    <h1 class="header_title">Update {{ res.name }}</h1>
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
                                <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required'" v-model="res.name">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') }}</span></transition>
                            </div>
                            <div class="form_flex">
                                <div class="form_flex_radio">
                                    <label class="radio_label">Discount Type <span>*</span></label>
                                    <div class="form_radio">
                                        <input type="radio" id="percent" value="percent" name="discount_type" class="action_radio" @change="isDiscount = true" :checked="(res.discount_type == 'percent') ? true : false">
                                        <label for="percent">Percent</label>
                                    </div>
                                    <div class="form_radio">
                                        <input type="radio" id="flat_rate" value="flat_rate" name="discount_type" class="action_radio" @change="isDiscount = false" :checked="(res.discount_type == 'flat_rate') ? true : false">
                                        <label for="flat_rate">Flat Rate</label>
                                    </div>
                                </div>
                                <div class="form_group" v-if="isDiscount">
                                    <label for="discount">Percent Discount <span>*</span></label>
                                    <div class="violator">%</div>
                                    <input type="text" name="discount_percent" autocomplete="off" class="default_text" v-validate="'required|numeric'" v-model="res.discount_percent">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('discount')">{{ errors.first('discount') }}</span></transition>
                                </div>
                                <div class="form_group" v-else>
                                    <label for="discount">Flat Rate Discount <span>*</span></label>
                                    <input type="text" name="discount_flat_rate" autocomplete="off" class="default_text" v-validate="'required|numeric'" v-model="res.discount_flat_rate">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('discount')">{{ errors.first('discount') }}</span></transition>
                                </div>
                            </div>
                            <div class="form_group">
                                <label for="promo_code">Promo Code <span>*</span></label>
                                <input type="text" name="promo_code" autocomplete="off" class="default_text" v-validate="'required'" v-model="res.promo_code">
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('promo_code')">{{ errors.first('promo_code') }}</span></transition>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="start_date">Start Date <span>*</span></label>
                                    <input type="date" name="start_date" autocomplete="off" class="default_text date" v-validate="'required'" v-model="res.start_date">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('start_date')">{{ errors.first('start_date') }}</span></transition>
                                </div>
                                <div class="form_group flex alternate">
                                    <label>Start Time<span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="start_time_hour" class="default_text" autocomplete="off" v-model="form.start.hour" maxlength="2" v-validate="'required|numeric|max_value:12|min_value:0'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_time_hour')">{{ errors.first('start_time_hour') }}</span></transition>
                                    </div>
                                    <div class="form_flex_separator">:</div>
                                    <div class="form_flex_input">
                                        <input type="text" name="start_time_minutes" class="default_text" autocomplete="off" v-model="form.start.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_time_minutes')">{{ errors.first('start_time_minutes') }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <input type="text" name="start_convention" class="default_text number no_click" autocomplete="off" v-model="form.start.convention" v-validate="'required'">
                                        <div class="up" @click="changeConvention('start')"></div>
                                        <div class="down" @click="changeConvention('start')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('start_convention')">{{ errors.first('start_convention') }}</span></transition>
                                    </div>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="end_date">End Date <span>*</span></label>
                                    <input type="date" name="end_date" autocomplete="off" class="default_text date" v-validate="'required'" v-model="res.end_date">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('end_date')">{{ errors.first('end_date') }}</span></transition>
                                </div>
                                <div class="form_group flex alternate">
                                    <label>End Time<span>*</span></label>
                                    <div class="form_flex_input">
                                        <input type="text" name="end_time_hour" class="default_text" autocomplete="off" v-model="form.end.hour" maxlength="2" v-validate="'required|numeric|max_value:12|min_value:0'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('end_time_hour')">{{ errors.first('end_time_hour') }}</span></transition>
                                    </div>
                                    <div class="form_flex_separator">:</div>
                                    <div class="form_flex_input">
                                        <input type="text" name="end_time_minutes" class="default_text" autocomplete="off" v-model="form.end.mins" maxlength="2" v-validate="'required|numeric|max_value:60|min_value:0'">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('end_time_minutes')">{{ errors.first('end_time_minutes') }}</span></transition>
                                    </div>
                                    <div class="form_flex_input">
                                        <input type="text" name="end_convention" class="default_text number no_click" autocomplete="off" v-model="form.end.convention" v-validate="'required'">
                                        <div class="up" @click="changeConvention('end')"></div>
                                        <div class="down" @click="changeConvention('end')"></div>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('end_convention')">{{ errors.first('end_convention') }}</span></transition>
                                    </div>
                                </div>
                            </div>
                            <div class="form_flex">
                                <div class="form_group">
                                    <label for="redemption_limit">Redemption Limit <span>*</span></label>
                                    <input type="text" name="redemption_limit" autocomplete="off" class="default_text" v-validate="'required|numeric'" v-model="res.redemption_limit">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('redemption_limit')">{{ errors.first('redemption_limit') }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="per_customer_limit">Per Customer Limit <span>*</span></label>
                                    <input type="text" name="per_customer_limit" autocomplete="off" class="default_text" v-validate="'required|numeric'" v-model="res.per_customer_limit">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('per_customer_limit')">{{ errors.first('per_customer_limit') }}</span></transition>
                                </div>
                            </div>
                            <div class="form_check">
                                <input type="checkbox" id="restrict_to_new_customers" name="restrict_to_new_customers" class="action_check" :checked="(res.restrict_to_new_customers == 1) ? true : false">
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
                                    <input type="radio" id="class_packages" value="class_packages" :checked="(res.affected_type == 'class_packages') ? true : false" name="affected_type" class="action_radio" v-validate="'required'" @change="getFilter('class_packages')">
                                    <label for="class_packages">Class Packages</label>
                                </div>
                                <div class="form_radio">
                                    <input type="radio" id="products" value="products" name="affected_type" :checked="(res.affected_type == 'products') ? true : false" class="action_radio" v-validate="'required'" @change="getFilter('products')">
                                    <label for="products">Products</label>
                                </div>
                                <transition name="slide"><span class="validation_errors" v-if="errors.has('affected_type')">{{ errors.first('affected_type') }}</span></transition>
                            </div>
                        </div>
                        <transition name="fade">
                            <div class="form_main_group" v-if="isFilter">
                                <div class="form_flex alternate">
                                    <div :class="`form_group ${(filterType == 'class_packages') ? 'full' : ''}`">
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
                                    <div class="button_group">
                                        <button type="button" name="button" class="action_btn alternate" @click="submitFilter(filterType)">Filter</button>
                                    </div>
                                </div>
                                <div class="form_flex scrollable" v-if="filterData.length > 0">
                                    <label class="flex_label">Select {{ (filterType == 'class_packages') ? 'Class Packages' : 'Products' }}</label>
                                    <div class="form_check select_all">
                                        <div :class="`custom_action_check ${(checkData) ? 'checked' : ''}`" @click.prevent="toggleSelectAll($event)">Select All</div>
                                    </div>
                                    <div class="form_check" v-for="(data, key) in filterData" :key="key">
                                        <input type="checkbox" :id="`data_${key}`" name="filter_data" class="action_check" v-model="data.checked">
                                        <label :for="`data_${key}`">{{ data.name }}</label>
                                    </div>
                                </div>
                                <div class="no_results" v-else>
                                    No Result(s) Found. Search another {{ (filterType == 'class_packages') ? 'Class Packages' : 'Products' }}
                                </div>
                            </div>
                        </transition>
                    </div>
                    <div class="form_footer_wrapper">
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
</template>

<script>
    import Foot from '../../../../components/Foot'
    export default {
        components: {
            Foot
        },
        data () {
            return {
                isFilter: false,
                isDiscount: true,
                lastRoute: '',
                prevRoute: '',
                res: [],
                filters: [],
                filterType: '',
                filterValues: [],
                filterData: [],
                form: {
                    start: {
                        hour: '00',
                        mins: '00',
                        convention: 'AM'
                    },
                    end: {
                        hour: '00',
                        mins: '00',
                        convention: 'PM'
                    },
                    query: '',
                    categoryID: ''
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
                return result
            }
        },
        methods: {
            toggleSelectAll (event) {
                const me = this
                if (me.checkData) {
                    me.filterData.forEach((data, index) => {
                        data.checked = false
                    })
                } else {
                    me.filterData.forEach((data, index) => {
                        data.checked = true
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
                let apiRoute = ''
                let formData = new FormData()
                me.filterType = type
                switch (type) {
                    case 'class_packages':
                        apiRoute = `api/packages/class-packages?promotion=1&promo_id=${me.res.id}`
                        break
                    case 'products':
                        apiRoute = 'api/inventory/product-categories'
                        break
                }
                me.$axios.get(apiRoute).then(res => {
                    if (res.data) {
                        if (type == 'class_packages') {
                            me.filterData = res.data.classPackages.data
                        } else {
                            me.filters = res.data.productCategories
                            formData.append('promotion', 1)
                            formData.append('enabled', 1)
                            me.$axios.post(`api/inventory/products/search?promo_id=${me.res.id}`, formData).then(res => {
                                if (res.data) {
                                    me.filterData = res.data.products
                                }
                            })
                        }
                        me.isFilter = true
                    }
                })
            },
            changeConvention (type) {
                const me = this
                switch (type) {
                    case 'start':
                        me.form.start.convention = (me.form.start.convention == 'AM') ? 'PM' : 'AM'
                        break
                    case 'end':
                        me.form.start.end = (me.form.start.end == 'AM') ? 'PM' : 'AM'
                        break
                }
            },
            submitFilter (type) {
                const me = this
                let formData = new FormData()
                formData.append('promotion', 1)
                formData.append('q', me.form.query)
                switch (type) {
                    case 'class_packages':
                        me.$axios.post('api/packages/class-packages/search', formData).then(res => {
                            if (res.data) {
                                me.filterData = res.data.classPackages
                            }
                        })
                        break
                    case 'products':
                        formData.append('category_id', me.form.categoryID)
                        me.$axios.post('api/inventory/products/search', formData).then(res => {
                            if (res.data) {
                                me.filterData = res.data.products
                            }
                        })
                        break
                }
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        formData.append('affecteds', JSON.stringify(me.filterData))
                        formData.append('start_time', `${me.form.start.hour}:${me.form.start.mins} ${me.form.start.convention}`)
                        formData.append('end_time', `${me.form.end.hour}:${me.form.end.mins} ${me.form.end.convention}`)
                        me.loader(true)
                        me.$axios.post(`api/inventory/promos/${me.$route.params.param}`, formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Updated')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$router.push(`/${me.prevRoute}/${me.lastRoute}`)
                                }
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
            me.$axios.get(`api/inventory/promos/${me.$route.params.param}`).then(res => {
                if (res.data) {
                    me.res = res.data.promo
                    me.form.start.hour = me.res.start_time.split(':')[0]
                    me.form.start.mins = me.res.start_time.split(':')[1].split(' ')[0]
                    me.form.start.convention = me.res.start_time.split(':')[1].split(' ')[1]
                    me.form.end.hour = me.res.end_time.split(':')[0]
                    me.form.end.mins = me.res.end_time.split(':')[1].split(' ')[0]
                    me.form.end.convention = me.res.end_time.split(':')[1].split(' ')[1]
                    me.isDiscount = (me.res.discount_type == 'percent') ? true : false
                    me.getFilter(me.res.affected_type)
                    me.filterType = me.res.affected_type
                }
            })
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
