<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ lastRoute }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Update {{ res.name }}</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" class="alternate" @submit.prevent="submissionSuccess()" enctype="multipart/form-data" v-if="loaded">
                        <div class="form_flex_wrapper">
                            <div class="form_wrapper main">
                                <div class="form_main_group">
                                    <div class="form_group">
                                        <label for="name">Product Name <span>*</span></label>
                                        <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required|min:10|max:200'" v-model="form.title = res.name">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ properFormat(errors.first('name')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="description">Description <span>*</span></label>
                                        <textarea name="description" rows="10" class="default_text" @input="getCount($event)" maxlength="1000" v-model="res.description" v-validate="'required|max:1000'"></textarea>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('description')">{{ properFormat(errors.first('description')) }}</span></transition>
                                        <div class="limit">
                                            <span class="field_limit">1000</span> <span class="field_label">Characters</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form_wrapper side">
                                <div class="form_main_group">
                                    <div class="form_group" v-if="!$route.query.c">
                                        <label for="product_category_id">Category <span>*</span></label>
                                        <select class="default_select alternate" name="product_category_id" v-validate="'required'">
                                            <option value="" disabled>Choose a Category</option>
                                            <option :value="category.id" :selected="res.category_id == category.id" v-for="(category, key) in categories">{{ category.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('product_category_id')">{{ properFormat(errors.first('product_category_id')) }}</span></transition>
                                    </div>
                                    <div class="form_group" v-if="$route.query.c">
                                        <label for="product_category_name">Category <span>*</span></label>
                                        <input type="text" name="product_category_name" autocomplete="off" class="default_text disabled" v-validate="'required|max:50'" v-model="form.category.name">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('product_category_name')">{{ properFormat(errors.first('product_category_name')) }}</span></transition>
                                        <input type="hidden" name="product_category_id" v-model="form.category.id">
                                    </div>
                                    <div class="form_group" v-if="!$route.query.s">
                                        <label for="supplier_id">Supplier <span>*</span></label>
                                        <select class="default_select alternate" name="supplier_id" v-validate="'required'">
                                            <option value="" selected>Choose a Supplier</option>
                                            <option :value="supplier.id" :selected="res.supplier_id == supplier.id" v-for="(supplier, key) in suppliers">{{ supplier.name }}</option>
                                        </select>
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('supplier_id')">{{ properFormat(errors.first('supplier_id')) }}</span></transition>
                                    </div>
                                    <div class="form_group" v-if="$route.query.s">
                                        <label for="supplier_name">Supplier <span>*</span></label>
                                        <input type="text" name="supplier_name" autocomplete="off" class="default_text disabled" v-validate="'required|max:50'" v-model="form.supplier.name">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('supplier_name')">{{ properFormat(errors.first('supplier_name')) }}</span></transition>
                                        <input type="hidden" name="supplier_id" v-model="form.supplier.id">
                                    </div>
                                    <div class="form_group">
                                        <label>Restrict to which studios: <span>*</span></label>
                                        <div class="form_select_custom" v-click-outside="closeCheckboxes">
                                            <span @click="toggleCheckboxes ^= true">{{ studioLabel }}</span>
                                            <div :class="`form_check_custom ${(toggleCheckboxes) ? 'active' : ''}`">
                                                <div class="check_custom select_all">
                                                    <div :class="`custom_action_check ${(checkStudio) ? 'checked' : ''}`" @click.prevent="toggleSelectAllStudio($event)">Select All</div>
                                                </div>
                                                <div class="check_custom" v-for="(studio, key) in studios" :key="key">
                                                    <input type="checkbox" :id="`studio_${key}`" name="studios" v-model="studio.checkedForReal" class="action_check" @change="hasStudio = true">
                                                    <label :for="`studio_${key}`">{{ studio.name }}</label>
                                                </div>
                                            </div>
                                        </div>
                                        <transition name="slide"><span class="validation_errors" v-if="hasStudio">The studios field is required</span></transition>
                                    </div>
                                    <div class="form_flex_radio_alternate">
                                        <label>Is this sellable? <span>*</span></label>
                                        <div class="radio_wrapper">
                                            <div class="form_radio">
                                                <input type="radio" id="sellable_yes" value="Yes" name="sellable" class="action_radio" :checked="res.sellable == 1">
                                                <label for="sellable_yes">Yes</label>
                                            </div>
                                            <div class="form_radio">
                                                <input type="radio" id="sellable_no" value="No" name="sellable" class="action_radio" :checked="res.sellable == 0">
                                                <label for="sellable_no">No</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <div class="title">
                                    <h2 class="form_title">Inventory Pricing</h2>
                                    <h3 class="form_label">Modify the variants to be created.</h3>
                                </div>
                                <a href="javascript:void(0)" class="action_success_btn" @click="addVariant()"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add a Variant</a>
                            </div>
                            <div class="form_main_group alternate_2">
                                <table class="cms_table">
                                    <thead>
                                        <tr>
                                            <th>Variant</th>
                                            <th>SKU ID</th>
                                            <th>Inventory Qty.</th>
                                            <th>Reorder Point</th>
                                            <th>Unit Price (PHP)</th>
                                            <th>Sale Price (PHP)</th>
                                            <th>Refundable</th>
                                            <th v-if="showClose">Action</th>
                                        </tr>
                                    </thead>
                                    <variant ref="productVariant" :unique="key" :type="1" :data-vv-scope="`variant_form_${key}`" :value="variant" v-for="(variant, key) in variants" :key="key" v-if="variants.length > 0" />
                                    <tbody class="no_results" v-else>
                                        <tr>
                                            <td colspan="6">No Result(s) Found.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" :checked="res.enabled">
                                    <label for="enabled">Activate</label>
                                </div>
                                <div class="button_group">
                                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_cancel_btn">Cancel</nuxt-link>
                                    <button type="submit" name="submit" class="action_btn alternate margin">Update</button>
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
    import Foot from '../../../../components/Foot'
    import Variant from '../../../../components/Variant'
    export default {
        components: {
            Foot,
            Variant
        },
        data () {
            return {
                showClose: false,
                name: 'Suppliers',
                access: true,
                loaded: false,
                toggleCheckboxes: false,
                id: 0,
                error: false,
                lastRoute: '',
                prevRoute: '',
                studioLabel: 'Select Studios',
                form: {
                    title: '',
                    category: [],
                    supplier: []
                },
                res: [],
                studios: [],
                categories: [],
                suppliers: [],
                variants: [],
                hasStudio: false
            }
        },
        computed: {
            checkStudio () {
                const me = this
                let count = 0
                let result = false
                me.studios.forEach((data, index) => {
                    if (data.checkedForReal) {
                        count++
                    }
                })
                if (count == me.studios.length) {
                    result = true
                } else {
                    result = false
                }
                return result
            }
        },
        methods: {
            checkStudioValue () {
                const me = this
                let count = 0
                if (me.checkStudio) {
                    me.studios.forEach((data, index) => {
                        if (data.checkedForReal) {
                            count++
                        }
                    })
                }
                if (count == me.studios.length) {
                    me.studioLabel = 'All Studios Selected'
                } else {
                    me.studioLabel = 'Select Studios'
                }
            },
            toggleSelectAllStudio (event) {
                const me = this
                if (me.checkStudio) {
                    me.studios.forEach((data, index) => {
                        data.checkedForReal = false
                        me.hasStudio = true
                        me.studioLabel = 'Select Studios'
                    })
                } else {
                    me.studios.forEach((data, index) => {
                        data.checkedForReal = true
                        me.hasStudio = false
                        me.studioLabel = 'All Studios Selected'
                    })
                }
                if (event.target.classList.contains('checked')) {
                    event.target.classList.remove('checked')
                } else {
                    event.target.classList.add('checked')
                }
            },
            closeCheckboxes () {
                const me = this
                me.toggleCheckboxes = false
            },
            /**
             * Count textarea character length */
            getCount (event) {
                let count = parseInt(event.target.value.length),
                    max = 1000,
                    total = max - count
                document.querySelector('.field_limit').innerText = total
            },
            addVariant () {
                const me = this
                me.variants.push({
                    variant: '',
                    sku_id: '',
                    quantity: '',
                    unit_price: '',
                    sale_price: '',
                    images: [],
                    temporary_id: me.randomString(),
                    variant_id: null
                })
                me.determineIfShowCloser()
            },
            submissionSuccess () {
                const me = this
                let ctr = 0
                me.$validator.validateAll().then(valid => {
                    me.studios.forEach((data, index) => {
                        if (data.checkedForReal) {
                            ctr++
                        }
                    })
                    me.hasStudio = (ctr > 0) ? false : true
                    if (valid && !me.hasStudio) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        formData.append('studios', JSON.stringify(me.studios))
                        me.loader(true)
                        me.$axios.post(`api/inventory/products/${me.$route.params.param}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
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
                        setTimeout( () => {
                            me.$scrollTo('.validation_errors', {
    							offset: -250
    						})
                        }, 10)
                    }
                })
            },
            determineIfShowCloser () {
                const me = this
                let enabledCount = 0
                setTimeout(() => {
                    me.$refs.productVariant.forEach((item, index) => {
                        if (item.show == true) {
                            enabledCount++
                        }
                    })
                    me.showClose = (enabledCount > 1) ? true : false
                }, 10)
            },
            fetchData () {
                const me = this
                me.$axios.get(`api/inventory/products/${me.$route.params.param}`).then(res => {
                    me.res = res.data.product
                    if (me.res.product_variants.length > 0) {
                        me.variants = me.res.product_variants
                        me.determineIfShowCloser()
                    } else {
                        me.variants = [0]
                    }
                    me.studios = me.res.studios
                    me.checkStudioValue()
                    me.loaded = true
                })
                if (me.$route.query.s) {
                    me.$axios.get(`api/suppliers/${me.$route.query.s}`).then(res => {
                        me.form.supplier = res.data.supplier
                    })
                } else {
                    me.$axios.get('api/suppliers').then(res => {
                        me.suppliers = res.data.suppliers.data
                    })
                }
                if (me.$route.query.c) {
                    me.$axios.get(`api/inventory/product-categories/${me.$route.query.c}`).then(res => {
                        me.form.category = res.data.productCategory
                    })
                } else {
                    me.$axios.get('api/inventory/product-categories').then(res => {
                        me.categories = res.data.productCategories
                    })
                }
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData()
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
