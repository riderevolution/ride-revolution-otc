<template>
    <transition name="fade">
        <div class="content" v-if="loaded">
            <div id="admin" class="cms_dashboard">
                <section id="top_content" class="table">
                    <nuxt-link :to="`/${prevRoute}/${lastRoute}`" class="action_back_btn"><img src="/icons/back-icon.svg"><span>{{ replacer(lastRoute) }}</span></nuxt-link>
                    <div class="action_wrapper">
                        <h1 class="header_title">Update {{ res.name }}</h1>
                    </div>
                </section>
                <section id="content">
                    <form id="default_form" @submit.prevent="submissionSuccess()" enctype="multipart/form-data" v-if="loaded">
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Supplier Information</h2>
                            </div>
                            <div class="form_main_group">
                                <div class="form_group">
                                    <label for="name">Supplier Name <span>*</span></label>
                                    <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required|min:10|max:200'" v-model="res.name">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ properFormat(errors.first('name')) }}</span></transition>
                                </div>
                                <div class="form_group">
                                    <label for="address">Office Address <span>*</span></label>
                                    <input type="text" name="address" autocomplete="off" class="default_text" v-validate="'required'" v-model="res.address">
                                    <transition name="slide"><span class="validation_errors" v-if="errors.has('address')">{{ properFormat(errors.first('address')) }}</span></transition>
                                </div>
                                <div class="form_flex">
                                    <div class="form_group">
                                        <label for="email">Email Address <span>*</span></label>
                                        <input type="email" name="email" autocomplete="off" class="default_text" v-validate="'required|email|max:70'" v-model="res.email">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('email')">{{ properFormat(errors.first('email')) }}</span></transition>
                                    </div>
                                    <div class="form_group">
                                        <label for="contact_number">Contact Number <span>*</span></label>
                                        <input type="text" name="contact_number" autocomplete="off" class="default_text" v-validate="'required|numeric|min:7|max:15'" v-model="res.contact_number">
                                        <transition name="slide"><span class="validation_errors" v-if="errors.has('contact_number')">{{ properFormat(errors.first('contact_number')) }}</span></transition>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form_wrapper">
                            <div class="form_header_wrapper">
                                <h2 class="form_title">Products</h2>
                                <nuxt-link :to="`/${prevRoute}/products/create?s=${res.id}`" class="action_success_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg> Add Product</nuxt-link>
                            </div>
                            <div class="form_main_group alternate_2">
                                <table class="cms_table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>SKU ID</th>
                                            <th>Unit Price (PHP)</th>
                                            <th>Sale Price (PHP)</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(variant, key) in variants" :key="key">
                                            <td>{{ variant.variant }}</td>
                                            <td>{{ variant.sku_id }}</td>
                                            <td>{{ variant.unit_price }}</td>
                                            <td>{{ variant.sale_price }}</td>
                                            <td width="20%">
                                                <div class="table_actions full">
                                                    <div class="table_action_cancel link" @click="toggleDelete(variant.id)">Remove</div>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="form_footer_wrapper">
                            <div class="form_flex">
                                <div class="form_check">
                                    <input type="checkbox" id="enabled" name="enabled" class="action_check" :checked="res.enabled == 1">
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
            <transition name="fade">
                <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="'api/inventory/product-variants'" />
            </transition>
            <foot v-if="$store.state.isAuth" />
        </div>
    </transition>
</template>

<script>
    import Foot from '../../../../components/Foot'
    import ConfirmDelete from '../../../../components/modals/ConfirmDelete'
    export default {
        components: {
            Foot,
            ConfirmDelete
        },
        data () {
            return {
                name: 'Suppliers',
                access: true,
                loaded: false,
                lastRoute: '',
                prevRoute: '',
                res: [],
                variants: []
            }
        },
        methods: {
            toggleDelete (id) {
                const me = this
                me.$store.state.deleteStatus = true
                document.body.classList.add('no_scroll')
                setTimeout( () => {
                    me.$refs.delete.contentID = id
                }, 100)
            },
            submissionSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let token = me.$cookies.get('70hokcotc3hhhn5')
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/suppliers/${me.$route.params.param}`, formData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Content has been Added')
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
            fetchData (status) {
                const me = this
                me.$axios.get(`api/suppliers/${me.$route.params.param}`).then(res => {
                    me.res = res.data.supplier
                    me.variants = []
                    me.res.products.forEach((product, pindex) => {
                        product.product_variants.forEach((variant, vindex) => {
                            me.variants.push(variant)
                        })
                    })
                    me.loaded = true
                })
            }
        },
        async mounted () {
            const me = this
            await me.checkPagePermission(me)
            if (me.access) {
                me.fetchData(1)
            } else {
                me.$nuxt.error({ statusCode: 403, message: 'Something Went Wrong' })
            }
            me.lastRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 3]
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 4]
        }
    }
</script>
