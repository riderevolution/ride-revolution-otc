<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionAddSuccess()"v-if="type == 0">
            <div class="modal_wrapper">
                <h2 class="form_title">Add a Category</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_group">
                        <label for="name">Category Name <span>*</span></label>
                        <input type="text" name="name" autocomplete="off" autofocus class="default_text" v-validate="'required|max:100'">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') | properFormat }}</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
        <form id="default_form" class="overlay" @submit.prevent="submissionUpdateSuccess()"v-else>
            <div class="modal_wrapper">
                <h2 class="form_title">Update {{ res.name }}</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_group">
                        <label for="name">Category Name <span>*</span></label>
                        <input type="text" name="name" autocomplete="off" class="default_text" autofocus v-validate="'required|max:100'" v-model="res.name">
                        <transition name="slide"><span class="validation_errors" v-if="errors.has('name')">{{ errors.first('name') | properFormat }}</span></transition>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        props: {
            type: {
                type: Number,
                default: 0
            },
            id: {
                type: Number
            }
        },
        data () {
            return {
                res: []
            }
        },
        filters: {
            properFormat: function (value) {
                let newValue = value.split('The ')[1].split(' field')[0].split('[]')
                if (newValue.length > 1) {
                    newValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                }else {
                    newValue = value.split('The ')[1].split(' field')[0].split('_')
                    if (newValue.length > 1) {
                        let firstValue = newValue[0].charAt(0).toUpperCase() + newValue[0].slice(1)
                        let lastValue = ''
                        for (let i = 1; i < newValue.length; i++) {
                            lastValue += ' ' + newValue[i].charAt(0).toUpperCase() + newValue[i].slice(1)
                        }
                        newValue = firstValue + ' ' + lastValue
                    } else {
                        newValue = value.split('The ')[1].split(' field')[0].charAt(0).toUpperCase() + value.split('The ')[1].split(' field')[0].slice(1)
                    }
                }
                let message = value.split('The ')[1].split(' field')[1]
                return `The ${newValue} field${message}`
            }
        },
        methods: {
            toggleClose () {
                const me = this
                me.$store.state.categoryForm = false
                document.body.classList.remove('no_scroll')
            },
            submissionAddSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        me.loader(true)
                        me.$axios.post('api/inventory/product-categories', formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Added')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            me.$store.state.categoryForm = false
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$parent.fetchData(1)
                                }
                            }, 500)
                            setTimeout( () => {
                                me.loader(false)
                            }, 1000)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            },
            submissionUpdateSuccess () {
                const me = this
                me.$validator.validateAll().then(valid => {
                    if (valid) {
                        let formData = new FormData(document.getElementById('default_form'))
                        formData.append('_method', 'PATCH')
                        me.loader(true)
                        me.$axios.post(`api/inventory/product-categories/${me.id}`, formData).then(res => {
                            setTimeout( () => {
                                if (res.data) {
                                    me.notify('Updated')
                                } else {
                                    me.$store.state.errorList.push('Sorry, Something went wrong')
                                    me.$store.state.errorStatus = true
                                }
                            }, 500)
                        }).catch(err => {
                            me.$store.state.errorList = err.response.data.errors
                            me.$store.state.errorStatus = true
                        }).then(() => {
                            me.$store.state.categoryForm = false
                            setTimeout( () => {
                                if (!me.$store.state.errorStatus) {
                                    me.$parent.fetchData(1)
                                }
                            }, 500)
                            setTimeout( () => {
                                me.loader(false)
                            }, 1000)
                            document.body.classList.remove('no_scroll')
                        })
                    } else {
                        me.$scrollTo('.validation_errors', {
                            container: '.default_modal',
                            offset: -250
                        })
                    }
                })
            }
        },
        async mounted () {
            const me = this
            if (me.id != 0) {
                me.$axios.get(`api/inventory/product-categories/${me.id}`).then(res => {
                    me.res = res.data.productCategory
                })
            }
        }
    }
</script>
