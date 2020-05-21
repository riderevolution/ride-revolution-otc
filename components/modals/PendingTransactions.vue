<template>
    <div class="default_modal">
        <div class="background" @click="toggleClose()"></div>
        <form id="default_form" class="overlay" @submit.prevent="submissionSuccess()">
            <div class="modal_wrapper">
                <h2 class="form_title">Pending Transactions</h2>
                <div class="form_close" @click="toggleClose()"></div>
                <div class="modal_main_group">
                    <div class="form_flex_radio alternate margin new">
                        <div class="form_radio" v-for="(data, key) in res" :key="key">
                            <input type="radio" :id="`transaction_${key}`" :value="data.id" name="transactions" class="action_radio" @change="selectPackage(data, key)">
                            <label :for="`transaction_${key}`">
                                <p>{{ formatDate(data.created_at, true) }}</p>
                                <p class="id alternate">Total Price: {{ totalCount(data.total) }}</p>
                            </label>
                        </div>
                    </div>
                    <div class="form_footer_wrapper">
                        <div class="button_group">
                            <a href="javascript:void(0)" class="action_cancel_btn" @click="toggleClose()">Cancel</a>
                            <button type="submit" name="submit" class="action_success_btn margin alternate">Select</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                res: [],
                transaction_id: 0
            }
        },
        methods: {
            submissionSuccess () {
                const me = this
                if (me.transaction_id != 0) {
                    me.$axios.get(`api/show-payment/${me.transaction_id}`).then(res => {
                        if (res.data) {
                            me.$parent.transaction = res.data.payment
                            me.$store.state.pendingTransactionsStatus = false
                            me.$store.state.customerPendingQuickSaleStatus = true
                            document.body.classList.add('no_scroll')
                        }
                    })
                } else {
                    me.$store.state.errorList = ['Please select a Pending Transaction']
                    me.$store.state.errorStatus = true
                }
            },
            selectPackage (data, key) {
                const me = this
                let element = document.getElementById(`transaction_${key}`)
                me.transaction_id = data.id
                me.res.forEach((value, index) => {
                    if (index == key) {
                        element.parentNode.classList.add('toggled')
                    } else {
                        document.getElementById(`transaction_${index}`).parentNode.classList.remove('toggled')
                    }
                })
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
            toggleClose () {
                const me = this
                me.$store.state.pendingTransactionsStatus = false
                document.body.classList.remove('no_scroll')
            },
        },
        async mounted () {
            const me = this
            if (me.$store.state.pendingCustomerID != 0) {
                me.$axios.get(`api/customers/${me.$store.state.pendingCustomerID}/transactions`).then(res => {
                    if (res.data) {
                        res.data.customer.payments.data.forEach((data, index) => {
                            if (data.status == 'pending') {
                                me.res.push(data)
                            }
                        })
                    }
                })
            }
        }
    }
</script>
