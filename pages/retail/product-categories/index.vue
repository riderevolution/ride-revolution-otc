<template>
    <div class="content">
        <div id="admin" class="cms_dashboard">
            <section id="top_content" class="table" v-if="loaded">
                <div class="action_wrapper">
                    <h1 class="header_title">Product Categories</h1>
                    <div class="actions">
                        <div class="total">Total: {{ totalItems(res.productCategories.length) }}</div>
                        <div class="toggler">
                            <div :class="`status ${(status == 1) ? 'active' : ''}`" @click="toggleOnOff(1)">Activated</div>
                            <div :class="`status ${(status == 0) ? 'active' : ''}`" @click="toggleOnOff(0)">Deactivated</div>
                        </div>
                    </div>
                </div>
                <div class="action_buttons">
                    <a @click="toggleForm(id, 0)" href="javascript:void(0)" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add New Category</a>
                </div>
            </section>
            <section id="content" class="alternate_2" v-if="loaded">
                <div class="cms_taxonomy">
                    <div class="taxonomy_wrapper" v-for="(data, key) in res.productCategories" :key="key">
                        <div class="taxonomy_body">
                            <div class="taxonomy_header">
                                <h2 class="header_title">{{ data.name }}</h2>
                                <div class="taxonomy_actions">
                                    <nuxt-link :to="`/${prevRoute}/products/create?c=${data.id}`" class="action_btn"><svg xmlns="http://www.w3.org/2000/svg" width="17.016" height="17.016" viewBox="0 0 17.016 17.016"><defs></defs><g transform="translate(-553 -381)"><circle class="add" cx="8.508" cy="8.508" r="8.508" transform="translate(553 381)"/><g transform="translate(558.955 386.955)"><line class="add_sign" y2="5.233" transform="translate(2.616 0)"/><line class="add_sign" x2="5.233" transform="translate(0 2.616)"/></g></g></svg>Add Products</nuxt-link>
                                    <a href="javascript:void(0)" class="action_btn margin" @click="toggleForm(data.id, 1)"><svg xmlns="http://www.w3.org/2000/svg" width="21.316" height="16.434" viewBox="0 0 21.316 16.434"> <g transform="translate(-1244 -346.75)"> <path class="edit" d="M1259.684,357.585v4.849H1244.75V347.5h14.934v1.785" transform="translate(0 0)" /> <g transform="translate(1255.311 348.26)"> <line class="edit_sign" x1="9.476" y2="9.476" /> </g> </g> </svg>Edit</a>
                                </div>
                            </div>
                            <div class="taxonomy_content">
                                <table class="cms_table_taxonomy">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Sellable</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="data.products.length > 0">
                                        <tr v-for="(product, key) in data.products" :key="key">
                                            <td>{{ product.name }}</td>
                                            <td>{{ (product.sellable) ? 'Yes' : 'No' }}</td>
                                            <td>
                                                <div class="table_actions">
                                                    <nuxt-link class="table_action_edit" :to="`/${prevRoute}/products/${product.id}/edit?c=${data.id}`">Edit</nuxt-link>
                                                    <a class="table_action_cancel" @click.self="toggleStatus(product.id, 0, 'Deactivated')" href="javascript:void(0)" v-if="status == 1">Deactivate</a>
                                                    <a class="table_action_success" @click.self="toggleStatus(product.id, 1, 'Activated')" href="javascript:void(0)" v-if="status == 0">Activate</a>
                                                </div>
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
                            <div class="taxonomy_footer">
                                <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleDelete(data.id)">Delete Category</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <transition name="fade">
            <confirm-delete v-if="$store.state.deleteStatus" ref="delete" :url="'api/inventory/product-categories'" />
        </transition>
        <transition name="fade">
            <category-form v-if="$store.state.categoryForm" :type="type" :id="id" />
        </transition>
        <transition name="fade">
            <confirm-status v-if="$store.state.confirmStatus" ref="enabled" :status="status" />
        </transition>
        <foot v-if="$store.state.isAuth" />
    </div>
</template>

<script>
    import Foot from '../../../components/Foot'
    import CategoryForm from '../../../components/modals/CategoryForm'
    import ConfirmDelete from '../../../components/modals/ConfirmDelete'
    import ConfirmStatus from '../../../components/modals/ConfirmStatus'
    export default {
        components: {
            Foot,
            CategoryForm,
            ConfirmDelete,
            ConfirmStatus
        },
        data () {
            return {
                status: 1,
                id: 0,
                loaded: false,
                prevRoute: '',
                rowCount: 0,
                res: [],
                type: 0
            }
        },
        methods: {
            toggleStatus (id, enabled, status) {
                const me = this
                me.$store.state.confirmStatus = true
                setTimeout( () => {
                    me.$refs.enabled.confirm.table_name = 'products'
                    me.$refs.enabled.confirm.id = id
                    me.$refs.enabled.confirm.enabled = enabled
                    me.$refs.enabled.confirm.status = status
                    me.$refs.enabled.confirm.type = 'product'
                }, 100)
                document.body.classList.remove('no_scroll')
            },
            toggleOnOff (status) {
                const me = this
                me.status = status
                me.fetchData(status)
            },
            toggleForm (value, type) {
                const me = this
                me.$store.state.categoryForm = true
                document.body.classList.add('no_scroll')
                me.type = type
                if (value != 0) {
                    me.id = value
                }
            },
            toggleDelete (id) {
                const me = this
                me.$store.state.deleteStatus = true
                document.body.classList.add('no_scroll')
                setTimeout( () => {
                    me.$refs.delete.contentID = id
                }, 100)
            },
            fetchData (status) {
                const me = this
                me.loader(true)
                me.$axios.get(`api/inventory/product-categories?enabled=${status}`).then(res => {
                    me.res = res.data
                    me.loaded = true
                }).catch(err => {
                    me.$store.state.errorList = err.response.data.errors
                    me.$store.state.errorStatus = true
                }).then(() => {
                    me.rowCount = document.getElementsByTagName('th').length
                    setTimeout( () => {
                        me.loader(false)
                    }, 500)
                })
            }
        },
        async mounted () {
            const me = this
            me.fetchData(1)
            setTimeout( () => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 300)
            me.prevRoute = me.$route.path.split('/')[me.$route.path.split('/').length - 2]
        }
    }
</script>
